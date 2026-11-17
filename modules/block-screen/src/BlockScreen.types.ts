/** What the app needs to know to show "Blocking is off" (FR-BL-07) or normal blocking. */
export type BlockingStatus = {
  /** "Usage access" is granted (we can see which app is in front). */
  usageAccess: boolean;
  /** "Display over other apps" is granted (we can draw the resting screen). */
  overlay: boolean;
  /** Both permissions are granted: blocking can work. If false, show "Blocking is off: permissions needed" + Fix. */
  blockingAvailable: boolean;
  /** A test session is running. */
  sessionRunning: boolean;
  /** A test session is running AND blocking is really working right now. */
  blockingActive: boolean;
  /** FR-BL-08: a permission was removed during the last session. Show a notice after the session. */
  permissionLostDuringSession: boolean;
};

/** S-14 wording: "...while you focus." or "...while you sleep." */
export type RestingMode = 'focus' | 'sleep';

/** One line of the event log. Never contains a package name, only a class. */
export type BlockLogEntry = {
  /** Time in milliseconds since 1970 (Date.now() style). */
  timeMs: number;
  /** e.g. session_started, overlay_shown, overlay_hidden, go_back, permission_lost, screen_off, screen_on */
  event: string;
  /** own | allowed | blocked | home | never-blockable | other  (empty if not about an app) */
  appClass: string;
  /** For overlay_shown: milliseconds from "app came to front" to "resting screen drawn". -1 if not applicable. */
  delayMs: number;
};
