// tests/domain/score.test.ts  -  PRD 11.2, FR-AL-30, AC-AL-9, AC-NI-10, AC-NI-17
import {
  circularGapMin,
  durationPoints,
  phoneFreePoints,
  pickupsUsedForScoring,
  regularityPoints,
  resolveWakeResultAfterStop,
  scoreNight,
  usualBedtimeMin,
  wakeUpPoints,
} from "../../src/domain/score";
import type { PastNight, ScoreNightInput } from "../../src/domain/score";
import { decideStar } from "../../src/domain/stars";
import { at, clock } from "./testHelpers";
import { SCORE_RULES, SLEEP_GOAL_MIN, STAR_RULES } from "./testRules";

// A perfect night: 8 h of sleep, started exactly at the usual bedtime, no pickups, woke to a mission.
const BASE: ScoreNightInput = {
  estSleepMin: 480,
  sleepGoalMin: SLEEP_GOAL_MIN,
  nightStart: at(0, "23:00"),
  usualBedtimeMin: clock("23:00"),
  detectedPickups: 0,
  endReason: "alarm",
  wakeResult: "mission",
  rules: SCORE_RULES,
};
const score = (overrides: Partial<ScoreNightInput> = {}) => scoreNight({ ...BASE, ...overrides });

function normalNight(dayOffset: number, hhmm: string): PastNight {
  return { start: at(dayOffset, hhmm), kind: "night", lateStart: false };
}

describe("duration points (0-50)", () => {
  test("50 x min(1, sleep / goal), rounded", () => {
    expect(durationPoints(480, 480, SCORE_RULES)).toBe(50);
    expect(durationPoints(240, 480, SCORE_RULES)).toBe(25);
    expect(durationPoints(465, 480, SCORE_RULES)).toBe(48); // 48.44 -> 48
    expect(durationPoints(455, 480, SCORE_RULES)).toBe(47); // 47.40 -> 47
    expect(durationPoints(0, 480, SCORE_RULES)).toBe(0);
  });
  test("more sleep than the goal still gives at most 50", () => {
    expect(durationPoints(600, 480, SCORE_RULES)).toBe(50);
  });
  test("a sleep goal of 0 is refused loudly", () => {
    expect(() => durationPoints(100, 0, SCORE_RULES)).toThrow();
  });
});

describe("regularity points (0-20): band edges are inclusive", () => {
  test.each([
    [0, 20],
    [30, 20], // exactly 30 -> still 20
    [31, 16], // 31 -> 16
    [60, 16],
    [61, 12],
    [90, 12],
    [91, 8],
    [120, 8],
    [121, 4],
    [150, 4], // exactly 150 -> still 4
    [151, 0], // 151 -> 0
    [400, 0],
  ])("gap of %i minutes = %i points", (gap, points) => {
    expect(regularityPoints(gap, SCORE_RULES)).toBe(points);
  });

  test("the gap is measured on the 24-hour circle, through the full score", () => {
    // Usual bedtime 11:00 pm.
    expect(score({ nightStart: at(0, "23:30") }).regularity).toBe(20); // 30 later
    expect(score({ nightStart: at(0, "23:31") }).regularity).toBe(16); // 31 later
    expect(score({ nightStart: at(0, "22:30") }).regularity).toBe(20); // 30 earlier
    expect(score({ nightStart: at(0, "22:29") }).regularity).toBe(16); // 31 earlier
    expect(score({ nightStart: at(1, "01:30") }).regularity).toBe(4); // 150 later, across midnight
    expect(score({ nightStart: at(1, "01:31") }).regularity).toBe(0); // 151 later, across midnight
  });

  test("seconds do not push a night over an edge (11:30:20 pm counts as 11:30 pm)", () => {
    expect(score({ nightStart: at(0, "23:30", 20) }).regularity).toBe(20);
  });

  test("circularGapMin goes the short way round midnight", () => {
    expect(circularGapMin(clock("23:50"), clock("00:10"))).toBe(20);
    expect(circularGapMin(clock("00:10"), clock("23:50"))).toBe(20);
    expect(circularGapMin(clock("06:00"), clock("18:00"))).toBe(720);
  });
});

