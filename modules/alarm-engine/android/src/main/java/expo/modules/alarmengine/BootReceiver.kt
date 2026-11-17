package expo.modules.alarmengine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED && intent.action != "android.intent.action.MY_PACKAGE_REPLACED") return
    for ((id, time) in AlarmStore.all(context)) {
      if (time > System.currentTimeMillis()) try { AlarmScheduler.schedule(context, id, time) }
      catch (e: Exception) { Log.e("WPT202AlarmEngine", "Reschedule failed for $id", e) }
      else AlarmStore.remove(context, id)
    }
  }
}
