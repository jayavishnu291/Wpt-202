
package expo.modules.alarmengine

import android.app.*
import android.content.*
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.*
import android.util.Log
import androidx.core.app.NotificationCompat

class AlarmRingingService : Service() {

    private var player: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    private val channelId = "wpt202_h2_ringing_v2"
    private val notificationId = 4001

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()

        val channel = NotificationChannel(
            channelId,
            "WPT202 Active Alarm",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Alarm ringing and STOP control"
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            enableVibration(true)
            setSound(null, null)
        }

        getSystemService(NotificationManager::class.java)
            .createNotificationChannel(channel)
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        if (intent?.action == "STOP") {
            stopRinging()
            return START_NOT_STICKY
        }

        val alarmId =
            intent?.getIntExtra("alarm_id", 1001) ?: 1001

        val ringIntent = Intent(
            this,
            AlarmRingActivity::class.java
        ).apply {
            putExtra("alarm_id", alarmId)
            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            )
        }

        val fullScreenPendingIntent =
            PendingIntent.getActivity(
                this,
                alarmId,
                ringIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                PendingIntent.FLAG_IMMUTABLE
            )

        val stopIntent = Intent(
            this,
            AlarmRingingService::class.java
        ).apply {
            action = "STOP"
        }

        val stopPendingIntent =
            PendingIntent.getService(
                this,
                alarmId,
                stopIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                PendingIntent.FLAG_IMMUTABLE
            )

        val notification =
            NotificationCompat.Builder(this, channelId)
                .setSmallIcon(
                    android.R.drawable.ic_lock_idle_alarm
                )
                .setContentTitle("WPT202 Alarm Ringing")
                .setContentText(
                    "Your alarm is ringing. Tap STOP to silence."
                )
                .setCategory(
                    NotificationCompat.CATEGORY_ALARM
                )
                .setPriority(
                    NotificationCompat.PRIORITY_MAX
                )
                .setVisibility(
                    NotificationCompat.VISIBILITY_PUBLIC
                )
                .setOngoing(true)
                .setAutoCancel(false)
                .setContentIntent(
                    fullScreenPendingIntent
                )
                .setFullScreenIntent(
                    fullScreenPendingIntent,
                    true
                )
                .addAction(
                    android.R.drawable.ic_media_pause,
                    "STOP ALARM",
                    stopPendingIntent
                )
                .build()

        try {
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(
                    notificationId,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                )
            } else {
                startForeground(
                    notificationId,
                    notification
                )
            }

            startSoundAndVibration()

            Log.i(
                "WPT202AlarmEngine",
                "Alarm ringing service started"
            )

        } catch (e: Exception) {
            Log.e(
                "WPT202AlarmEngine",
                "Alarm ringing failed",
                e
            )
            stopRinging()
        }

        return START_NOT_STICKY
    }

    private fun startSoundAndVibration() {

        if (player == null) {
            val alarmUri =
                RingtoneManager.getDefaultUri(
                    RingtoneManager.TYPE_ALARM
                ) ?: RingtoneManager.getDefaultUri(
                    RingtoneManager.TYPE_NOTIFICATION
                )

            player = MediaPlayer().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(
                            AudioAttributes.USAGE_ALARM
                        )
                        .setContentType(
                            AudioAttributes.CONTENT_TYPE_SONIFICATION
                        )
                        .build()
                )

                setDataSource(
                    this@AlarmRingingService,
                    alarmUri
                )

                isLooping = true
                prepare()
                start()
            }
        }

        if (vibrator == null) {

            vibrator =
                if (Build.VERSION.SDK_INT >= 31) {
                    getSystemService(
                        VibratorManager::class.java
                    ).defaultVibrator
                } else {
                    getSystemService(
                        Context.VIBRATOR_SERVICE
                    ) as Vibrator
                }

            vibrator?.vibrate(
                VibrationEffect.createWaveform(
                    longArrayOf(
                        0, 500, 500
                    ),
                    0
                )
            )
        }
    }

    private fun stopRinging() {

        Log.i(
            "WPT202AlarmEngine",
            "STOP alarm requested"
        )

        player?.run {
            try {
                stop()
            } catch (_: Exception) {
            }
            release()
        }

        player = null

        vibrator?.cancel()
        vibrator = null

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {

        player?.run {
            try {
                stop()
            } catch (_: Exception) {
            }
            release()
        }

        player = null

        vibrator?.cancel()
        vibrator = null

        super.onDestroy()
    }
}
