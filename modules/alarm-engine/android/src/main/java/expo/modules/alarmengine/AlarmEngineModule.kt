
package expo.modules.alarmengine

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlarmEngineModule : Module() {

    private val context: Context
        get() = requireNotNull(appContext.reactContext)

    override fun definition() = ModuleDefinition {

        Name("AlarmEngine")

        Function("configure") {
            texts: Map<String, Any?>,
            rampStartPercent: Int,
            rampEndPercent: Int,
            rampSeconds: Int ->

            AlarmEngineConfig.saveTexts(context, texts)

            AlarmEngineConfig.saveRamp(
                context,
                rampStartPercent,
                rampEndPercent,
                rampSeconds
            )

            true
        }

        Function("canScheduleExactAlarms") {
            AlarmScheduler.canScheduleExact(context)
        }

        Function("getStatus") {

            val nm = context.getSystemService(
                NotificationManager::class.java
            )

            mapOf(
                "androidVersion" to Build.VERSION.RELEASE,
                "sdk" to Build.VERSION.SDK_INT,
                "brand" to Build.BRAND,
                "model" to Build.MODEL,

                "exactAlarmsAllowed" to
                    AlarmScheduler.canScheduleExact(context),

                "notificationsAllowed" to
                    nm.areNotificationsEnabled(),

                "fullScreenAllowed" to
                    (Build.VERSION.SDK_INT < 34 ||
                        nm.canUseFullScreenIntent()),

                "scheduled" to AlarmStore.all(context).map {
                    (id, at) ->
                    mapOf(
                        "id" to id,
                        "at" to at.toDouble()
                    )
                }
            )
        }

        Function("openExactAlarmSettings") {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {

                context.startActivity(
                    Intent(
                        Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
                    ).apply {
                        data = Uri.parse(
                            "package:${context.packageName}"
                        )

                        addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK
                        )
                    }
                )
            }

            true
        }

        Function("openFullScreenSettings") {

            if (Build.VERSION.SDK_INT >= 34) {

                context.startActivity(
                    Intent(
                        Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT
                    ).apply {

                        data = Uri.parse(
                            "package:${context.packageName}"
                        )

                        addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK
                        )
                    }
                )
            }

            true
        }

        AsyncFunction("scheduleTestAlarm") { timeMs: Double ->

            AlarmScheduler.schedule(
                context,
                1001,
                timeMs.toLong()
            )
        }

        AsyncFunction("cancelTestAlarm") {

            AlarmScheduler.cancel(context, 1001)

            true
        }

        Function("readLog") {

            AlarmEngineConfig.readLog(context).toString()
        }

        Function("clearLog") {

            AlarmEngineConfig.clearLog(context)

            true
        }
    }
}
