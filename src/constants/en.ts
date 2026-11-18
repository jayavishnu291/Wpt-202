/**
 * src/constants/en.ts
 *
 * WPT 202 - Centralized English Copy (PRD 14.4, PRD 17).
 * All user-facing strings are defined here. No duplicate text should be hardcoded.
 */

export const EN = {
  appName: 'WPT 202',

  common: {
    close: 'Close',
    back: 'Back',
    save: 'Save',
    next: 'Next',
    cancel: 'Cancel',
    estimate: '(estimate)',
    estimated: 'estimated',
  },

  onboarding: {
    // S-01 Welcome
    welcomeTitle: 'Grow flowers by day. Collect stars by night.',
    welcomeMessage:
      'Put your phone down and watch your garden and night sky grow. Free, with no account needed.',
    getStarted: 'Get started',
    getStartedHint: 'Goes to the next screen, How it works',

    // S-02 How it works
    howItWorksFocus: 'Focus to grow flowers',
    howItWorksNight: 'Put your phone down at night to collect stars',
    howItWorksAlarm: 'Wake up with a small mission',

    // S-03 Set your times
    bedtimeLabel: 'Bedtime',
    wakeUpLabel: 'Wake-up time',
    remindBedtime: 'Remind me at bedtime',
  },

  home: {
    title: 'Home',
    todayFocus: "Today's focus",
    nextAlarm: 'Next alarm',
    nightStreak: 'Night streak',
    noAlarmSet: 'No alarm set',
    startFocus: 'Start focus',
    startNight: 'Start night',
    startFocusHint: 'Starts a focus session to grow a flower',
    startNightHint: 'Starts night mode to collect stars',

    // FR-HM-04 Last night card
    lastNightTitle: 'Last night',
    lastNightTapHint: 'Opens morning report',
    starEarned: 'Star earned',
    faintStarEarned: 'Faint star earned',

    // FR-HM-05 No-night message
    noNightMessage: "No night recorded. Tonight's a fresh start.",

    // FR-ON-08 Android app blocking card
    appBlockingTitle: 'Set up app blocking',
    appBlockingDesc: 'Block distracting apps during focus and sleep.',
    setUpButton: 'Set up',
    setUpButtonHint: 'Opens app blocking setup',

    // Units and formatters
    nightsCount: (count: number) => (count === 1 ? '1 night' : `${count} nights`),
    minutesCount: (mins: number) => `${mins} min`,
  },

  garden: {
    flowersCount: (count: number) => `Flowers: ${count}`,
    starsCount: (count: number) => `Stars: ${count}`,
    twinkleActive: 'Twinkling (smooth)',
    twinkleOff: 'Static (Reduce Motion)',
    toggleTwinkle: 'Toggle Twinkle',
    devBuildNotice: 'DEV build (not valid for FC-6 timing)',
    releaseBuildNotice: 'Release build',
  },

  notifications: {
    n01LeaveFocus: 'Your flower is still growing. Come back within 10 seconds.',
    n02FocusComplete: 'Focus complete. A new flower bloomed.',
    n03BedtimeReminder: 'Time to start your night.',
    n04LeaveNight: 'Your night is still running. Come back to keep your star.',
  },

  keyCopy: {
    s13Bloom: 'A new flower bloomed. Added to your garden.',
    s13Bud: 'Your flower stayed a bud this time. Ready for another?',
    s14RestingFocus: 'This app is resting while you focus.',
    s14RestingSleep: 'This app is resting while you sleep.',
    s16FocusQuestion:
      'WPT 202 was closed while you were away. Did you use other apps during your session?',
    s20OutsideWindow: "It's outside your night window.",
    s20NapButton: 'Start as a nap (no star)',
    s20ChangeBedtimeButton: 'Change bedtime',
    s22Under3Hours: "Nights under 3 hours don't earn a star. End anyway?",
    s42MorningQuestion: 'Did you use your phone after starting your night?',
    faintStarDescription: "A faint star tonight. Tomorrow's a fresh sky.",
    scoreEstimateLabel: 'Sleep score (estimate)',
    deleteConfirm: "Delete everything? This can't be undone.",
    iPhoneBlockingNotice: 'App blocking is coming to iPhone soon.',
  },

  placeholders: {
    morningReportTitle: 'Morning Report (S-40)',
    morningReportSubtitle: 'Sleep summary and star reveal',
    focusSetupTitle: 'Focus Setup (S-11)',
    focusSetupSubtitle: 'Choose duration and start session',
    nightModeTitle: 'Night Mode (S-21)',
    nightModeSubtitle: 'Night session in progress',
    outsideWindowNapTitle: 'Outside Night Window (S-20)',
    outsideWindowNapSubtitle: "It's outside your night window",
    appBlockingTitle: 'App Blocking Setup (S-61)',
    appBlockingSubtitle: 'Choose apps to block during focus and sleep',
  },
} as const;

/** Helper to retrieve strings with type-safety. */
export function t<T>(getter: (strings: typeof EN) => T): T {
  return getter(EN);
}

export default EN;
