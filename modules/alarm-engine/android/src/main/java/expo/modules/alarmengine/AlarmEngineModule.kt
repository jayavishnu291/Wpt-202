package expo.modules.alarmengine

import android.app.AlarmManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlarmEngineModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("AlarmEngine")
    Function("canScheduleExactAlarms") {
      val context = requireNotNull(appContext.reactContext)
      val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      Build.VERSION.SDK_INT < Build.VERSION_CODES.S || manager.canScheduleExactAlarms()
    }
    AsyncFunction("scheduleTestAlarm") { timeMs: Double ->
      val context = requireNotNull(appContext.reactContext)
      AlarmScheduler.schedule(context, 1001, timeMs.toLong())
      true
    }
    AsyncFunction("cancelTestAlarm") {
      val context = requireNotNull(appContext.reactContext)
      AlarmScheduler.cancel(context, 1001)
      true
    }
  }
}
