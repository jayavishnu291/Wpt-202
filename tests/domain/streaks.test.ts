// tests/domain/streaks.test.ts  -  PRD 11.4 (night streak, rest nights, catch-up, focus streak), FR-NI-14
import {
  catchUpNightStreak,
  computeFocusStreak,
  evaluateSleepDay,
  newNightStreakState,
} from "../../src/domain/streaks";
import type { NightStreakState } from "../../src/domain/streaks";
import { sleepDayOutcome } from "../../src/domain/stars";
import { STREAK_RULES } from "./testRules";

const D = (n: number) => `2026-10-${String(n).padStart(2, "0")}`; // D(5) = "2026-10-05"
const state = (over: Partial<NightStreakState> = {}): NightStreakState => ({
  ...newNightStreakState(),
  ...over,
});
const evaluate = (s: NightStreakState, day: number, outcome: "star" | "faint" | "none") =>
  evaluateSleepDay(s, D(day), outcome, STREAK_RULES);

describe("night streak", () => {
  test("a sleep day with a star adds 1 and raises the best streak", () => {
    let s = evaluate(newNightStreakState(), 1, "star");
    expect(s).toMatchObject({ current: 1, best: 1, lastEvaluatedDay: D(1) });
    s = evaluate(s, 2, "star");
    expect(s).toMatchObject({ current: 2, best: 2 });
  });

  test("a faint star uses a rest night: the streak stays the same (it does NOT go up)", () => {
    const s = evaluate(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), 2, "faint");
    expect(s.current).toBe(3);
    expect(s.restSleepDaysUsed).toEqual([D(2)]);
  });

  test("a sleep day with no night uses a rest night too", () => {
    const s = evaluate(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), 2, "none");
    expect(s.current).toBe(3);
    expect(s.restSleepDaysUsed).toEqual([D(2)]);
  });

  test("rest nights only apply once a streak of at least 1 exists", () => {
    const s = evaluate(state({ current: 0, best: 0, lastEvaluatedDay: D(1) }), 2, "faint");
    expect(s.current).toBe(0);
    expect(s.restSleepDaysUsed).toEqual([]); // nothing was "used up"
    const t = evaluate(s, 3, "none");
    expect(t.current).toBe(0);
    expect(t.restSleepDaysUsed).toEqual([]);
  });

  test("the first-ever star starts a streak, and a faint star before it wastes no rest night", () => {
    let s = evaluate(newNightStreakState(), 1, "faint");
    expect(s.restSleepDaysUsed).toEqual([]);
    s = evaluate(s, 2, "star");
    expect(s.current).toBe(1);
  });

  test("at most 2 rest nights in 7 sleep days: the third bad day resets to 0 (best is kept)", () => {
    let s = state({ current: 5, best: 5, lastEvaluatedDay: D(1) });
    s = evaluate(s, 2, "faint"); // rest 1
    expect(s.current).toBe(5);
    s = evaluate(s, 3, "none"); // rest 2
    expect(s.current).toBe(5);
    expect(s.restSleepDaysUsed).toEqual([D(2), D(3)]);
    s = evaluate(s, 4, "faint"); // no rest left
    expect(s.current).toBe(0);
    expect(s.best).toBe(5);
  });

  test("the 7-day window: two rests on days 1 and 2 block day 7, but day 8 is allowed again", () => {
    const afterTwoRests = state({
      current: 5,
      best: 5,
      restSleepDaysUsed: [D(1), D(2)],
      lastEvaluatedDay: D(6),
    });
    // Day 7: rests on day 1 (6 days ago) and day 2 (5 days ago) are both inside the 7-day window.
    expect(evaluate(afterTwoRests, 7, "none").current).toBe(0);
    // Day 8: the rest on day 1 is now 7 days ago = outside the window, so one rest is free again.
    const day8 = evaluate({ ...afterTwoRests, lastEvaluatedDay: D(7) }, 8, "none");
    expect(day8.current).toBe(5);
    expect(day8.restSleepDaysUsed).toEqual([D(2), D(8)]);
  });

  test("after rest nights, the next star carries on from the same streak", () => {
    let s = state({ current: 3, best: 3, lastEvaluatedDay: D(1) });
    s = evaluate(s, 2, "faint");
    s = evaluate(s, 3, "star");
    expect(s.current).toBe(4);
    expect(s.best).toBe(4);
  });

  test("the best streak is always kept, even after a reset and a smaller new streak", () => {
    // Streak of 6 with both rest nights already used on days 1 and 2.
    let s = state({ current: 6, best: 6, restSleepDaysUsed: [D(1), D(2)], lastEvaluatedDay: D(3) });
    s = evaluate(s, 4, "none"); // no rest left -> reset
    expect(s.current).toBe(0);
    s = evaluate(s, 5, "star"); // a new, smaller streak starts
    expect(s).toMatchObject({ current: 1, best: 6 });
  });

  test("the same sleep day is never counted twice", () => {
    const once = evaluate(state({ current: 1, best: 1, lastEvaluatedDay: D(1) }), 2, "star");
    const twice = evaluate(once, 2, "star");
    expect(twice).toEqual(once);
    expect(evaluate(once, 1, "star")).toEqual(once); // an older day is ignored too
  });

  test("naps have no streak effect: a day with only a nap counts as 'no night'", () => {
    const outcome = sleepDayOutcome([{ kind: "nap", star: "none", countedForStar: false }]);
    const s = evaluate(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), 2, outcome);
    expect(s.current).toBe(3); // not 4: the nap did not add 1
    expect(s.restSleepDaysUsed).toEqual([D(2)]); // it used a rest night like any empty day
  });
});

