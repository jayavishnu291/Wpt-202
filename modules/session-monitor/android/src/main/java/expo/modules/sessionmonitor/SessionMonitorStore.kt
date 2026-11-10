package expo.modules.sessionmonitor

import android.content.Context
import android.os.Build
import android.os.SystemClock
import android.provider.Settings
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.UUID

internal data class ActiveSession(
  val id: String,
  val kind: String,
  val plannedEndMs: Long,
)

internal data class SessionEvent(
  val seq: Long,
  val at: String,
  val elapsed: Long,
  val bootCount: Long,
  val type: String,
  val sessionId: String,
  val kind: String? = null,
  val plannedEndMs: Long? = null,
  val detail: String? = null,
) {
  fun toMap(): Map<String, Any> = buildMap {
    put("seq", seq)
    put("at", at)
    put("elapsed", elapsed)
    put("boot_count", bootCount)
    put("type", type)
    put("session_id", sessionId)
    kind?.let { put("kind", it) }
    plannedEndMs?.let { put("planned_end_ms", it) }
    detail?.let { put("detail", it) }
  }

  fun toJson(): JSONObject = JSONObject().apply {
    put("seq", seq)
    put("at", at)
    put("elapsed", elapsed)
    put("boot_count", bootCount)
    put("type", type)
    put("session_id", sessionId)
    kind?.let { put("kind", it) }
    plannedEndMs?.let { put("planned_end_ms", it) }
    detail?.let { put("detail", it) }
  }
}

internal object SessionMonitorStore {
  private const val PREFERENCES = "session_monitor"
  private const val EVENTS_FILE = "session-monitor-events.jsonl"
  private const val ACTIVE_ID = "active_id"
  private const val ACTIVE_KIND = "active_kind"
  private const val PLANNED_END = "planned_end_ms"
  private const val FALLBACK_RECORDED = "alarm_fallback_recorded"
  private val lock = Any()

