package expo.modules.sessionmonitor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class SessionMonitorAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val session = SessionMonitorStore.activeSession(context) ?: return
    when (intent.action) {
      SessionMonitorAlarmScheduler.ACTION_SESSION_END -> {
        if (System.currentTimeMillis() >= session.plannedEndMs) {
          SessionMonitorService.endAtPlannedTime(context)
        } else {
          SessionMonitorAlarmScheduler.scheduleSessionEnd(context, session)
        }
      }

      SessionMonitorAlarmScheduler.ACTION_HEARTBEAT -> {
        if (System.currentTimeMillis() >= session.plannedEndMs) {
          SessionMonitorService.endAtPlannedTime(context)
        } else if (SessionMonitorService.isRunning) {
          SessionMonitorStore.append(context, "heartbeat", session)
          SessionMonitorAlarmScheduler.scheduleHeartbeat(context, session)
        } else {
          SessionMonitorStore.append(context, "service_found_missing", session)
          SessionMonitorService.start(context)
        }
      }
    }
  }
}

class SessionMonitorBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (
      intent.action != Intent.ACTION_BOOT_COMPLETED &&
      intent.action != Intent.ACTION_LOCKED_BOOT_COMPLETED
    ) return

    SessionMonitorStore.appendBoot(context)
    val session = SessionMonitorStore.activeSession(context) ?: return
    if (System.currentTimeMillis() >= session.plannedEndMs) {
      SessionMonitorStore.endSession(context, session)
      SessionMonitorAlarmScheduler.cancel(context)
      return
    }
    SessionMonitorService.start(context)
  }
}
