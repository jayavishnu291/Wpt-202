package expo.modules.alarmengine

import android.content.Context
import org.json.JSONObject

internal object AlarmStore {
  private const val PREF = "wpt202_h2_alarms"
  private const val KEY = "alarms"
  private fun storage(context: Context): Context = context.createDeviceProtectedStorageContext()
  @Synchronized fun save(context: Context, id: Int, whenMs: Long) {
    val data = read(context)
    data.put(id.toString(), whenMs)
    storage(context).getSharedPreferences(PREF, Context.MODE_PRIVATE)
      .edit().putString(KEY, data.toString()).commit()
  }
  @Synchronized fun remove(context: Context, id: Int) {
    val data = read(context)
    data.remove(id.toString())
    storage(context).getSharedPreferences(PREF, Context.MODE_PRIVATE)
      .edit().putString(KEY, data.toString()).commit()
  }
  fun all(context: Context): Map<Int, Long> {
    val data = read(context)
    return data.keys().asSequence().mapNotNull { key ->
      val id = key.toIntOrNull() ?: return@mapNotNull null
      id to data.optLong(key)
    }.toMap()
  }
  private fun read(context: Context): JSONObject = try {
    val deviceContext = storage(context)
    // One-time migration from credential-protected preferences after unlock.
    if (android.os.Build.VERSION.SDK_INT >= 24) {
      val userManager = context.getSystemService(Context.USER_SERVICE) as android.os.UserManager
      if (userManager.isUserUnlocked) {
        val old = context.getSharedPreferences(PREF, Context.MODE_PRIVATE)
        val newPrefs = deviceContext.getSharedPreferences(PREF, Context.MODE_PRIVATE)
        if (old.contains(KEY)) {
          val oldData = JSONObject(old.getString(KEY, "{}") ?: "{}")
          val merged = JSONObject(newPrefs.getString(KEY, "{}") ?: "{}")
          oldData.keys().forEach { key -> if (!merged.has(key)) merged.put(key, oldData.optLong(key)) }
          if (newPrefs.edit().putString(KEY, merged.toString()).commit()) old.edit().remove(KEY).commit()
        }
      }
    }
    JSONObject(deviceContext.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString(KEY, "{}") ?: "{}")
  } catch (_: Exception) { JSONObject() }
}
