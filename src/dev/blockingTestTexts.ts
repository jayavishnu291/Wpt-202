/**
 * All words used by the dev-only blocking test screen.
 * PRD 14.4 wants all text in one English text file: when the real S-05 / S-61 screens are built,
 * move these into the project's central text file. The three texts marked PRD are copied exactly.
 */
export const BLOCKING_TEST_TEXTS = {
  screenTitle: 'Blocking test (dev only)',

  // PRD 9.1.1, "Usage access [Android]" - exact explainer text.
  usageTitle: 'Usage access',
  usageExplainer:
    'So we can see which app is open, never what is inside it. Used only to block apps and count night phone use.',

  // PRD 9.1.1, "Display over other apps [Android]" - exact explainer text.
  overlayTitle: 'Display over other apps',
  overlayExplainer: "So we can show the 'resting' screen when you open a blocked app.",

  // PRD FR-BL-07 - exact text, shown with a Fix button.
  blockingOff: 'Blocking is off: permissions needed',
  fix: 'Fix',

  // Dev-only wording below (not from the PRD).
  continue: 'Continue',
  notNow: 'Not now',
  usageAccessLabel: 'Usage access',
  overlayLabel: 'Display over other apps',
  granted: 'Granted',
  notGranted: 'Not granted',
  grant: 'Grant',
  pickApps: 'Pick 2 or 3 apps to block (e.g. a game or YouTube)',
  hiddenNote:
    'Not listed because they can never be blocked: phone, emergency calling, clock, Settings, the home screen app and this app.',
  stressLabel: 'Stress test: also try to block the never-blockable apps (they must still open)',
  startSession: 'Start test session',
  stopSession: 'Stop test session',
  sessionRunning: 'Test session is running. Open a blocked app now.',
  sessionStopped: 'No test session running.',
  blockingIsOn: 'Blocking is on.',
  permissionLostNotice:
    'Blocking was turned off during the last session because a permission was removed.',
  eventLog: 'Event log (classes only, never app names)',
  refresh: 'Refresh',
  clearLog: 'Clear log',
  noEvents: 'No events yet.',
  loadingApps: 'Loading apps...',
} as const;
