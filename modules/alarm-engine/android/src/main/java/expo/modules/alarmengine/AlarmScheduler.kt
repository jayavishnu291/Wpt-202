package expo.modules.alarmengine

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

internal object AlarmScheduler {
  fun schedule(context: Context, id: Int, whenMs: Long) {
    require(whenMs > System.currentTimeMillis()) { "Alarm must be in the future" }
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !manager.canScheduleExactAlarms()) {
      throw IllegalStateException("Exact alarm access unavailable. Enable Alarms & reminders in system settings.")
    }
    val showIntent = Intent(context, AlarmRingActivity::class.java).apply {
      putExtra("alarm_id", id)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val showPending = PendingIntent.getActivity(context, id, showIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val ringIntent = Intent(context, AlarmReceiver::class.java).apply { putExtra("alarm_id", id) }
    val ringPending = PendingIntent.getBroadcast(context, id, ringIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    manager.setAlarmClock(AlarmManager.AlarmClockInfo(whenMs, showPending), ringPending)
    AlarmStore.save(context, id, whenMs)
  }
  fun cancel(context: Context, id: Int) {
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val intent = Intent(context, AlarmReceiver::class.java)
    val pi = PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE)
    if (pi != null) { manager.cancel(pi); pi.cancel() }
    AlarmStore.remove(context, id)
  }
}
