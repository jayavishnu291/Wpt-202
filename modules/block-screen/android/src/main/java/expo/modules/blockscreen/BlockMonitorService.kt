package expo.modules.blockscreen

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.view.Gravity
import android.view.WindowManager

/**
 * Keeps watching which app is in front while a test session runs, and shows the "resting" screen
 * (S-14) over a blocked app. This is the heart of FR-BL-06, FR-BL-07, FR-BL-08 and FR-BL-10.
 *
 * Threads:
 *  - "work" thread: asks Android which app is in front (never on the main thread).
 *  - main thread: draws and removes the overlay window (Android requires this).
 *
 * Rules (PRD 9.4):
 *  - checks run only while the screen is on, and stop when it turns off (FR-BL-10);
 *  - if Usage access or Display over other apps goes away, blocking turns off but the session
 *    carries on, and the app is told so it can show "Blocking is off" (FR-BL-07 / FR-BL-08);
 *  - never-blockable apps are never covered (FR-BL-03);
 *  - nothing here can crash the app: every risky step is wrapped.
 */
class BlockMonitorService : Service() {

  private lateinit var workThread: HandlerThread
  private lateinit var workHandler: Handler
  private val mainHandler = Handler(Looper.getMainLooper())

  private var usageStats: UsageStatsManager? = null
  private var windowManager: WindowManager? = null
  private var powerManager: PowerManager? = null

  // ---- session settings (written once at session start) ----
  private var ownPackage: String = ""
  private var blocked: Set<String> = emptySet()
  private var allowed: Set<String> = emptySet()
  private var night: Boolean = false
  private var neverBlock: NeverBlockSet = NeverBlockSet(emptySet(), emptySet())
  private var sessionBegun: Boolean = false

  // ---- state owned by the WORK thread ----
  @Volatile private var checking: Boolean = false
  private var currentForeground: String = ""
  private var currentForegroundEventTime: Long = 0L
  /** Events at or before this time are ignored (used after "Go back" so old events cannot re-trigger). */
  private var minEventTime: Long = 0L
  /** The blocked app the overlay is currently shown for (null = no overlay wanted). */
  private var overlayShownFor: String? = null

  // ---- state owned by the MAIN thread ----
  private var overlayView: RestingOverlay? = null

  private var receiverRegistered: Boolean = false

