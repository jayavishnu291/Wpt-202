package expo.modules.alarmengine
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
class AlarmEngineModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AlarmEngine")
    AsyncFunction("scheduleTestAlarm") { timeMs: Double ->
      val context = requireNotNull(appContext.reactContext)
      val alarmManager =
        context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val triggerTime = timeMs.toLong()
      require(triggerTime > System.currentTimeMillis()) {
        "Alarm time must be in the future"
      }
      val intent = Intent(context, AlarmReceiver::class.java)
      val pendingIntent = PendingIntent.getBroadcast(
        context,
        1001,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      val showIntent = PendingIntent.getActivity(
        context,
        1002,
        context.packageManager.getLaunchIntentForPackage(context.packageName)
          ?: Intent(),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      alarmManager.setAlarmClock(
        AlarmManager.AlarmClockInfo(triggerTime, showIntent),
        pendingIntent
      )
      true
    }
  }
}
