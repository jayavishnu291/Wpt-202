package expo.modules.blockscreen

import android.content.Context
import android.content.Intent
import android.os.Build

/** Starts and stops the dev test session and reports the blocking status. Never throws. */
object SessionController {

  fun status(context: Context): Map<String, Any> {
    val usageAccess = Permissions.hasUsageAccess(context)
    val overlay = Permissions.canDrawOverlays(context)
    return mapOf(
      "usageAccess" to usageAccess,
      "overlay" to overlay,
      // Both permissions present: blocking CAN work. If not, the app shows "Blocking is off" + Fix.
      "blockingAvailable" to (usageAccess && overlay),
      "sessionRunning" to BlockingState.sessionRunning,
      "blockingActive" to (BlockingState.sessionRunning && BlockingState.blockingActive),
      "permissionLostDuringSession" to BlockingState.permissionLostDuringSession
    )
  }

  /**
   * FR-BL-07: if Usage access or Display over other apps is missing, we do NOT start blocking.
   * The answer simply says "blockingAvailable = false" so the app can show "Blocking is off".
   */
  fun start(
    context: Context,
    blocked: List<String>,
    allowed: List<String>,
    mode: String
  ): Map<String, Any> {
    if (BlockingState.sessionRunning) {
      return status(context)
    }
    if (!Permissions.hasUsageAccess(context) || !Permissions.canDrawOverlays(context)) {
      BlockingState.log("blocking_off_permissions")
      return status(context)
    }

    BlockingState.permissionLostDuringSession = false
    BlockingState.sessionRunning = true
    BlockingState.blockingActive = true

    try {
      val intent = Intent(context, BlockMonitorService::class.java)
      intent.putExtra(BlockingConfig.EXTRA_BLOCKED, blocked.toTypedArray())
      intent.putExtra(BlockingConfig.EXTRA_ALLOWED, allowed.toTypedArray())
      intent.putExtra(
        BlockingConfig.EXTRA_MODE,
        if (mode == BlockingConfig.MODE_SLEEP) BlockingConfig.MODE_SLEEP else BlockingConfig.MODE_FOCUS
      )
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    } catch (e: Exception) {
      BlockingState.sessionRunning = false
      BlockingState.blockingActive = false
      BlockingState.log("start_failed")
    }
    return status(context)
  }

  fun stop(context: Context): Map<String, Any> {
    try {
      context.stopService(Intent(context, BlockMonitorService::class.java))
    } catch (e: Exception) {
      // ignore
    }
    BlockingState.sessionRunning = false
    BlockingState.blockingActive = false
    return status(context)
  }
}
