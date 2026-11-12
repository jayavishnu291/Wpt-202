// src/domain/score.ts  -  PRD 11.2 (sleep score), FR-AL-30 (30-minute rule), usual bedtime
// Pure functions: no clock reads, no config reads, no React. Every number comes in through `rules`.

import {
  MIN_PER_DAY,
  MS_PER_MIN,
  circularAverageMinutes,
  localMinutesOfDay,
  toMs,
} from "./timeBridge";
import type {
  EndReason,
  MorningAnswer,
  NightKind,
  ScoreRules,
  WakeResult,
} from "./calcTypes";

// ---------------------------------------------------------------------------
// Pickups used for scoring
// ---------------------------------------------------------------------------

/**
 * Detected pickups, raised to at least 1 by a "Yes" answer to the morning question.
 * "No" (or no question at all) adds nothing.
 */
export function pickupsUsedForScoring(
  detectedPickups: number,
  morningAnswer?: MorningAnswer | null,
): number {
  const detected = Math.max(0, detectedPickups);
  return morningAnswer === "yes" ? Math.max(detected, 1) : detected;
}

// ---------------------------------------------------------------------------
// The four score parts
// ---------------------------------------------------------------------------

/** Duration 0-50: 50 x min(1, sleep / goal), rounded. */
export function durationPoints(
  estSleepMin: number,
  sleepGoalMin: number,
  rules: Pick<ScoreRules, "durationMaxPoints">,
): number {
  if (sleepGoalMin <= 0) {
    throw new Error("Sleep goal must be more than 0 minutes");
  }
  const share = Math.min(1, Math.max(0, estSleepMin) / sleepGoalMin);
  return Math.round(rules.durationMaxPoints * share);
}

/** Distance between two clock times on a 24-hour circle (11:50 pm and 12:10 am are 20 apart). */
export function circularGapMin(aMinutesOfDay: number, bMinutesOfDay: number): number {
  const diff = Math.abs(aMinutesOfDay - bMinutesOfDay) % MIN_PER_DAY;
  return Math.min(diff, MIN_PER_DAY - diff);
}

/** Regularity 0-20 from the gap in minutes. Edges are INCLUSIVE: exactly 30 min still earns 20. */
export function regularityPoints(
  gapMin: number,
  rules: Pick<ScoreRules, "regularityBands" | "regularityBeyondPoints">,
): number {
  const bands = [...rules.regularityBands].sort((a, b) => a.maxGapMin - b.maxGapMin);
  for (const band of bands) {
    if (gapMin <= band.maxGapMin) return band.points;
  }
  return rules.regularityBeyondPoints;
}

/** Phone-free 0-20: 0 pickups = 20, 1 = 10, 2 or more = 0 (the last list entry means "or more"). */
export function phoneFreePoints(
  pickupsUsed: number,
  rules: Pick<ScoreRules, "phoneFreePoints">,
): number {
  const table = rules.phoneFreePoints;
  const index = Math.min(Math.max(0, pickupsUsed), table.length - 1);
  return table[index] ?? 0;
}

/** Wake-up 0-10: mission without snooze = 10, with snooze = 5, woke without mission = 0. */
export function wakeUpPoints(
  wakeResult: WakeResult,
  rules: Pick<
    ScoreRules,
    "wakeMissionPoints" | "wakeMissionSnoozedPoints" | "wakeNoMissionPoints"
  >,
): number {
  switch (wakeResult) {
    case "mission":
      return rules.wakeMissionPoints;
    case "mission_snoozed":
      return rules.wakeMissionSnoozedPoints;
    default:
      return rules.wakeNoMissionPoints;
  }
}

// ---------------------------------------------------------------------------
// 30-minute rule (FR-AL-30, iPhone with SW-02 off)
// ---------------------------------------------------------------------------

export interface WakeAfterStopInput {
  /** When the user pressed Stop on the ending alarm (this is when the night ended). */
  stopAt: string;
  /** When the mission was completed, or null if it never was. */
  missionDoneAt: string | null;
  snoozesUsed: number;
  windowMin: number; // 30
}

/**
 * Mission completed within 30 minutes of Stop -> scores normally (10, or 5 with snoozes).
 * Later, or never -> "woke without mission" (0). Exactly 30 minutes still counts as "within".
 */
export function resolveWakeResultAfterStop(input: WakeAfterStopInput): WakeResult {
  if (input.missionDoneAt === null) return "no_mission";
  const waitedMin = (toMs(input.missionDoneAt) - toMs(input.stopAt)) / MS_PER_MIN;
  if (waitedMin > input.windowMin) return "no_mission";
  return input.snoozesUsed > 0 ? "mission_snoozed" : "mission";
}