  fun protectedContext(context: Context): Context =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      context.createDeviceProtectedStorageContext()
    } else {
      context
    }

  private fun preferences(context: Context) =
    protectedContext(context).getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)

  fun activeSession(context: Context): ActiveSession? {
    val prefs = preferences(context)
    val id = prefs.getString(ACTIVE_ID, null) ?: return null
    val kind = prefs.getString(ACTIVE_KIND, null) ?: return null
    val plannedEndMs = prefs.getLong(PLANNED_END, 0L)
    if (plannedEndMs <= 0L) return null
    return ActiveSession(id, kind, plannedEndMs)
  }

  fun startSession(context: Context, kind: String, plannedEndMs: Long): ActiveSession {
    synchronized(lock) {
      check(activeSession(context) == null) { "A session is already active." }
      val session = ActiveSession(UUID.randomUUID().toString(), kind, plannedEndMs)
      val saved = preferences(context).edit()
        .putString(ACTIVE_ID, session.id)
        .putString(ACTIVE_KIND, session.kind)
        .putLong(PLANNED_END, session.plannedEndMs)
        .remove(FALLBACK_RECORDED)
        .commit()
      check(saved) { "Could not persist the active session." }
      appendLocked(context, "session_start", session, plannedEndMs = plannedEndMs)
      return session
    }
  }

  fun endSession(context: Context, session: ActiveSession) {
    synchronized(lock) {
      val alreadyEnded = readEventsLocked(context).any {
        it.sessionId == session.id && it.type == "session_end"
      }
      if (!alreadyEnded) appendLocked(context, "session_end", session)
      clearSessionLocked(context)
    }
  }

  fun clearSession(context: Context) {
    synchronized(lock) {
      clearSessionLocked(context)
    }
  }

  private fun clearSessionLocked(context: Context) {
    val saved = preferences(context).edit()
      .remove(ACTIVE_ID)
      .remove(ACTIVE_KIND)
      .remove(PLANNED_END)
      .remove(FALLBACK_RECORDED)
      .commit()
    check(saved) { "Could not clear the active session." }
  }

  fun append(
    context: Context,
    type: String,
    session: ActiveSession? = activeSession(context),
    plannedEndMs: Long? = null,
    detail: String? = null,
  ): SessionEvent = synchronized(lock) {
    appendLocked(context, type, session, plannedEndMs, detail)
  }

  private fun appendLocked(
    context: Context,
    type: String,
    session: ActiveSession? = activeSession(context),
    plannedEndMs: Long? = null,
    detail: String? = null,
  ): SessionEvent {
    val file = File(protectedContext(context).filesDir, EVENTS_FILE)
    val event = SessionEvent(
      seq = lastSequence(file) + 1L,
      at = timestamp(),
      elapsed = SystemClock.elapsedRealtime(),
      bootCount = bootCount(context),
      type = type,
      sessionId = session?.id.orEmpty(),
      kind = session?.kind,
      plannedEndMs = plannedEndMs,
      detail = detail,
    )
    val needsLineSeparator = file.exists() && file.length() > 0L && !endsWithNewline(file)
    FileOutputStream(file, true).use { stream ->
      if (needsLineSeparator) stream.write(byteArrayOf('\n'.code.toByte()))
      stream.write((event.toJson().toString() + "\n").toByteArray(Charsets.UTF_8))
      stream.fd.sync()
    }
    return event
  }

  private fun lastSequence(file: File): Long {
    if (!file.exists() || file.length() == 0L) return 0L
    RandomAccessFile(file, "r").use { source ->
      var end = source.length()
      source.seek(end - 1L)
      if (source.readByte().toInt() == '\n'.code) end -= 1L
      var start = end - 1L
      while (start >= 0L) {
        source.seek(start)
        if (source.readByte().toInt() == '\n'.code) break
        start -= 1L
      }
      val lineStart = start + 1L
      val lineSize = end - lineStart
      require(lineSize in 1L..16_384L) { "The last session event is incomplete or too large." }
      val bytes = ByteArray(lineSize.toInt())
      source.seek(lineStart)
      source.readFully(bytes)
      return JSONObject(String(bytes, Charsets.UTF_8)).getLong("seq")
    }
  }

  private fun endsWithNewline(file: File): Boolean =
    RandomAccessFile(file, "r").use { source ->
      source.seek(source.length() - 1L)
      source.readByte().toInt() == '\n'.code
    }

  fun readEvents(context: Context): List<SessionEvent> = synchronized(lock) {
    readEventsLocked(context)
  }

  private fun readEventsLocked(context: Context): List<SessionEvent> {
    val file = File(protectedContext(context).filesDir, EVENTS_FILE)
    if (!file.exists()) return emptyList()
    return file.useLines(Charsets.UTF_8) { lines ->
      lines.filter { it.isNotBlank() }.map { line ->
        val json = JSONObject(line)
        SessionEvent(
          seq = json.getLong("seq"),
          at = json.getString("at"),
          elapsed = json.getLong("elapsed"),
          bootCount = json.getLong("boot_count"),
          type = json.getString("type"),
          sessionId = json.getString("session_id"),
          kind = json.optString("kind").takeIf { it.isNotEmpty() },
          plannedEndMs = json.takeIf { it.has("planned_end_ms") }?.getLong("planned_end_ms"),
          detail = json.optString("detail").takeIf { it.isNotEmpty() },
        )
      }.toList()
    }
  }

  fun appendBoot(context: Context) {
    synchronized(lock) {
      val count = bootCount(context)
      val lastBoot = readEventsLocked(context).lastOrNull { it.type == "boot" }
      if (lastBoot?.bootCount != count) appendLocked(context, "boot")
    }
  }

  fun appendShutdownOnce(context: Context) {
    synchronized(lock) {
      val count = bootCount(context)
      val latest = readEventsLocked(context).lastOrNull()
      if (latest?.type != "shutdown" || latest.bootCount != count) {
        appendLocked(context, "shutdown")
      }
    }
  }

  fun recordAlarmFallbackOnce(context: Context, session: ActiveSession) {
    synchronized(lock) {
      val prefs = preferences(context)
      if (prefs.getBoolean(FALLBACK_RECORDED, false)) return
      val saved = prefs.edit().putBoolean(FALLBACK_RECORDED, true).commit()
      check(saved) { "Could not record the alarm fallback state." }
      appendLocked(context, "alarm_fallback", session, detail = "exact_alarm_not_permitted")
    }
  }

  private fun timestamp(): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US)
    formatter.timeZone = TimeZone.getDefault()
    return formatter.format(Date())
  }

  private fun bootCount(context: Context): Long =
    Settings.Global.getInt(context.contentResolver, Settings.Global.BOOT_COUNT, -1).toLong()
}