describe("catch-up evaluation when the app is next opened", () => {
  test("missed days are evaluated in order: 2 rest nights, then a reset", () => {
    const s = catchUpNightStreak(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), {
      throughDay: D(4), // app opened on the 5th; days 2, 3 and 4 had no night
      rules: STREAK_RULES,
    });
    expect(s.current).toBe(0);
    expect(s.best).toBe(3);
    expect(s.lastEvaluatedDay).toBe(D(4));
    expect(s.restSleepDaysUsed).toEqual([D(2), D(3)]);
  });

  test("one missed day is covered by a rest night", () => {
    const s = catchUpNightStreak(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), {
      throughDay: D(2),
      rules: STREAK_RULES,
    });
    expect(s.current).toBe(3);
    expect(s.restSleepDaysUsed).toEqual([D(2)]);
  });

  test("known results inside the gap are used (a star on day 3 adds 1)", () => {
    const s = catchUpNightStreak(state({ current: 3, best: 3, lastEvaluatedDay: D(1) }), {
      throughDay: D(3),
      outcomesByDay: { [D(3)]: "star" },
      rules: STREAK_RULES,
    });
    expect(s.current).toBe(4); // day 2 rest (stays 3), day 3 star (+1)
  });

  test("nothing to catch up (already evaluated through that day) changes nothing", () => {
    const start = state({ current: 3, best: 3, lastEvaluatedDay: D(4) });
    expect(catchUpNightStreak(start, { throughDay: D(4), rules: STREAK_RULES })).toEqual(start);
  });

  test("with no evaluated day yet there is no streak to protect, so nothing changes", () => {
    const start = newNightStreakState();
    expect(catchUpNightStreak(start, { throughDay: D(9), rules: STREAK_RULES })).toEqual(start);
  });

  test("a long absence across a month end still works", () => {
    const s = catchUpNightStreak(
      state({ current: 4, best: 4, lastEvaluatedDay: "2026-10-30" }),
      { throughDay: "2026-11-03", rules: STREAK_RULES },
    );
    expect(s.current).toBe(0);
    expect(s.lastEvaluatedDay).toBe("2026-11-03");
  });
});

describe("focus streak: consecutive days with at least 1 bloom, no rest days", () => {
  const focus = (bloomDays: string[], today: number, bestSoFar = 0) =>
    computeFocusStreak({ bloomDays, today: D(today), bestSoFar });

  test("3 days in a row ending today = 3", () => {
    expect(focus([D(3), D(4), D(5)], 5)).toEqual({ current: 3, best: 3 });
  });

  test("today has no bloom YET: yesterday's streak is still alive", () => {
    expect(focus([D(3), D(4)], 5)).toEqual({ current: 2, best: 2 });
  });

  test("a finished day without a bloom resets it (no rest days)", () => {
    // Day 4 has no bloom, and today (day 5) has none yet.
    expect(focus([D(2), D(3)], 5, 2)).toEqual({ current: 0, best: 2 });
    // A bloom today starts again at 1.
    expect(focus([D(2), D(3), D(5)], 5, 2)).toEqual({ current: 1, best: 2 });
  });

  test("a gap in the middle ends the count there", () => {
    expect(focus([D(1), D(2), D(4), D(5)], 5)).toEqual({ current: 2, best: 2 });
  });

  test("the best streak is kept when the current one is smaller", () => {
    expect(focus([D(5)], 5, 9)).toEqual({ current: 1, best: 9 });
  });

  test("two blooms on the same day count as one day", () => {
    expect(focus([D(4), D(4), D(5)], 5)).toEqual({ current: 2, best: 2 });
  });

  test("counts back across a month end", () => {
    expect(
      computeFocusStreak({
        bloomDays: ["2026-10-30", "2026-10-31", "2026-11-01"],
        today: "2026-11-01",
        bestSoFar: 0,
      }),
    ).toEqual({ current: 3, best: 3 });
  });
});