// ---------------------------------------------------------------------------
// Usual bedtime
// ---------------------------------------------------------------------------

export interface PastNight {
  start: string; // ISO with offset
  kind: NightKind;
  lateStart: boolean;
}

export interface UsualBedtimeInput {
  /** Bedtime from settings, minutes after local midnight (1 pm = 780). */
  settingsBedtimeMin: number;
  /** When bedtime was last changed in S-62. Nights before this do not count (the count restarts). */
  bedtimeChangedAt?: string | null;
  /** Nights BEFORE the one being scored. */
  previousNights: PastNight[];
  rules: Pick<ScoreRules, "usualBedtimeNights">;
}

/**
 * First 7 nights: the bedtime from settings. After that: the average start of the last 7 nights,
 * worked out on a 24-hour circle. Naps and late starts never count (neither toward the first 7
 * nor in the average). Returns whole minutes after midnight (0 = 12:00 am).
 */
export function usualBedtimeMin(input: UsualBedtimeInput): number {
  const changedMs = input.bedtimeChangedAt ? toMs(input.bedtimeChangedAt) : null;
  const counting = input.previousNights
    .filter((n) => n.kind === "night" && !n.lateStart)
    .filter((n) => changedMs === null || toMs(n.start) >= changedMs)
    .sort((a, b) => toMs(a.start) - toMs(b.start));

  const needed = input.rules.usualBedtimeNights;
  if (counting.length < needed) {
    return input.settingsBedtimeMin;
  }
  const lastSeven = counting.slice(counting.length - needed);
  const average = circularAverageMinutes(lastSeven.map((n) => localMinutesOfDay(n.start)));
  return Math.round(average) % MIN_PER_DAY; // whole minute; 1440 wraps back to 0 (midnight)
}

// ---------------------------------------------------------------------------
// The whole score
// ---------------------------------------------------------------------------

export interface ScoreNightInput {
  estSleepMin: number;
  sleepGoalMin: number;
  nightStart: string;
  /** Output of usualBedtimeMin (minutes after midnight). */
  usualBedtimeMin: number;
  detectedPickups: number;
  /** null / undefined when the morning question does not apply. */
  morningAnswer?: MorningAnswer | null;
  endReason: EndReason;
  wakeResult: WakeResult;
  rules: ScoreRules;
}

export interface ScoreResult {
  duration: number;
  regularity: number;
  phoneFree: number;
  wakeUp: number;
  pickupsUsed: number;
  /** True when the night ended by "I'm awake", the wake point or automatically. */
  noAlarmInvolved: boolean;
  score: number;
}

export function scoreNight(input: ScoreNightInput): ScoreResult {
  const { rules } = input;

  const pickupsUsed = pickupsUsedForScoring(input.detectedPickups, input.morningAnswer);
  const duration = durationPoints(input.estSleepMin, input.sleepGoalMin, rules);

  // Regularity compares whole minutes on the clock (23:30:20 counts as 23:30).
  const startMinute = Math.floor(localMinutesOfDay(input.nightStart));
  const gap = circularGapMin(startMinute, input.usualBedtimeMin);
  const regularity = regularityPoints(gap, rules);

  const phoneFree = phoneFreePoints(pickupsUsed, rules);
  const noAlarmInvolved =
    input.endReason === "awake" ||
    input.endReason === "wake_point" ||
    input.endReason === "auto";

  const threeParts = duration + regularity + phoneFree;

  let wakeUp = 0;
  let raw: number;
  if (noAlarmInvolved) {
    // (Duration + Regularity + Phone-free) x 100 / 90, rounded. The 90 is worked out from the rules.
    const bestRegularity = Math.max(
      rules.regularityBeyondPoints,
      ...rules.regularityBands.map((b) => b.points),
    );
    const bestPhoneFree = Math.max(...rules.phoneFreePoints);
    const threePartsMax = rules.durationMaxPoints + bestRegularity + bestPhoneFree;
    raw = Math.round((threeParts * rules.totalMaxPoints) / threePartsMax);
  } else {
    wakeUp = wakeUpPoints(input.wakeResult, rules);
    raw = threeParts + wakeUp;
  }

  const score = Math.min(rules.totalMaxPoints, Math.max(0, raw));
  return { duration, regularity, phoneFree, wakeUp, pickupsUsed, noAlarmInvolved, score };
}
