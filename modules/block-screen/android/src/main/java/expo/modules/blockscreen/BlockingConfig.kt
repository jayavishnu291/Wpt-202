package expo.modules.blockscreen

/**
 * Every number and fixed name of the blocking feature in ONE place (PRD 14.4: rule values in one file).
 */
object BlockingConfig {

  /**
   * How often the front app is checked while the screen is on (FR-BL-10: "about once a second").
   * Worst-case delay of the resting screen = this interval + a few milliseconds of work, and
   * FC-4 / NFR-05 need the screen within 1000 ms in 20 of 20 runs. 500 ms leaves a safe margin.
   * If your mentor wants exactly 1000 ms, change ONLY this number and re-run FC-4.
   */
  const val CHECK_INTERVAL_MS = 500L

  /** Each check looks at the last few seconds of system events (overlap = no event is ever missed). */
  const val EVENT_LOOKBACK_MS = 5_000L

  /** The in-memory event log keeps only the newest entries. */
  const val MAX_LOG_ENTRIES = 200

  const val STATUS_NOTIFICATION_ID = 7202
  const val STATUS_CHANNEL_ID = "wpt202a_status"

  const val EXTRA_BLOCKED = "blocked_packages"
  const val EXTRA_ALLOWED = "allowed_packages"
  const val EXTRA_MODE = "mode"
  const val MODE_FOCUS = "focus"
  const val MODE_SLEEP = "sleep"

  /**
   * Extra safety net for "emergency calling" (FR-BL-03). These are system pieces that handle the
   * lock screen, system dialogs and emergency calls. They can never be picked from the list anyway,
   * but we also refuse to cover them. Confirm this list against Tech Architecture 8.12.
   */
  val SAFETY_NET_PACKAGES: Set<String> = setOf(
    "android",
    "com.android.systemui",
    "com.android.phone",
    "com.android.server.telecom",
    "com.android.emergency"
  )
}