describe("phone-free points (0-20) and wake-up points (0-10)", () => {
  test("0 pickups = 20, 1 = 10, 2 or more = 0", () => {
    expect(phoneFreePoints(0, SCORE_RULES)).toBe(20);
    expect(phoneFreePoints(1, SCORE_RULES)).toBe(10);
    expect(phoneFreePoints(2, SCORE_RULES)).toBe(0);
    expect(phoneFreePoints(7, SCORE_RULES)).toBe(0);
  });
  test("mission without snooze = 10, with snooze = 5, no mission = 0", () => {
    expect(wakeUpPoints("mission", SCORE_RULES)).toBe(10);
    expect(wakeUpPoints("mission_snoozed", SCORE_RULES)).toBe(5);
    expect(wakeUpPoints("no_mission", SCORE_RULES)).toBe(0);
    expect(wakeUpPoints("none", SCORE_RULES)).toBe(0);
  });
});

describe('the morning question: "Yes" = at least 1 pickup, "No" adds nothing', () => {
  test('"Yes" with 0 detected pickups -> 1 pickup used, phone-free = 10 and a FAINT star', () => {
    expect(pickupsUsedForScoring(0, "yes")).toBe(1);
    const result = score({ detectedPickups: 0, morningAnswer: "yes" });
    expect(result.pickupsUsed).toBe(1);
    expect(result.phoneFree).toBe(10);

    const star = decideStar({
      kind: "night",
      nightLengthMin: 480,
      pickupsUsed: result.pickupsUsed,
      sleepDayAlreadyDecided: false,
      rules: STAR_RULES,
    });
    expect(star.star).toBe("faint");
  });

  test('"Yes" never lowers detected pickups (3 detected stays 3)', () => {
    expect(pickupsUsedForScoring(3, "yes")).toBe(3);
    expect(score({ detectedPickups: 3, morningAnswer: "yes" }).phoneFree).toBe(0);
  });

  test('"No" adds nothing: 0 detected stays 0 (phone-free 20, star), 3 detected stays 3', () => {
    expect(pickupsUsedForScoring(0, "no")).toBe(0);
    expect(score({ detectedPickups: 0, morningAnswer: "no" }).phoneFree).toBe(20);
    expect(pickupsUsedForScoring(3, "no")).toBe(3);
  });

  test("no question (null / missing) adds nothing", () => {
    expect(pickupsUsedForScoring(0, null)).toBe(0);
    expect(pickupsUsedForScoring(2)).toBe(2);
  });
});

describe("whole score", () => {
  test("perfect night = 100", () => {
    const result = score();
    expect(result).toEqual({
      duration: 50,
      regularity: 20,
      phoneFree: 20,
      wakeUp: 10,
      pickupsUsed: 0,
      noAlarmInvolved: false,
      score: 100,
    });
  });

  test("AC-NI-3 style night: 11 pm - 7 am, 15-min allowance, no use, alarm mission = 98", () => {
    const result = score({ estSleepMin: 465 });
    expect(result.duration).toBe(48);
    expect(result.score).toBe(98);
  });

  test("with an alarm the four parts are simply added", () => {
    // 455 min -> 47, regularity 20, 1 pickup -> 10, mission with snooze -> 5
    const result = score({ estSleepMin: 455, detectedPickups: 1, wakeResult: "mission_snoozed" });
    expect(result.score).toBe(47 + 20 + 10 + 5);
  });
});

describe("no alarm involved: (Duration + Regularity + Phone-free) x 100 / 90, rounded", () => {
  test("full marks on the three parts (50 + 20 + 20 = 90) scale up to 100", () => {
    const result = score({ endReason: "awake", wakeResult: "none" });
    expect(result.noAlarmInvolved).toBe(true);
    expect(result.wakeUp).toBe(0);
    expect(result.score).toBe(100);
  });

  test("76 of 90 -> 84 (rounded down), while the same night with an alarm mission scores 86", () => {
    // duration 50, regularity 16 (start 11:31 pm), phone-free 10 -> 76
    const common = { nightStart: at(0, "23:31"), detectedPickups: 1 };
    expect(score({ ...common, endReason: "wake_point", wakeResult: "none" }).score).toBe(84);
    expect(score({ ...common, endReason: "alarm", wakeResult: "mission" }).score).toBe(86);
  });

  test("77 of 90 -> 85.56 rounds UP to 86", () => {
    // duration 47 (455 min), regularity 20, phone-free 10 -> 77
    const result = score({
      estSleepMin: 455,
      detectedPickups: 1,
      endReason: "auto",
      wakeResult: "none",
    });
    expect(result.score).toBe(86);
  });

  test('"I\'m awake", the wake point and automatic end are all treated as no alarm', () => {
    for (const endReason of ["awake", "wake_point", "auto"] as const) {
      expect(score({ endReason, wakeResult: "none" }).noAlarmInvolved).toBe(true);
    }
  });

  test("an alarm ending (mission or Stop) is NOT scaled", () => {
    for (const endReason of ["alarm", "alarm_stop_no_mission"] as const) {
      expect(score({ endReason }).noAlarmInvolved).toBe(false);
    }
  });
});

