package expo.modules.blockscreen

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

  private val lock = Any()
  private val entries = ArrayList<BlockLogEntry>()

  fun log(event: String, appClass: AppClass? = null, delayMs: Long = -1L) {
    synchronized(lock) {
      entries.add(BlockLogEntry(System.currentTimeMillis(), event, appClass?.label ?: "", delayMs))
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
