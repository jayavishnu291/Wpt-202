package expo.modules.sessionmonitor

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

internal object SessionMonitorAlarmScheduler {
  const val ACTION_HEARTBEAT = "expo.modules.sessionmonitor.HEARTBEAT"
  const val ACTION_SESSION_END = "expo.modules.sessionmonitor.SESSION_END"
  private const val HEARTBEAT_REQUEST = 4201
  private const val SESSION_END_REQUEST = 4202

  fun scheduleHeartbeat(context: Context, session: ActiveSession) {
    val intervalMs = if (session.kind == "focus") 10 * 60_000L else 30 * 60_000L
    schedule(context, session, System.currentTimeMillis() + intervalMs, ACTION_HEARTBEAT, HEARTBEAT_REQUEST)
  }

  fun scheduleSessionEnd(context: Context, session: ActiveSession) {
    schedule(context, session, session.plannedEndMs, ACTION_SESSION_END, SESSION_END_REQUEST)
  }

  fun cancel(context: Context) {
    val alarmManager = context.getSystemService(AlarmManager::class.java)
    alarmManager.cancel(pendingIntent(context, ACTION_HEARTBEAT, HEARTBEAT_REQUEST))
    alarmManager.cancel(pendingIntent(context, ACTION_SESSION_END, SESSION_END_REQUEST))
  }

  private fun schedule(
    context: Context,
    session: ActiveSession,
    triggerAtMs: Long,
    action: String,
    requestCode: Int,
  ) {
    val alarmManager = context.getSystemService(AlarmManager::class.java)
    val alarmIntent = pendingIntent(context, action, requestCode)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      SessionMonitorStore.recordAlarmFallbackOnce(context, session)
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, alarmIntent)
      return
    }

    try {
      alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, alarmIntent)
    } catch (error: SecurityException) {
      SessionMonitorStore.recordAlarmFallbackOnce(context, session)
      alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMs, alarmIntent)
    }
  }

  private fun pendingIntent(context: Context, action: String, requestCode: Int): PendingIntent {
    val intent = Intent(context, SessionMonitorAlarmReceiver::class.java).setAction(action)
    return PendingIntent.getBroadcast(
      context,
      requestCode,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
