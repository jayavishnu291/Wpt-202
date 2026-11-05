/**
 * Central configuration for app rules.
 * Sources: PRD sections 6.3, 9.3, 9.5, 9.7, 11, 14.4
 * and Tech Architecture section 11.
 * Changes to these values require Product Owner approval.
 */

export const rules = {
  focus: {
    // Tech Architecture 11.1 / FR-FO: grace and pass durations
    graceSeconds: 10,
    passMinutes: 3,

    // FR-FO-01: focus duration presets and custom limits (minutes)
    presetsMinutes: [25, 45, 60],
    customMinMinutes: 10,
    customMaxMinutes: 120,
    customStepMinutes: 5,
    minimumMinutes: 10,

    // Tech Architecture 11.1: flower-size thresholds (minutes)
    flowerSizeBandsMinutes: [25, 60],

    // Tech Architecture 11.1: rare flower probability
    rareFlowerChance: { numerator: 1, denominator: 5 },
  },

  night: {
    // PRD 9.5: bedtime window and late-start period (hours)
    windowBeforeBedtimeHours: 4,
    windowAfterBedtimeHours: 4,
    lateStartHours: 6,

    // Tech Architecture 11.1: night duration limits (hours)
    napLimitHours: 4,
    autoEndHours: 14,
    endingAlarmMinimumAfterStartHours: 3,
    wakePointMinimumHours: 3,
    wakePointMaximumHours: 10,
    iphoneWakeCapHours: 3,

    // Tech Architecture 11.1: night pass duration (minutes)
    passMinutes: 5,
  },

  detection: {
    // Tech Architecture 11.1: pickup and settling thresholds
    pickupAfterSeconds: 30,
    settlingPeriodHours: 2,

    // Tech Architecture 14.2–14.3: monitoring gap limits (minutes)
    focusGapLimitMinutes: 20,
    nightGapLimitMinutes: 45,

    // Tech Architecture 14.2: heartbeat intervals (minutes)
    focusHeartbeatMinutes: 10,
    nightHeartbeatMinutes: 30,

    // FC-2: replace placeholder when the result is confirmed
    iphoneLockSignalWaitLimitSeconds: 0, // set from FC-2 result
  },

  alarms: {
    // Tech Architecture 11.1: alarm limits
    maximumAlarms: 5,
    snoozeCount: 2,
    snoozeDurationMinutes: 5,

    // Tech Architecture 11.1: volume ramp (% and seconds)
    volumeRampStartPercent: 20,
    volumeRampEndPercent: 100,
    volumeRampDurationSeconds: 60,
    missionVolumePercent: 30,
    noInputReturnToFullVolumeSeconds: 30,

    // Tech Architecture 11.1: re-ring settings
    reRingIntervalMinutes: 1,
    maximumReRings: 10,

    // FR-AL-30: 30-minute rule
    thirtyMinuteRuleMinutes: 30,

    // Tech Architecture 11.1: protected-change window (hours)
    protectedChangeWindowHours: 12,

    // Tech Architecture 11.1: maths mission
    mathsMinimumProblems: 1,
    mathsMaximumProblems: 5,

    // Tech Architecture 11.1: shake mission levels
    shakeLevels: [20, 50, 100],

    // Placeholder values: set in a later sprint, PO approval
    shakeStrengthThreshold: 0, // set in a later sprint, PO approval
    lowVolumeLevelPercent: 0, // set in a later sprint, PO approval
  },

  score: {
    // Tech Architecture 11.1: score component weights
    parts: [50, 20, 20, 10],

    // Tech Architecture 11.1: regularity thresholds (minutes)
    regularityStepsMinutes: [30, 60, 90, 120, 150],
    regularityPoints: [20, 16, 12, 8, 4, 0],

    // PRD 9.5: falling-asleep allowance (minutes)
    fallingAsleepAllowanceDefaultMinutes: 15,
    fallingAsleepAllowanceMinMinutes: 0,
    fallingAsleepAllowanceMaxMinutes: 60,
    fallingAsleepAllowanceStepMinutes: 5,

    // PRD 9.5: sleep goal (hours)
    sleepGoalDefaultHours: 8,
    sleepGoalMinHours: 4,
    sleepGoalMaxHours: 12,
    sleepGoalStepMinutes: 30,
  },

  other: {
    // Tech Architecture 11.1: rest nights per sleep-day period
    restNights: 2,
    restPeriodSleepDays: 7,

    // Tech Architecture 11.1: constellation milestones (stars)
    constellationStarMilestones: [7, 30, 100],

    // PRD 9.12: ad-free period after installation
    adFreeInstallDayOffset: 2, // install day + 2 calendar days

    // Tech Architecture 11.1: reminder limits
    maximumRemindersPerDay: 2,
    bedtimeReminderOffsetsMinutes: [0, 15, 30],
    bedtimeReminderDefaultOffsetMinutes: 15,
  },
} as const;

export const switches = {
  "SW-01": true, // iPhone lock detection
  "SW-02": true, // iPhone re-ring
  "SW-03": "A", // iPhone snooze: "A" | "B" | "C"
  "SW-04": true, // iPhone volume ramp
  "SW-05": true, // Android blocking
  "SW-06": true, // Shake mission
  "SW-07": true, // Bigger or rarer flowers
  "SW-08": true, // Seasons album
  "SW-09": true, // Constellations
  "SW-10": true, // Separate block lists
  "SW-11": true, // Focus streak
  "SW-12": true, // Daily focus goal
  "SW-13": true, // Allowed apps
  "SW-14": true, // Bedtime reminder
  "SW-15": true, // Manual sleep correction
  "SW-16": true, // Report details on tap
  "SW-17": true, // Ad-free first 3 days
  "SW-18": true, // Store-rating request
  "SW-19": true, // Skippable setup steps
} as const;

// Tech Architecture 11.2: read on/off switches consistently.
export function isOn(
  id: Exclude<keyof typeof switches, "SW-03">
): boolean {
  return switches[id] === true;
}