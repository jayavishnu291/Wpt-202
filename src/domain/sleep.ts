// src/domain/sleep.ts  -  PRD 11.1 (sleep onset, wake time, duration) and PRD 9.5.1 (wake point)
// Pure functions: no clock reads, no config reads, no React. Everything arrives as an input.

import {
  MS_PER_DAY,
  MS_PER_MIN,
  MS_PER_SEC,
  offsetMinutesOf,
  toMs,
} from "./timeBridge";
import type { EndReason, Period, Platform, SleepRules } from "./calcTypes";

interface Interval {
  start: number;
  end: number;
}

function toInterval(p: Period): Interval {
  return { start: toMs(p.start), end: toMs(p.end) };
}

/** Joins overlapping stretches so the same minute is never subtracted twice. */
function mergeIntervals(list: Interval[]): Interval[] {
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];
  for (const current of sorted) {
    const last = merged[merged.length - 1];
    if (last && current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push({ start: current.start, end: current.end });
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Night length / nap duration
// ---------------------------------------------------------------------------

/** Minutes from night start to night end (not rounded, so 2 h 59 m 59 s is still under 3 h). */
export function nightLengthMin(startIso: string, endIso: string): number {
  return Math.max(0, (toMs(endIso) - toMs(startIso)) / MS_PER_MIN);
}

/** PRD 11.1(8): a nap shows only its duration (start to end). No estimate is calculated. */
export function napDurationMin(startIso: string, endIso: string): number {
  return Math.round(nightLengthMin(startIso, endIso));
}

// ---------------------------------------------------------------------------
// Wake point (PRD 9.5.1)
// ---------------------------------------------------------------------------

export interface WakePointInput {
  nightStart: string;
  /** Default wake-up time as minutes after local midnight (7:00 am = 420). */
  defaultWakeMin: number;
  rules: Pick<SleepRules, "wakePointMinAfterStartMin" | "wakePointMaxAfterStartMin">;
}

/**
 * For a night with NO ending alarm, the wake point is the EARLIER of:
 *  (a) the next default wake-up time that is at least 3 hours after night start, and
 *  (b) 10 hours after night start.
 * Returns milliseconds since 1970 (turn into a date with new Date(ms)).
 */
export function computeWakePoint(input: WakePointInput): number {
  const startMs = toMs(input.nightStart);
  const offsetMs = offsetMinutesOf(input.nightStart) * MS_PER_MIN;

  const earliestAllowedMs = startMs + input.rules.wakePointMinAfterStartMin * MS_PER_MIN;
  const capMs = startMs + input.rules.wakePointMaxAfterStartMin * MS_PER_MIN;

  // Where is "earliestAllowed" on the local clock, and how far to the next default wake time?
  const localMsOfDay = (((earliestAllowedMs + offsetMs) % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
  const targetMsOfDay = input.defaultWakeMin * MS_PER_MIN;
  const waitMs = (((targetMsOfDay - localMsOfDay) % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;

  const nextDefaultWakeMs = earliestAllowedMs + waitMs; // waitMs = 0 means "exactly 3 h" still qualifies
  return Math.min(nextDefaultWakeMs, capMs);
}

// ---------------------------------------------------------------------------
// Wake time (PRD 11.1 item 4)
// ---------------------------------------------------------------------------

export interface ResolveWakeInput {
  platform: Platform;
  endReason: EndReason;
  /**
   * The moment the night ended: final mission completed, Stop pressed (iPhone, SW-02 off),
   * "I'm awake" tapped, first phone use after the wake point (Android), app opened (iPhone),
   * or the automatic end.
   */
  endAt: string;
  /** Needed when endReason is "wake_point" (output of computeWakePoint, as an ISO string). */
  wakePoint?: string;
  iphoneWakeCapMin: number; // 180
}

/**
 * The wake time used for the estimate, in milliseconds since 1970.
 *  - Alarm / Stop / "I'm awake" / automatic end  -> the moment it happened.
 *  - No ending alarm, Android -> start of the first use after the wake point.
 *  - No ending alarm, iPhone  -> the time the app was opened, but NO LATER than wake point + 3 h.
 */
export function resolveWakeTime(input: ResolveWakeInput): number {
  const endMs = toMs(input.endAt);
  if (input.endReason !== "wake_point") {
    return endMs;
  }
  if (input.platform === "android") {
    return endMs;
  }
  if (!input.wakePoint) {
    throw new Error("resolveWakeTime: iPhone with endReason 'wake_point' needs the wakePoint");
  }
  const capMs = toMs(input.wakePoint) + input.iphoneWakeCapMin * MS_PER_MIN;
  return Math.min(endMs, capMs);
}

// ---------------------------------------------------------------------------
// Onset, use time and estimated sleep (PRD 11.1 items 1-7)
// ---------------------------------------------------------------------------

export interface EstimateSleepInput {
  nightStart: string;
  wakeTime: string;
  /** Detected use periods ([Android] unlocked use / [iPhone] time away with a return). */
  usePeriods: Period[];
  /** Night-pass use still counts as use time for the estimate (Tech Architecture I-13). */
  nightPassPeriods?: Period[];
  /** Unknown periods and phone-off time count as SLEEP: they are accepted but never subtracted. */
  unknownPeriods?: Period[];
  /** Falling-asleep allowance in minutes (settings, default 15). */
  allowanceMin: number;
  /** [iPhone, SW-01 off]: use periods are unknown, so onset = night start + allowance. */
  iphoneSw01Off?: boolean;
  rules: Pick<SleepRules, "settlingWindowMin" | "minUseSec">;
}

export interface SleepEstimate {
  onsetMs: number;
  wakeMs: number;
  /** Minutes of use that fell between onset and wake (these are subtracted). */
  useMin: number;
  /** Estimated sleep in whole minutes, never below 0. */
  estSleepMin: number;
}

export function estimateSleep(input: EstimateSleepInput): SleepEstimate {
  const startMs = toMs(input.nightStart);
  const wakeMs = toMs(input.wakeTime);
  const allowanceMs = input.allowanceMin * MS_PER_MIN;

  // Item 7: iPhone with SW-01 off cannot see use, so nothing is subtracted.
  if (input.iphoneSw01Off) {
    const onsetMs = startMs + allowanceMs;
    return finish(onsetMs, wakeMs, 0);
  }

  // Item 1: only use MORE than 30 seconds counts as a use period.
  const minUseMs = input.rules.minUseSec * MS_PER_SEC;
  const detected = input.usePeriods.map(toInterval).filter((p) => p.end - p.start > minUseMs);
  // Night-pass use counts as use time as-is.
  const passUse = (input.nightPassPeriods ?? []).map(toInterval);
  const allUse = [...detected, ...passUse];

  // Item 2: settling use = use that STARTS within the first 2 hours of the night.
  const settlingLimitMs = startMs + input.rules.settlingWindowMin * MS_PER_MIN;
  const settling = allUse.filter((p) => p.start <= settlingLimitMs);

  // Item 3: onset = later of (night start, end of last settling use) + allowance.
  const lastSettlingEndMs = settling.reduce((latest, p) => Math.max(latest, p.end), startMs);
  const onsetMs = Math.max(startMs, lastSettlingEndMs) + allowanceMs;

  // Item 5: subtract the use that falls between onset and wake.
  let useMs = 0;
  for (const p of mergeIntervals(allUse)) {
    const from = Math.max(p.start, onsetMs);
    const to = Math.min(p.end, wakeMs);
    if (to > from) useMs += to - from;
  }
  // Item 6: unknown periods / phone-off time are NOT subtracted (nothing to do for them).
  return finish(onsetMs, wakeMs, useMs);
}

function finish(onsetMs: number, wakeMs: number, useMs: number): SleepEstimate {
  const sleepMs = Math.max(0, wakeMs - onsetMs - useMs); // never below 0
  return {
    onsetMs,
    wakeMs,
    useMin: useMs / MS_PER_MIN,
    estSleepMin: Math.round(sleepMs / MS_PER_MIN),
  };
}