describe("30-minute rule (FR-AL-30, iPhone with SW-02 off)", () => {
  const run = (missionDoneAt: string | null, snoozesUsed = 0) =>
    resolveWakeResultAfterStop({
      stopAt: at(1, "07:00"),
      missionDoneAt,
      snoozesUsed,
      windowMin: SCORE_RULES.missionAfterStopWindowMin,
    });

  test("AC-AL-9: Stop at 7:00, mission at 7:10 -> night ended 7:00, wake-up scores 10", () => {
    const wakeResult = run(at(1, "07:10"));
    expect(wakeResult).toBe("mission");
    const result = score({ endReason: "alarm_stop_no_mission", wakeResult });
    expect(result.wakeUp).toBe(10);
  });

  test("AC-AL-9: mission at 7:45 -> wake-up scores 0", () => {
    const wakeResult = run(at(1, "07:45"));
    expect(wakeResult).toBe("no_mission");
    const result = score({ endReason: "alarm_stop_no_mission", wakeResult });
    expect(result.wakeUp).toBe(0);
  });

  test("exactly 30 minutes after Stop is still 'within'; 31 minutes is not", () => {
    expect(run(at(1, "07:30"))).toBe("mission");
    expect(run(at(1, "07:31"))).toBe("no_mission");
  });

  test("with snoozes it scores 5 instead of 10", () => {
    const wakeResult = run(at(1, "07:10"), 2);
    expect(wakeResult).toBe("mission_snoozed");
    expect(score({ endReason: "alarm_stop_no_mission", wakeResult }).wakeUp).toBe(5);
  });

  test("a mission that is never completed = woke without mission (0)", () => {
    expect(run(null)).toBe("no_mission");
  });
});

