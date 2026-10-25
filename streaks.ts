// src/domain/streaks.ts  -  PRD 11.4 (night streak with rest nights, catch-up, focus streak)
// Days are plain "YYYY-MM-DD" text (the sleep day). Nothing here reads the clock.

import { addDays, daysBetween } from "./timeBridge";
import type { StarResult, StreakRules } from "./calcTypes";

export interface NightStreakState {
  current: number;
  /** The best streak is always kept. */
  best: number;
  /** Sleep days on which a rest night was used (the `rest_nights_used` column). */
  restSleepDaysUsed: string[];
  /** The last sleep day that was evaluated (the `last_evaluated_day` column). */
  lastEvaluatedDay: string | null;
}

export function newNightStreakState(): NightStreakState {
  return { current: 0, best: 0, restSleepDaysUsed: [], lastEvaluatedDay: null };
}

/**
 * Evaluate ONE sleep day.
 *  - "star"            -> streak + 1.
 *  - "faint" / "none"  -> uses a rest night if a streak of 1+ exists AND fewer than 2 rest nights were
 *                         used in the last 7 sleep days (this day included in the 7). The streak stays.
 *                         Otherwise the streak resets to 0.
 * "none" means the day had no qualifying night (no night at all, or only nights under 3 hours).
 * Naps are never passed in: they have no effect.
 */
export function evaluateSleepDay(
  state: NightStreakState,
  sleepDay: string,
  outcome: StarResult,
  rules: StreakRules,
): NightStreakState {
  // Already evaluated (or an older day): never count the same day twice.
  if (state.lastEvaluatedDay !== null && daysBetween(state.lastEvaluatedDay, sleepDay) <= 0) {
    return state;
  }

  // Rest nights used in the 7-day window that ends on this sleep day (this day itself not used yet).
  const recentRests = state.restSleepDaysUsed.filter((used) => {
    const ago = daysBetween(used, sleepDay);
    return ago > 0 && ago < rules.restWindowDays;
  });

  if (outcome === "star") {
    const current = state.current + 1;
    return {
      current,
      best: Math.max(state.best, current),
      restSleepDaysUsed: recentRests,
      lastEvaluatedDay: sleepDay,
    };
  }

  // Faint star or no night: try a rest night (only once a streak of at least 1 exists).
  if (state.current >= 1 && recentRests.length < rules.maxRestNights) {
    return {
      current: state.current, // rest nights keep the streak but do NOT increase it
      best: state.best,
      restSleepDaysUsed: [...recentRests, sleepDay],
      lastEvaluatedDay: sleepDay,
    };
  }

  // No rest night available: the streak resets, the best streak stays.
  return {
    current: 0,
    best: state.best,
    restSleepDaysUsed: recentRests,
    lastEvaluatedDay: sleepDay,
  };
}

export interface CatchUpInput {
  /** The LAST sleep day that has fully ended (normally "yesterday" on the phone's calendar). */
  throughDay: string;
  /** Known results for days not yet evaluated. Any day missing from here had no night = "none". */
  outcomesByDay?: Record<string, StarResult>;
  rules: StreakRules;
}

/**
 * Catch-up evaluation when the app is next opened: works through every sleep day after
 * `lastEvaluatedDay` up to `throughDay`, oldest first, so missed days use rest nights or reset
 * exactly as if the app had been open.
 */
export function catchUpNightStreak(state: NightStreakState, input: CatchUpInput): NightStreakState {
  if (state.lastEvaluatedDay === null) return state; // nothing evaluated yet, so no streak to protect
  let next = state;
  let day = addDays(state.lastEvaluatedDay, 1);
  while (daysBetween(day, input.throughDay) >= 0) {
    next = evaluateSleepDay(next, day, input.outcomesByDay?.[day] ?? "none", input.rules);
    day = addDays(day, 1);
  }
  return next;
}

// ---------------------------------------------------------------------------
// Focus streak: consecutive calendar days with at least 1 bloom. No rest days.
// ---------------------------------------------------------------------------

export interface FocusStreakInput {
  /** Every calendar day that has at least 1 bloom, as "YYYY-MM-DD". */
  bloomDays: string[];
  /** Today's local date (passed in; this function never reads the clock). */
  today: string;
  bestSoFar: number;
}

export interface FocusStreak {
  current: number;
  best: number;
}

/**
 * Counts back from today if today already has a bloom, otherwise from yesterday (today is not over,
 * so it cannot break the streak yet). A finished day with no bloom resets the streak to 0.
 */
export function computeFocusStreak(input: FocusStreakInput): FocusStreak {
  const days = new Set(input.bloomDays);
  let cursor = days.has(input.today) ? input.today : addDays(input.today, -1);
  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best: Math.max(input.bestSoFar, current) };
}
