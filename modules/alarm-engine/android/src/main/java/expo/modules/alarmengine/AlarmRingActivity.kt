
package expo.modules.alarmengine

import android.app.Activity
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class AlarmRingActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= 27) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }

        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
        )

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(40, 40, 40, 40)
        }

        val title = TextView(this).apply {
            text = "WPT202 ALARM"
            textSize = 30f
            gravity = Gravity.CENTER
        }

        val message = TextView(this).apply {
            text = "Your alarm is ringing!"
            textSize = 20f
            gravity = Gravity.CENTER
        }

        val stopButton = Button(this).apply {
            text = "STOP ALARM"
            textSize = 22f

            setOnClickListener {
                val stopIntent = Intent(
                    this@AlarmRingActivity,
                    AlarmRingingService::class.java
                ).apply {
                    action = "STOP"
                }

                startService(stopIntent)
                finish()
            }
        }

        layout.addView(title)
        layout.addView(message)
        layout.addView(stopButton)

        setContentView(layout)
    }
}