  private val screenReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      when (intent?.action) {
        Intent.ACTION_SCREEN_OFF -> workHandler.post { onScreenOff() }
        Intent.ACTION_SCREEN_ON -> workHandler.post { onScreenOn() }
      }
    }
  }

  private val tick = object : Runnable {
    override fun run() {
      try {
        checkOnce()
      } catch (e: Exception) {
        BlockingState.log("check_error")
      }
      if (checking) {
        workHandler.postDelayed(this, BlockingConfig.CHECK_INTERVAL_MS)
      }
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    workThread = HandlerThread("wpt-block-monitor")
    workThread.start()
    workHandler = Handler(workThread.looper)
    ownPackage = packageName
    usageStats = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
    windowManager = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
    powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // Android demands that a foreground service shows its notification right away.
    try {
      startAsForeground()
    } catch (e: Exception) {
      BlockingState.log("service_start_failed")
      BlockingState.sessionRunning = false
      BlockingState.blockingActive = false
      stopSelf()
      return START_NOT_STICKY
    }

    if (intent == null) {
      stopSelf()
      return START_NOT_STICKY
    }
    if (!sessionBegun) {
      sessionBegun = true
      beginSession(intent)
    }
    // START_NOT_STICKY: if Android kills us, we do not restart by ourselves (dev test session only).
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    checking = false
    try {
      workHandler.removeCallbacksAndMessages(null)
    } catch (e: Exception) {
      // ignore
    }
    removeOverlayNow()
    if (receiverRegistered) {
      try {
        unregisterReceiver(screenReceiver)
      } catch (e: Exception) {
        // ignore
      }
      receiverRegistered = false
    }
    try {
      workThread.quitSafely()
    } catch (e: Exception) {
      // ignore
    }
    BlockingState.sessionRunning = false
    BlockingState.blockingActive = false
    BlockingState.log("session_stopped")
    super.onDestroy()
  }

  // ------------------------------------------------------------------ session start

  private fun beginSession(intent: Intent) {
    blocked = intent.getStringArrayExtra(BlockingConfig.EXTRA_BLOCKED)?.toSet() ?: emptySet()
    allowed = intent.getStringArrayExtra(BlockingConfig.EXTRA_ALLOWED)?.toSet() ?: emptySet()
    night = intent.getStringExtra(BlockingConfig.EXTRA_MODE) == BlockingConfig.MODE_SLEEP

    BlockingState.permissionLostDuringSession = false
    BlockingState.sessionRunning = true
    BlockingState.blockingActive = true
    BlockingState.log("session_started")

    registerScreenReceiver()

    workHandler.post {
      // FR-BL-03: work out the default home app, dialler, clock and Settings once, at session start.
      neverBlock = NeverBlockResolver.resolve(this)
      // The user starts the session from our own app, so that is what is in front right now.
      currentForeground = ownPackage
      currentForegroundEventTime = System.currentTimeMillis()
      minEventTime = System.currentTimeMillis()
      overlayShownFor = null
      if (isScreenOn()) {
        startChecking()
      }
    }
  }

  private fun isScreenOn(): Boolean = powerManager?.isInteractive ?: true

  private fun registerScreenReceiver() {
    if (receiverRegistered) return
    val filter = IntentFilter()
    filter.addAction(Intent.ACTION_SCREEN_OFF)
    filter.addAction(Intent.ACTION_SCREEN_ON)
    // Only Android's own screen broadcasts: no export flag is needed for these.
    registerReceiver(screenReceiver, filter)
    receiverRegistered = true
  }

  // ------------------------------------------------------------------ foreground notification (N-06)

  private fun startAsForeground() {
    createStatusChannel()
    val notification = buildStatusNotification()
    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(
        BlockingConfig.STATUS_NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
      )
    } else {
      startForeground(BlockingConfig.STATUS_NOTIFICATION_ID, notification)
    }
  }

  private fun createStatusChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return
    // FR-NO-05: channel "Status" is low importance and silent.
    val channel = NotificationChannel(
      BlockingConfig.STATUS_CHANNEL_ID,
      getString(R.string.status_channel_name),
      NotificationManager.IMPORTANCE_LOW
    )
    channel.setSound(null, null)
    channel.enableVibration(false)
    channel.setShowBadge(false)
    manager.createNotificationChannel(channel)
  }

  @Suppress("DEPRECATION")
  private fun buildStatusNotification(): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, BlockingConfig.STATUS_CHANNEL_ID)
    } else {
      Notification.Builder(this)
    }
    return builder
      .setContentTitle(getString(R.string.status_focus_in_progress))
      .setSmallIcon(android.R.drawable.ic_dialog_info) // placeholder icon for the dev test
      .setOngoing(true)
      .setShowWhen(false)
      .build()
  }

  // ------------------------------------------------------------------ screen on / off (FR-BL-10)

  private fun startChecking() {
    checking = true
    workHandler.removeCallbacks(tick)
    workHandler.post(tick)
  }

  private fun stopChecking() {
    checking = false
    workHandler.removeCallbacks(tick)
  }

  private fun onScreenOff() {
    stopChecking() // saves battery
    if (overlayShownFor != null) {
      overlayShownFor = null
      mainHandler.post { hideOverlay("overlay_hidden") }
    }
    BlockingState.log("screen_off")
  }

  private fun onScreenOn() {
    BlockingState.log("screen_on")
    if (BlockingState.blockingActive) {
      startChecking()
    }
  }

  // ------------------------------------------------------------------ the check (work thread)

  private fun checkOnce() {
    if (!BlockingState.blockingActive) return

    // FR-BL-07 / FR-BL-08: both permissions must still be there.
    if (!Permissions.hasUsageAccess(this) || !Permissions.canDrawOverlays(this)) {
      enterFallback("permission_lost")
      return
    }

    val latest = readLatestForeground(System.currentTimeMillis())
    if (latest != null) {
      currentForeground = latest.first
      currentForegroundEventTime = latest.second
    }

    val appClass = classify(currentForeground)
    if (appClass == AppClass.BLOCKED) {
      if (overlayShownFor != currentForeground) {
        overlayShownFor = currentForeground
        val eventTime = currentForegroundEventTime
        mainHandler.post { showOverlay(eventTime) }
      }
    } else if (overlayShownFor != null) {
      // The user left the blocked app (or our app came back after "Go back").
      overlayShownFor = null
      mainHandler.post { hideOverlay("overlay_hidden") }
    }
  }

  /**
   * Looks for the newest "an activity came to the front" event in the last few seconds.
   * Returns the package and the time of that event, or null if there was none.
   */
  private fun readLatestForeground(now: Long): Pair<String, Long>? {
    val manager = usageStats ?: return null
    val events = manager.queryEvents(now - BlockingConfig.EVENT_LOOKBACK_MS, now) ?: return null
    val event = UsageEvents.Event()
    var newestPackage: String? = null
    var newestTime = 0L
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType != UsageEvents.Event.ACTIVITY_RESUMED) continue
      if (event.timeStamp <= minEventTime) continue
      val eventPackage = event.packageName ?: continue
      if (event.timeStamp >= newestTime) {
        newestPackage = eventPackage
        newestTime = event.timeStamp
      }
    }
    return if (newestPackage != null) Pair(newestPackage, newestTime) else null
  }

  /** The order matters: our app, home and never-blockable apps always win over "blocked". */
  private fun classify(packageName: String): AppClass = when {
    packageName == ownPackage -> AppClass.OWN
    packageName in neverBlock.home -> AppClass.HOME
    packageName in neverBlock.others -> AppClass.NEVER_BLOCKABLE
    packageName in allowed -> AppClass.ALLOWED
    packageName in blocked -> AppClass.BLOCKED
    else -> AppClass.OTHER
  }

  /** Permission lost: no more blocking, session continues, the app can show "Blocking is off". */
  private fun enterFallback(reason: String) {
    BlockingState.blockingActive = false
    BlockingState.permissionLostDuringSession = true
    stopChecking()
    overlayShownFor = null
    mainHandler.post { hideOverlay("overlay_hidden") }
    BlockingState.log(reason)
  }

  // ------------------------------------------------------------------ overlay (main thread)

  private fun showOverlay(eventTime: Long) {
    if (overlayView != null) return
    val manager = windowManager ?: return
    try {
      val message = getString(
        if (night) R.string.resting_message_sleep else R.string.resting_message_focus
      )
      val view = RestingOverlay(this, message, getString(R.string.go_back_button), night) {
        onGoBackPressed()
      }
      manager.addView(view, buildLayoutParams())
      overlayView = view
      view.requestFocus()
      BlockingState.log(
        "overlay_shown",
        AppClass.BLOCKED,
        System.currentTimeMillis() - eventTime
      )
    } catch (e: Exception) {
      // Never crash: treat a refused overlay like a removed permission.
      workHandler.post { enterFallback("overlay_failed") }
    }
  }

  private fun hideOverlay(event: String) {
    val view = overlayView ?: return
    overlayView = null
    try {
      windowManager?.removeViewImmediate(view)
    } catch (e: Exception) {
      // Already gone: fine.
    }
    BlockingState.log(event, AppClass.BLOCKED)
  }

  private fun removeOverlayNow() {
    val view = overlayView ?: return
    overlayView = null
    try {
      windowManager?.removeViewImmediate(view)
    } catch (e: Exception) {
      // ignore
    }
  }

  @Suppress("DEPRECATION")
  private fun overlayWindowType(): Int =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      WindowManager.LayoutParams.TYPE_PHONE
    }

  private fun buildLayoutParams(): WindowManager.LayoutParams {
    // No FLAG_NOT_TOUCHABLE and no FLAG_NOT_FOCUSABLE: the window takes all touches and the Back key.
    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      overlayWindowType(),
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.OPAQUE
    )
    params.gravity = Gravity.TOP or Gravity.START
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      params.layoutInDisplayCutoutMode =
        WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
    }
    return params
  }

  // ------------------------------------------------------------------ "Go back" button

  private fun onGoBackPressed() {
    val clickTime = System.currentTimeMillis()
    // Start our app FIRST, while the overlay is still visible: from Android 15 an app may only open
    // a screen from the background while it still has a visible overlay window.
    if (launchOwnApp()) {
      BlockingState.log("go_back", AppClass.BLOCKED)
      workHandler.post {
        // Old events of the blocked app must not bring the overlay back. The overlay disappears
        // by itself on the next check, as soon as OUR app is reported in front.
        minEventTime = clickTime
      }
    }
  }

  private fun launchOwnApp(): Boolean {
    try {
      val launch = packageManager.getLaunchIntentForPackage(packageName)
      if (launch != null) {
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
        startActivity(launch)
        return true
      }
    } catch (e: Exception) {
      // fall through to the home screen
    }
    return try {
      val home = Intent(Intent.ACTION_MAIN)
      home.addCategory(Intent.CATEGORY_HOME)
      home.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      startActivity(home)
      true
    } catch (e: Exception) {
      false // overlay stays: the blocked app stays blocked
    }
  }
}
