// src/domain/calcTypes.ts
// Shared vocabulary for the calculation code. No React / Expo imports here (domain rule).

export type Platform = "android" | "iphone";
export type NightKind = "night" | "nap";

/** Why a night ended (names match the `end_reason` column in PRD section 12). */
export type EndReason =
  | "alarm" // final mission completed
  | "alarm_stop_no_mission" // [iPhone, SW-02 off] Stop pressed on the ending alarm
  | "awake" // "I'm awake"
  | "wake_point" // no ending alarm: first use (Android) / app opened (iPhone) after the wake point
  | "auto"; // automatic end (14 hours)

/** Names match the `wake_result` column. "none" = nobody woke to a mission (no alarm involved). */
export type WakeResult = "mission" | "mission_snoozed" | "no_mission" | "none";

/** Names match the `star` column. */
export type StarResult = "star" | "faint" | "none";

export type MorningAnswer = "yes" | "no";

/** A stretch of time. Both ends are ISO strings WITH an offset, e.g. "2026-10-01T23:00:00+05:30". */
export interface Period {
  start: string;
  end: string;
}

// ---------------------------------------------------------------------------
// Rule values. The services read these from config/rules.ts and pass them in.
// The calculation functions never type these numbers themselves.
// ---------------------------------------------------------------------------

export interface SleepRules {
  settlingWindowMin: number; // PRD 11.1(2): first 2 hours  -> 120
  minUseSec: number; // PRD 11.1(1): use must be MORE than 30 seconds -> 30
  wakePointMinAfterStartMin: number; // PRD 9.5.1: at least 3 hours after night start -> 180
  wakePointMaxAfterStartMin: number; // PRD 9.5.1: at most 10 hours after night start -> 600
  iphoneWakeCapMin: number; // PRD 11.1(4): iPhone wake no later than wake point + 3 h -> 180
}

export interface RegularityBand {
  maxGapMin: number; // "gap <= this many minutes ..."
  points: number; // "... earns this many points"
}

export interface ScoreRules {
  durationMaxPoints: number; // 50
  regularityBands: RegularityBand[]; // [{30,20},{60,16},{90,12},{120,8},{150,4}]
  regularityBeyondPoints: number; // more than the last band -> 0
  phoneFreePoints: number[]; // index = pickups; last entry = "that many or more" -> [20, 10, 0]
  wakeMissionPoints: number; // 10
  wakeMissionSnoozedPoints: number; // 5
  wakeNoMissionPoints: number; // 0
  totalMaxPoints: number; // 100
  missionAfterStopWindowMin: number; // FR-AL-30: 30 minutes
  usualBedtimeNights: number; // 7
}

export interface StarRules {
  minNightMin: number; // 3 hours -> 180
}

export interface StreakRules {
  maxRestNights: number; // 2
  restWindowDays: number; // 7 sleep days
}

export interface MilestoneRules {
  thresholds: number[]; // [7, 30, 100]
}
