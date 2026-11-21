package expo.modules.alarmengine

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getIntExtra("alarm_id", 1001)
    Log.i("WPT202AlarmEngine", "Alarm fired id=$id")
    AlarmStore.remove(context, id)
    val service = Intent(context, AlarmRingingService::class.java).putExtra("alarm_id", id)
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(service)
      else context.startService(service)
    } catch (e: Exception) {
      Log.e("WPT202AlarmEngine", "Cannot start ringing service", e)
    }
  }
}
