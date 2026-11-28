
package expo.modules.alarmengine

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

internal object AlarmEngineConfig {

    private const val PREF = "wpt202_alarm_engine_config"

    private fun prefs(context: Context) =
        context.createDeviceProtectedStorageContext()
            .getSharedPreferences(PREF, Context.MODE_PRIVATE)

    // Text configuration
    fun saveTexts(context: Context, texts: Map<String, Any?>) {
        val json = JSONObject()

        texts.forEach { (key, value) ->
            json.put(key, value?.toString() ?: "")
        }

        prefs(context).edit()
            .putString("texts", json.toString())
            .commit()
    }

    fun text(
        context: Context,
        key: String,
        fallback: String
    ): String {
        val raw = prefs(context)
            .getString("texts", null) ?: return fallback

        return try {
            JSONObject(raw).optString(key, fallback)
        } catch (_: Exception) {
            fallback
        }
    }

    // Volume ramp configuration
    fun saveRamp(
        context: Context,
        startPercent: Int,
        endPercent: Int,
        seconds: Int
    ) {
        prefs(context).edit()
            .putInt("rampStart", startPercent)
            .putInt("rampEnd", endPercent)
            .putInt("rampSeconds", seconds)
            .commit()
    }

    fun rampStart(context: Context) =
        prefs(context).getInt("rampStart", 20)

    fun rampEnd(context: Context) =
        prefs(context).getInt("rampEnd", 100)

    fun rampSeconds(context: Context) =
        prefs(context).getInt("rampSeconds", 60)

    // FC-5 test evidence
    @Synchronized
    fun log(
        context: Context,
        type: String,
        detail: String = ""
    ) {
        val list = readLog(context)

        val entry = JSONObject()
            .put("at", System.currentTimeMillis())
            .put("type", type)
            .put("detail", detail)

        list.put(entry)

        val trimmed = JSONArray()
        val start = maxOf(0, list.length() - 200)

        for (i in start until list.length()) {
            trimmed.put(list.get(i))
        }

        prefs(context).edit()
            .putString("log", trimmed.toString())
            .commit()
    }

    fun readLog(context: Context): JSONArray = try {
        JSONArray(
            prefs(context).getString("log", "[]") ?: "[]"
        )
    } catch (_: Exception) {
        JSONArray()
    }

    fun clearLog(context: Context) {
        prefs(context).edit()
            .putString("log", "[]")
            .commit()
    }
}
