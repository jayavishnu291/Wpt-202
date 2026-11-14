/**
 * Every sentence and word shown in the app lives here (BR-AC-05). Screens never type text.
 *
 * How to read this file
 *  - Keys are grouped by screen. Use them as t("group.key"), e.g. t("focus.resultBloom").
 *  - Wording is copied word for word from the PRD (section 17, 9.1.1, 9.11, section 9).
 *  - A line marked  // PROPOSED  is NOT written in the PRD (the PRD only describes it).
 *    The Product Owner must approve those. Never change PRD wording without asking the PO.
 *  - {appName}, {count}, {time} ... are filled in by the screen: t("key", { count: 3 }).
 *    The app name is never typed here; screens pass it from config/app.ts.
 *  - Tone (PRD 8.5): kind, short, never shaming; no medical words; at most one "!" per screen.
 *  - Plurals: if a key has a sibling ending in "One" (e.g. streak / streakOne), t() uses it when count is 1.
 */
export const en = {
  common: {
    back: "Back", // PROPOSED
    cancel: "Cancel", // PROPOSED
    done: "Done", // PROPOSED
    fix: "Fix", // PRD AC-ON-3
    later: "Later", // PRD FR-ON-10
    next: "Next", // PRD FR-ON-03
    save: "Save", // PRD FR-ON-04
    yes: "Yes",
    no: "No",
    minutes: "{minutes} min",
    hoursMinutes: "{hours} h {minutes} m", // PRD FR-MR-03 style: "6 h 10 m"
    minutesOnly: "{minutes} m",
    day: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
  },

  // Bottom tabs (PRD 7.1)
  nav: { home: "Home", history: "History", alarms: "Alarms", settings: "Settings" },

  // ---- S-01 to S-05 -------------------------------------------------------
  onboarding: {
    // S-01 Welcome
    welcomeTitle: "Grow flowers by day. Collect stars by night.", // PRD 17 S01
    getStarted: "Get started",
    // S-02 How it works
    howTitle: "How it works",
    howPoint1: "Focus to grow flowers", // PRD 17 S02
    howPoint2: "Put your phone down at night to collect stars",
    howPoint3: "Wake up with a small mission",
    howNext: "Next",
    // S-03 Set your times
    timesTitle: "Set your times",
    bedtimeLabel: "Bedtime",
    wakeTimeLabel: "Wake-up time",
    bedtimeReminder: "Remind me at bedtime",
    timesSave: "Save",
    // S-04 Brand guide [Android]
    brandGuideTitle: "Phone setup", // PROPOSED (PRD names the screen "Brand guide")
    brandGuideIntro: "Some phones close apps to save battery. A few quick settings keep your alarm ringing.", // PROPOSED
    brandGuideOpenSettings: "Open settings", // PRD 9.1.2
    brandGuideLater: "Later", // PRD FR-ON-10
    brandGuideDone: "Done", // PROPOSED
    brands: {
      xiaomi: "Xiaomi, Redmi, POCO", oppo: "Oppo", realme: "Realme", oneplus: "OnePlus", vivo: "Vivo",
      samsung: "Samsung", huawei: "Huawei, Honor", tecno: "Tecno", infinix: "Infinix", // PRD 9.1.2 brand list
    },
    // Example steps from PRD 9.1.2. Quality squad replaces with verified per-brand steps.
    stepAutostart: "Allow autostart",
    stepBattery: "Set battery to No restrictions",
    stepPopup: "Allow display pop-up windows while running in the background",
    stepLock: "Lock the app in recent apps",
    // S-05 Permission explainer sheet (text per permission is in "permissions")
    permissionSheetTitle: "Why we ask", // PROPOSED
    permissionContinue: "Continue", // PROPOSED
    permissionNotNow: "Not now", // PROPOSED
  },

  // ---- PRD 9.1.1 permission explainers (word for word) ---------------------
  permissions: {
    notifications: {
      explainer: "So we can tell you when your flower blooms and remind you at bedtime.",
      refused: "Reminders and leave messages are off.", // PROPOSED (PRD: "No reminders or leave messages; banner in Settings")
    },
    // iPhone alarm permission (AlarmKit usage description). Also goes into the iOS Info.plist.
    alarmsIphone: {
      explainer: "So your alarm can ring even in silent mode.",
      refused: "Alarms are off. Allow alarms so yours can ring.", // PROPOSED (PRD: red banner on the Alarms tab)
    },
    exactAlarms: {
      explainer: "So your alarm rings exactly on time.",
      refused: "Alarms may be late", // PRD 9.1.1
    },
    fullScreenAlarm: {
      explainer: "So the alarm can appear on your lock screen.",
      refused: "Your alarm will ring as a notification instead.", // PROPOSED (PRD: rings with a high-priority notification; banner shown)
    },
    usageAccess: {
      explainer: "So we can see which app is open, never what is inside it. Used only to block apps and count night phone use.",
      refused: "Blocking is off: permissions needed", // PRD FR-BL-07
    },
    overlay: {
      explainer: "So we can show the 'resting' screen when you open a blocked app.",
      refused: "Blocking is off: permissions needed", // PRD FR-BL-07
    },
    // Ad consent form: text comes from the certified consent tool (no text here).
    // Tracking (ATT) prompt: PRD says "standard explanation string" but gives no words.
    trackingIphone: {
      explainer: "This helps show ads that suit you better. You can say no.", // PROPOSED, also needed in Info.plist
    },
  },

  // ---- S-10 Home -----------------------------------------------------------
  home: {
    title: "Home",
    focusToday: "Focus today", // PROPOSED label for "today's focus minutes"
    nextAlarm: "Next alarm",
    nightStreak: "Night streak",
    streak: "{count} nights", // PROPOSED
    streakOne: "{count} night",
    noAlarm: "No alarm set", // PROPOSED
    startFocus: "Start focus", // PRD FR-HM-03
    startNight: "Start night",
    lastNight: "Last night", // PRD FR-HM-04
    noNight: "No night recorded. Tonight's a fresh start.", // PRD 17
    blockingCard: "Set up app blocking", // PRD FR-ON-08
  },

  // ---- S-11 to S-16 Focus --------------------------------------------------
  focus: {
    // S-11 Focus setup
    setupTitle: "Focus", // PROPOSED
    custom: "Custom",
    blockingCount: "Blocking: {count} apps", // PRD FR-FO-02 "Blocking: N apps"
    blockingCountOne: "Blocking: {count} app",
    blockingEdit: "Edit", // PROPOSED ("an edit link")
    iphoneLockWarning: "Keep {appName} open. Locking your phone will count as leaving.", // PRD FR-FO-11b ({appName} = name from config)
    start: "Start", // PRD FR-FO-03
    // S-12 Focus in progress
    runTitle: "Focus in progress", // PRD N-06
    timeLeft: "{time} left", // PROPOSED
    stageSeed: "Seed", stageSprout: "Sprout", stageBud: "Bud", stageBloom: "Bloom", // PRD FR-FO-05 stage names
    takePass: "Take a pass", // PRD FR-FO-04
    giveUp: "Give up",
    giveUpConfirm: "End now? Your flower will stay a bud.", // PRD FR-FO-10
    giveUpYes: "End session", // PROPOSED
    giveUpNo: "Keep going", // PROPOSED
    // S-13 Focus result
    resultTitle: "Focus result", // PROPOSED
    resultBloom: "A new flower bloomed. Added to your garden.", // PRD 17
    resultBud: "Your flower stayed a bud this time. Ready for another?", // PRD 17
    resultAgain: "Start another", // PROPOSED
    resultGarden: "Back to garden", // PROPOSED
    // S-15 Pass active (focus)
    passTitle: "Pass active",
    passBody: "Take a short break. Your timer is paused.", // PROPOSED
    passBack: "Back to focus", // PRD FR-FO-11
    passTimeLeft: "{time} left", // PROPOSED
    // S-16 Focus question
    questionTitle: "Quick question", // PROPOSED
    questionBody: "{appName} was closed while you were away. Did you use other apps during your session?", // PRD 17 S16
    questionNo: "No",
    questionYes: "Yes",
    questionNote: "Your answer can't be changed.", // PROPOSED (PRD FR-FO-19: cannot be changed)
  },

  // ---- S-14 Blocked-app screen [Android] -----------------------------------
  blockedApp: {
    title: "Resting", // PROPOSED
    bodyFocus: "This app is resting while you focus.", // PRD 17 S14
    bodyNight: "This app is resting while you sleep.", // PRD 17 S14 ("...while you sleep.")
    goBack: "Go back", // PRD FR-BL-06
    usePass: "Use pass",
  },

  // ---- S-20 to S-22 Night --------------------------------------------------
  night: {
    // S-20
    outsideTitle: "Outside night window", // PRD 7.2 screen name
    outsideBody: "It's outside your night window.", // PRD 17 S20
    startNap: "Start as a nap (no star)", // PRD FR-NI-02
    changeBedtime: "Change bedtime",
    // S-21
    runTitle: "Night in progress", // PRD N-06
    nextAlarm: "Next alarm {time}", // PROPOSED
    nightPass: "Night pass", // PRD FR-NI-03
    passTimeLeft: "Night pass: {time} left", // PROPOSED
    awake: "I'm awake",
    alarmsLink: "Alarms",
    settingsLink: "Settings",
    noAlarm: "No alarm set. Add one?", // PRD FR-NI-18
    addAlarm: "Add alarm", // PROPOSED button for the line above
    passActiveTitle: "Night pass active", // PROPOSED
    passActiveBody: "Your night clock keeps running.", // PROPOSED
    passBack: "Back to night", // PROPOSED
    // S-22 "I'm awake" confirmation
    awakeTitle: "I'm awake",
    awakeBody: "End your night now?", // PROPOSED (normal case, night of 3 hours or more)
    awakeShortWarning: "Nights under 3 hours don't earn a star. End anyway?", // PRD 17 S22
    awakeConfirm: "End night", // PROPOSED
    awakeConfirmShort: "End anyway", // PROPOSED
    awakeCancel: "Not yet", // PROPOSED
  },

  // ---- S-30 Alarm ringing --------------------------------------------------
  // Android uses these on our own screen. iPhone sends the three "ios" words to Apple's alarm system.
  alarmRinging: {
    title: "Alarm", // PROPOSED
    startMission: "Start mission", // PRD FR-AL-10
    snooze: "Snooze ({count} left)", // PRD FR-AL-10 "Snooze (N left)"
    iosStop: "Stop", // PRD 9.7.3
    iosOpen: "Open",
    iosSnooze: "Snooze",
  },

  // ---- S-31 / S-32 Missions ------------------------------------------------
  mission: {
    mathsTitle: "Solve to stop the alarm", // PROPOSED
    mathsProgress: "Problem {current} of {total}", // PROPOSED
    mathsCheck: "Check", // PROPOSED
    mathsClear: "Clear", // PROPOSED
    mathsWrong: "Not quite. Try again.", // PROPOSED
    shakeTitle: "Shake to stop the alarm", // PROPOSED
    shakeProgress: "{current} of {total} shakes", // PROPOSED
    shakeSwitch: "Can't shake? Solve maths instead", // PRD FR-AL-22
  },

  // ---- S-33 / S-34 Alarms --------------------------------------------------
  alarmList: {
    title: "Alarms",
    add: "Add alarm", // PRD FR-AL-01
    empty: "No alarms yet. Add one to wake up on time.", // PROPOSED
    locked: "Alarms can't be edited while one is ringing.", // PROPOSED (PRD FR-AL-05)
    repeatOnce: "Once", // PROPOSED
    repeatEveryDay: "Every day",
    on: "On",
    off: "Off",
    bannerLate: "Alarms may be late", // PRD 9.1.1
    bannerOff: "Alarms are off. Tap Fix to allow them.", // PROPOSED
  },
  alarmEdit: {
    title: "Edit alarm", // PROPOSED
    titleNew: "New alarm", // PROPOSED
    time: "Time", // field names from PRD FR-AL-02
    repeat: "Repeat",
    label: "Label",
    labelHint: "Label (optional)", // PROPOSED
    mission: "Mission",
    missionMaths: "Maths",
    missionShake: "Shake",
    level: "Level",
    levelEasy: "Easy",
    levelMedium: "Medium",
    levelHard: "Hard",
    problems: "{count} problems", // PROPOSED
    problemsOne: "{count} problem",
    sound: "Sound",
    soundMorningBell: "Morning Bell", // PRD FR-AL-03 default sound
    vibration: "Vibration",
    snooze: "Snooze",
    skipNext: "Skip next alarm", // PRD FR-AL-13
    skipHint: "Finish this alarm's mission first.", // PROPOSED
    save: "Save",
    delete: "Delete alarm", // PROPOSED
  },

  // ---- S-40 to S-42 Morning ------------------------------------------------
  report: {
    title: "Morning report",
    scoreLabel: "Sleep score (estimate)", // PRD 17
    starFull: "A new star tonight.", // PROPOSED
    starFaint: "A faint star tonight. Tomorrow's a fresh sky.", // PRD 17
    starNone: "No star this time. Tomorrow's a fresh sky.", // PROPOSED
    sentenceGreat: "Great night.", // PRD FR-MR-03
    sentenceGood: "Good night.",
    sentenceOkay: "Okay night.",
    sentenceRough: "A rough night. Be kind to yourself.",
    lowestDuration: "You slept {slept}, below your {goal} goal.", // PRD FR-MR-03 / AC-MR-3
    lowestRegularity: "You started earlier or later than your usual bedtime.", // PROPOSED
    lowestPhone: "You used your phone {count} times during the night.", // PROPOSED
    lowestPhoneOne: "You used your phone once during the night.",
    lowestWake: "You needed a snooze or woke without the mission.", // PROPOSED
    estimatedSleep: "Estimated sleep", // PROPOSED label
    pickups: "Pickups",
    streak: "Night streak",
    details: "Details", // PROPOSED
    done: "Done", // PROPOSED
    napTitle: "Nap", // PROPOSED
    napDuration: "Nap: {duration} (estimate)", // PROPOSED
  },
  reportDetails: {
    title: "Night details", // PROPOSED
    duration: "Duration", // score parts, PRD 11.2
    regularity: "Regularity",
    phoneFree: "Phone-free",
    wakeUp: "Wake-up",
    points: "{points} of {max}", // PROPOSED
    onset: "Estimated fall-asleep time", // PROPOSED
    wakeTime: "Wake time",
    pickupTimes: "Pickup times",
    unknownPeriods: "Unknown periods",
    none: "None",
    endReasonLabel: "How the night ended",
    endAlarm: "Alarm mission completed",
    endAwake: "I'm awake",
    endAuto: "Ended automatically",
    edit: "Correct my times",
    save: "Save",
  },
  morningQuestion: {
    title: "Quick question", // PROPOSED
    body: "Did you use your phone after starting your night?", // PRD 17 S42
    no: "No",
    yes: "Yes",
    note: "Your answer can't be changed.", // PROPOSED
  },

  // ---- Notifications (PRD 9.11) --------------------------------------------
  notifications: {
    n01: "Your flower is still growing. Come back within 10 seconds.",
    n02: "Focus complete. A new flower bloomed.",
    n03: "Time to start your night.",
    n04: "Your night is still running. Come back to keep your star.",
    n05: "Alarm",
    n06Focus: "Focus in progress",
    n06Night: "Night in progress",
    n07: "Still awake?",
    // Android notification channel names (FR-NO-05)
    channelAlarms: "Alarms",
    channelSessions: "Sessions",
    channelReminders: "Reminders",
    channelStatus: "Status",
  },

  // ---- Settings, privacy, help, about --------------------------------------
  settings: {
    iphoneBlocking: "App blocking is coming to iPhone soon.", // PRD 17
  },
  privacy: {
    deletePrompt: "Delete everything? This can't be undone.", // PRD 17
    deleteConfirm: "Yes, delete everything", // PROPOSED (PRD FR-PR-04: second confirm button)
    deleteCancel: "Keep my data", // PROPOSED
  },
  help: {
    feedbackSubject: "{appName} feedback", // PRD FR-SU-02 (name passed from config/app.ts)
  },
  about: {
    title: "About", // PROPOSED (S-66: name, version, licences, email, website)
    version: "Version {version}",
    licences: "Open-source licences",
  },

  // ---- Alarm sounds (I10: the 6 free sounds in assets/sounds/) --------------
  sounds: {
    morningBell: "Morning Bell", // PROPOSED
    softChimes: "Soft Chimes", // PROPOSED
    birdsong: "Birdsong", // PROPOSED
    risingTone: "Rising Tone", // PROPOSED
    classicBeep: "Classic Beep", // PROPOSED
    strongBell: "Strong Bell", // PROPOSED
  },
} as const;
