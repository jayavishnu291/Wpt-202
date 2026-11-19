package expo.modules.blockscreen

import android.os.SystemClock
import java.time.OffsetDateTime

/**
 * The only kinds of app we ever write into the event log (Tech Architecture 6 / task card).
 * We never store package names in logs: only this class.
 */
enum class AppClass(val label: String) {
  OWN("own"),
  ALLOWED("allowed"),
  BLOCKED("blocked"),
  HOME("home"),
  NEVER_BLOCKABLE("never-blockable"),
  OTHER("other")
}

/** One line of the event log. No package name inside, on purpose. */
data class BlockLogEntry(
  val seq: Long,
  /** Wall time with offset, e.g. 2026-11-16T10:15:30+05:30. */
  val at: String,
  /** Monotonic time since the phone started; not changed by clock changes. */
  val elapsedMs: Long,
  val bootCount: Int,
  /** Kept so the test screen keeps working. */
  val timeMs: Long,
  val event: String,
  val appClass: String,
  /** Milliseconds between "the app came to the front" and "the resting screen was drawn". -1 = not applicable. */
  val delayMs: Long
)

/**
 * Small shared notice board between the service (which works in the background) and the module
 * (which answers JavaScript). Both live in the same app process.
 */
object BlockingState {

  @Volatile var sessionRunning: Boolean = false
  /** True while the test session is running AND both permissions are still there. */
  @Volatile var blockingActive: Boolean = false
  /** FR-BL-08: set when a permission disappeared during the session; the app shows a notice afterwards. */
  @Volatile var permissionLostDuringSession: Boolean = false
  /** Phone restart counter, set by the service when it starts. */
  @Volatile var bootCount: Int = 0

  private val lock = Any()
  private val entries = ArrayList<BlockLogEntry>()
  private var nextSeq = 0L

  fun log(event: String, appClass: AppClass? = null, delayMs: Long = -1L) {
    synchronized(lock) {
      entries.add(
        BlockLogEntry(
          seq = nextSeq++,
          at = OffsetDateTime.now().toString(),
          elapsedMs = SystemClock.elapsedRealtime(),
          bootCount = bootCount,
          timeMs = System.currentTimeMillis(),
          event = event,
          appClass = appClass?.label ?: "",
          delayMs = delayMs
        )
      )
      while (entries.size > BlockingConfig.MAX_LOG_ENTRIES) {
        entries.removeAt(0)
      }
    }
  }

  /** Oldest first. Numbers are Doubles because that is the safest number type to hand to JavaScript. */
  fun snapshot(): List<Map<String, Any>> {
    synchronized(lock) {
      return entries.map {
        mapOf<String, Any>(
          "seq" to it.seq.toDouble(),
          "at" to it.at,
          "elapsedMs" to it.elapsedMs.toDouble(),
          "bootCount" to it.bootCount.toDouble(),
          "timeMs" to it.timeMs.toDouble(),
          "event" to it.event,
          "appClass" to it.appClass,
          "delayMs" to it.delayMs.toDouble()
        )
      }
    }
  }

  fun clearLog() {
    synchronized(lock) { entries.clear() }
  }
}