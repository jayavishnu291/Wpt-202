package expo.modules.alarmengine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val accepted = setOf(
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_LOCKED_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      Intent.ACTION_TIME_CHANGED,
      Intent.ACTION_TIMEZONE_CHANGED
    )
    if (intent.action !in accepted) return
    for ((id, time) in AlarmStore.all(context)) {
      if (time > System.currentTimeMillis()) {
        try { AlarmScheduler.schedule(context, id, time) }
        catch (e: Exception) { Log.e("WPT202AlarmEngine", "Reschedule failed for $id", e) }
      } else AlarmStore.remove(context, id)
    }
  }
}
