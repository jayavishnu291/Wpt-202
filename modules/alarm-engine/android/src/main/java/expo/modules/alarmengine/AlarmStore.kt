package expo.modules.alarmengine

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

internal object AlarmStore {
  private const val PREF = "wpt202_h2_alarms"
  private const val KEY = "alarms"
  @Synchronized fun save(context: Context, id: Int, whenMs: Long) {
    val data = read(context)
    data.put(id.toString(), whenMs)
    context.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString(KEY, data.toString()).apply()
  }
  @Synchronized fun remove(context: Context, id: Int) {
    val data = read(context)
    data.remove(id.toString())
    context.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString(KEY, data.toString()).apply()
  }
  fun all(context: Context): Map<Int, Long> {
    val data = read(context)
    return data.keys().asSequence().mapNotNull { key ->
      val id = key.toIntOrNull() ?: return@mapNotNull null
      id to data.optLong(key)
    }.toMap()
  }
  private fun read(context: Context): JSONObject = try {
    JSONObject(context.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString(KEY, "{}") ?: "{}")
  } catch (_: Exception) { JSONObject() }
}
