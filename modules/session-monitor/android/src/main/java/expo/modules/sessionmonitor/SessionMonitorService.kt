package expo.modules.sessionmonitor

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

class SessionMonitorService : Service() {
  private var shutdownReceiverRegistered = false
  private val shutdownReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      if (
        intent.action == Intent.ACTION_SHUTDOWN ||
        intent.action == ACTION_QUICKBOOT_POWEROFF
      ) {
        if (SessionMonitorStore.activeSession(context) != null) {
          SessionMonitorStore.appendShutdownOnce(context)
        }
      }
    }
  }

  override fun onCreate() {
    super.onCreate()
    isRunning = true
    registerShutdownReceiver()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val session = SessionMonitorStore.activeSession(this)
    if (session == null) {
      stopSelf(startId)
      return START_NOT_STICKY
    }

    createNotificationChannel()
    val notification = buildNotification(session)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(
        NOTIFICATION_ID,
        notification,
        ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE,
      )
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
    if (
      intent?.action == ACTION_END_SESSION ||
      System.currentTimeMillis() >= session.plannedEndMs
    ) {
      SessionMonitorStore.endSession(this, session)
      SessionMonitorAlarmScheduler.cancel(this)
      stopSelf(startId)
      return START_NOT_STICKY
    }
    SessionMonitorStore.append(this, "heartbeat", session)
    SessionMonitorAlarmScheduler.scheduleHeartbeat(this, session)
    SessionMonitorAlarmScheduler.scheduleSessionEnd(this, session)
    return START_STICKY
  }

  override fun onDestroy() {
    if (shutdownReceiverRegistered) unregisterReceiver(shutdownReceiver)
    isRunning = false
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun registerShutdownReceiver() {
    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_SHUTDOWN)
      addAction(ACTION_QUICKBOOT_POWEROFF)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(shutdownReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(shutdownReceiver, filter)
    }
    shutdownReceiverRegistered = true
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val channel = NotificationChannel(
      STATUS_CHANNEL,
      "Status",
      NotificationManager.IMPORTANCE_LOW,
    ).apply {
      description = "Silent session status"
      setSound(null, null)
      enableVibration(false)
      enableLights(false)
      setShowBadge(false)
    }
    getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
  }

  private fun buildNotification(session: ActiveSession): Notification {
    val title = when (session.kind) {
      "focus" -> "Focus in progress"
      "night" -> "Night in progress"
      else -> "Nap in progress"
    }
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, STATUS_CHANNEL)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    builder.setSmallIcon(R.drawable.session_monitor_notification)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      builder.setSilent(true)
    } else {
      @Suppress("DEPRECATION")
      builder.setSound(null).setVibrate(longArrayOf(0L)).setLights(0, 0, 0)
    }
    return builder
      .setContentTitle(title)
      .setCategory(Notification.CATEGORY_SERVICE)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(false)
      .build()
  }

  companion object {
    private const val NOTIFICATION_ID = 4203
    private const val STATUS_CHANNEL = "session_status"
    private const val ACTION_END_SESSION = "expo.modules.sessionmonitor.END_SESSION"
    private const val ACTION_QUICKBOOT_POWEROFF = "android.intent.action.QUICKBOOT_POWEROFF"

    @Volatile
    var isRunning: Boolean = false
      private set

    fun start(context: Context) {
      val intent = Intent(context, SessionMonitorService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.stopService(Intent(context, SessionMonitorService::class.java))
    }

    fun endAtPlannedTime(context: Context) {
      val intent = Intent(context, SessionMonitorService::class.java).setAction(ACTION_END_SESSION)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }
  }
}