describe("usual bedtime", () => {
  const SETTINGS_BEDTIME = clock("22:00");
  const usual = (
    previousNights: PastNight[],
    extra: { bedtimeChangedAt?: string | null; nights?: number } = {},
  ) =>
    usualBedtimeMin({
      settingsBedtimeMin: SETTINGS_BEDTIME,
      previousNights,
      ...(extra.bedtimeChangedAt !== undefined ? { bedtimeChangedAt: extra.bedtimeChangedAt } : {}),
      rules: { usualBedtimeNights: extra.nights ?? SCORE_RULES.usualBedtimeNights },
    });

  test("first 7 nights: the bedtime from settings", () => {
    expect(usual([])).toBe(SETTINGS_BEDTIME);
    const six = [0, 1, 2, 3, 4, 5].map((d) => normalNight(d, "23:00"));
    expect(usual(six)).toBe(SETTINGS_BEDTIME);
  });

  test("after 7 nights: the average start of the last 7 nights", () => {
    const seven = [0, 1, 2, 3, 4, 5, 6].map((d) => normalNight(d, "23:00"));
    expect(usual(seven)).toBe(clock("23:00"));
    // Eight nights: only the LAST seven count (the oldest, at 9 pm, drops out).
    const eight = [normalNight(0, "21:00"), ...[1, 2, 3, 4, 5, 6, 7].map((d) => normalNight(d, "23:00"))];
    expect(usual(eight)).toBe(clock("23:00"));
  });

  test("midnight average: 11:30 pm and 12:30 am average to 12:00 am (NOT 12:00 pm)", () => {
    const nights = [normalNight(0, "23:30"), normalNight(2, "00:30")];
    const result = usual(nights, { nights: 2 });
    expect(result).toBe(0); // 12:00 am
    expect(result).not.toBe(clock("12:00")); // a plain average would wrongly say noon
  });

  test("midnight average over a full 7 nights", () => {
    const nights = [
      normalNight(0, "23:30"),
      normalNight(2, "00:30"),
      normalNight(2, "23:30"),
      normalNight(4, "00:30"),
      normalNight(4, "23:30"),
      normalNight(6, "00:30"),
      normalNight(6, "00:00"),
    ];
    expect(usual(nights)).toBe(0);
  });

  test("daytime bedtime (AC-NI-10): bedtime 1 pm, regularity is scored against 1 pm", () => {
    const shiftWorkerBedtime = clock("13:00");
    const usualForNewUser = usualBedtimeMin({
      settingsBedtimeMin: shiftWorkerBedtime,
      previousNights: [],
      rules: SCORE_RULES,
    });
    expect(usualForNewUser).toBe(780);

    // Night started 9:30 am (inside the 9 am - 5 pm window): 3 h 30 m from 1 pm -> regularity 0 ...
    const early = score({ nightStart: at(0, "09:30"), usualBedtimeMin: usualForNewUser });
    expect(early.regularity).toBe(0);
    // ... but it can still earn a star.
    expect(
      decideStar({
        kind: "night",
        nightLengthMin: 480,
        pickupsUsed: 0,
        sleepDayAlreadyDecided: false,
        rules: STAR_RULES,
      }).star,
    ).toBe("star");
    // A night started at 12:45 pm is only 15 minutes from 1 pm.
    expect(score({ nightStart: at(0, "12:45"), usualBedtimeMin: usualForNewUser }).regularity).toBe(20);
  });

  test("daytime nights average correctly too (12:30 pm and 1:30 pm -> 1:00 pm)", () => {
    const result = usualBedtimeMin({
      settingsBedtimeMin: clock("13:00"),
      previousNights: [normalNight(0, "12:30"), normalNight(1, "13:30")],
      rules: { usualBedtimeNights: 2 },
    });
    expect(result).toBe(clock("13:00"));
  });

  test("AC-NI-17: a late start is NOT counted in the average", () => {
    // Seven normal nights at 11 pm, then a late start at 4:30 am.
    const normals = [0, 1, 2, 3, 4, 5, 6].map((d) => normalNight(d, "23:00"));
    const lateStart: PastNight = { start: at(8, "04:30"), kind: "night", lateStart: true };
    expect(usual([...normals, lateStart])).toBe(clock("23:00")); // would be pulled towards 4:30 if counted
  });

  test("AC-NI-17: a late start does NOT count toward the first 7 nights", () => {
    const sixNormals = [0, 1, 2, 3, 4, 5].map((d) => normalNight(d, "23:00"));
    const lateStart: PastNight = { start: at(7, "04:30"), kind: "night", lateStart: true };
    // 6 normal + 1 late start = still only 6 counting nights -> settings bedtime (10 pm) still applies.
    expect(usual([...sixNormals, lateStart])).toBe(SETTINGS_BEDTIME);
  });

  test("AC-NI-17: the late-start night itself is a normal night that earns a star", () => {
    // 4:30 am start, 7 h night, no phone use.
    const star = decideStar({
      kind: "night",
      nightLengthMin: 420,
      pickupsUsed: 0,
      sleepDayAlreadyDecided: false,
      rules: STAR_RULES,
    });
    expect(star.star).toBe("star");
  });

  test("naps are never counted, neither in the average nor toward the first 7", () => {
    const sixNormals = [0, 1, 2, 3, 4, 5].map((d) => normalNight(d, "23:00"));
    const nap: PastNight = { start: at(6, "14:00"), kind: "nap", lateStart: false };
    expect(usual([...sixNormals, nap])).toBe(SETTINGS_BEDTIME);
    const sevenNormals = [...sixNormals, normalNight(6, "23:00")];
    expect(usual([...sevenNormals, nap])).toBe(clock("23:00"));
  });

  test("changing bedtime restarts the count of 7 nights", () => {
    const before = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => normalNight(d, "23:00"));
    const changedAt = at(10, "12:00");
    // Right after the change: the new settings bedtime applies again.
    expect(usual(before, { bedtimeChangedAt: changedAt })).toBe(SETTINGS_BEDTIME);
    // After 7 nights at 9:30 pm under the new bedtime: their average.
    const after = [11, 12, 13, 14, 15, 16, 17].map((d) => normalNight(d, "21:30"));
    expect(usual([...before, ...after], { bedtimeChangedAt: changedAt })).toBe(clock("21:30"));
  });
});
