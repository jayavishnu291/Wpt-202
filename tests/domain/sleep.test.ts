// tests/domain/sleep.test.ts  -  PRD 11.1, 9.5.1, 9.6 (AC-SL-1, AC-SL-2), AC-NI-18/21/22/23
import {
  computeWakePoint,
  estimateSleep,
  napDurationMin,
  nightLengthMin,
  resolveWakeTime,
} from "../../src/domain/sleep";
import { at, clock, ms } from "./testHelpers";
import { ALLOWANCE_MIN, SLEEP_RULES } from "./testRules";

// Shortcut: a normal night 11:00 pm -> 7:00 am with the default allowance.
function estimate(
  usePeriods: { start: string; end: string }[],
  extra: Partial<Parameters<typeof estimateSleep>[0]> = {},
) {
  return estimateSleep({
    nightStart: at(0, "23:00"),
    wakeTime: at(1, "07:00"),
    usePeriods,
    allowanceMin: ALLOWANCE_MIN,
    rules: SLEEP_RULES,
    ...extra,
  });
}

describe("estimated sleep (PRD 11.1)", () => {
  // AC-SL-1: 11:00 pm - 7:00 am, no use, 15-min allowance -> 7 h 45 m
  test("AC-SL-1: 11 pm - 7 am, no use, 15-min allowance = 7 h 45 m", () => {
    const result = estimate([]);
    expect(result.estSleepMin).toBe(465);
    expect(result.onsetMs).toBe(ms(at(0, "23:15")));
  });

  // AC-SL-2: same night with a 10-minute use period at 2 am -> 7 h 35 m
  test("AC-SL-2: same night with a 10-minute use at 2 am = 7 h 35 m", () => {
    const result = estimate([{ start: at(1, "02:00"), end: at(1, "02:10") }]);
    expect(result.estSleepMin).toBe(455);
    expect(result.useMin).toBe(10);
  });

  test("settling use (starts in the first 2 hours) moves onset instead of being subtracted", () => {
    // Use 11:20 pm - 11:40 pm -> onset = 11:40 pm + 15 = 11:55 pm -> 7 h 05 m
    const result = estimate([{ start: at(0, "23:20"), end: at(0, "23:40") }]);
    expect(result.onsetMs).toBe(ms(at(0, "23:55")));
    expect(result.estSleepMin).toBe(425);
    expect(result.useMin).toBe(0);
  });

  test("a settling use that STARTS inside the first 2 h but ENDS after it still moves onset", () => {
    // Starts 12:50 am (1 h 50 m in), ends 1:20 am -> onset 1:35 am -> 5 h 25 m
    const result = estimate([{ start: at(1, "00:50"), end: at(1, "01:20") }]);
    expect(result.onsetMs).toBe(ms(at(1, "01:35")));
    expect(result.estSleepMin).toBe(325);
  });

  test("use that starts AFTER the first 2 hours is subtracted, not settling", () => {
    // Starts 1:05 am (2 h 05 m in)
    const result = estimate([{ start: at(1, "01:05"), end: at(1, "01:15") }]);
    expect(result.onsetMs).toBe(ms(at(0, "23:15")));
    expect(result.estSleepMin).toBe(455);
  });

  test("onset uses the END of the LAST settling use", () => {
    const result = estimate([
      { start: at(0, "23:10"), end: at(0, "23:20") },
      { start: at(1, "00:00"), end: at(1, "00:10") },
    ]);
    expect(result.onsetMs).toBe(ms(at(1, "00:25"))); // 12:10 am + 15
    expect(result.estSleepMin).toBe(395); // 12:25 am -> 7:00 am
  });

  test("use of exactly 30 seconds is ignored; 31 seconds counts", () => {
    const thirty = estimate([{ start: at(1, "02:00", 0), end: at(1, "02:00", 30) }]);
    expect(thirty.useMin).toBe(0);
    expect(thirty.estSleepMin).toBe(465);

    const thirtyOne = estimate([{ start: at(1, "02:00", 0), end: at(1, "02:00", 31) }]);
    expect(thirtyOne.useMin).toBeCloseTo(31 / 60, 5);
    expect(thirtyOne.estSleepMin).toBe(464); // 465 min - 31 s = 464.48 -> 464
  });

  test("unknown periods and phone-off time count as sleep (nothing subtracted)", () => {
    const result = estimate([], {
      unknownPeriods: [{ start: at(1, "01:00"), end: at(1, "05:00") }],
    });
    expect(result.estSleepMin).toBe(465);
  });

  test("night-pass use still counts as use time for the estimate (I-13)", () => {
    const result = estimate([], {
      nightPassPeriods: [{ start: at(1, "02:00"), end: at(1, "02:05") }],
    });
    expect(result.useMin).toBe(5);
    expect(result.estSleepMin).toBe(460);
  });

  test("[iPhone, SW-01 off]: use is unknown, onset = night start + allowance, nothing subtracted", () => {
    const result = estimate([{ start: at(1, "02:00"), end: at(1, "03:00") }], {
      iphoneSw01Off: true,
    });
    expect(result.onsetMs).toBe(ms(at(0, "23:15")));
    expect(result.estSleepMin).toBe(465);
  });

  test("overlapping use periods are not subtracted twice", () => {
    const result = estimate([
      { start: at(1, "02:00"), end: at(1, "02:10") },
      { start: at(1, "02:05"), end: at(1, "02:15") },
    ]);
    expect(result.useMin).toBe(15);
    expect(result.estSleepMin).toBe(450);
  });

  test("use after the wake time is not subtracted (only use between onset and wake counts)", () => {
    const result = estimate([{ start: at(1, "06:50"), end: at(1, "07:30") }]);
    expect(result.useMin).toBe(10);
    expect(result.estSleepMin).toBe(455);
  });

  test("never below 0", () => {
    const result = estimateSleep({
      nightStart: at(0, "23:00"),
      wakeTime: at(0, "23:10"), // wakes before the 15-minute allowance is over
      usePeriods: [],
      allowanceMin: ALLOWANCE_MIN,
      rules: SLEEP_RULES,
    });
    expect(result.estSleepMin).toBe(0);
  });

  test("a bigger allowance moves onset later", () => {
    const result = estimate([], { allowanceMin: 30 });
    expect(result.estSleepMin).toBe(450);
  });
});

describe("naps: duration only (PRD 11.1 item 8)", () => {
  test("AC-NI-18: nap 2:00 pm - 2:20 pm shows 20 minutes", () => {
    expect(napDurationMin(at(0, "14:00"), at(0, "14:20"))).toBe(20);
  });
  test("AC-NI-23: a nap with no alarm ends automatically after 4 h = 240 minutes", () => {
    expect(napDurationMin(at(0, "14:00"), at(0, "18:00"))).toBe(240);
  });
});

describe("night length", () => {
  test("is measured from start to end in minutes, not rounded", () => {
    expect(nightLengthMin(at(0, "23:00"), at(1, "07:00"))).toBe(480);
    expect(nightLengthMin(at(0, "23:00", 0), at(1, "01:59", 59))).toBeCloseTo(179.9833, 3);
  });
});

describe("wake point (PRD 9.5.1)", () => {
  const wakePoint = (start: string, defaultWake: string) =>
    computeWakePoint({
      nightStart: at(0, start),
      defaultWakeMin: clock(defaultWake),
      rules: SLEEP_RULES,
    });

  test("normal night: 11 pm start, default wake 7 am -> wake point 7 am", () => {
    expect(wakePoint("23:00", "07:00")).toBe(ms(at(1, "07:00")));
  });

  test("3-hour minimum: a default wake time EXACTLY 3 h away qualifies", () => {
    expect(wakePoint("04:00", "07:00")).toBe(ms(at(0, "07:00")));
  });

  test("3-hour minimum: a default wake time only 2 h 30 m away is skipped (next one is capped at 10 h)", () => {
    // 4:30 am start -> 7:00 am is only 2.5 h away -> next 7:00 am is 26.5 h away -> cap = 10 h = 2:30 pm
    expect(wakePoint("04:30", "07:00")).toBe(ms(at(0, "14:30")));
  });

  test("3-hour minimum: default wake just after midnight is skipped, cap applies", () => {
    // 10 pm start, default 12:30 am (2.5 h away) -> skipped -> cap 10 h = 8:00 am
    expect(wakePoint("22:00", "00:30")).toBe(ms(at(1, "08:00")));
  });

  test("10-hour cap: default wake 22 h away -> capped at 10 h", () => {
    expect(wakePoint("09:00", "07:00")).toBe(ms(at(0, "19:00")));
  });

  test("10-hour cap: cap beats a default wake time that is 11 h away", () => {
    // 8 pm start, default 7 am (11 h) -> cap = 6:00 am
    expect(wakePoint("20:00", "07:00")).toBe(ms(at(1, "06:00")));
  });
});

describe("wake time (PRD 11.1 item 4)", () => {
  const wakePointIso = at(1, "07:00"); // 11 pm start, default wake 7 am

  test("AC-NI-21 [Android]: no alarms, phone unlocked at 9:00 am -> night ends 9:00 am, estimate runs to 9:00 am", () => {
    const wakeMs = resolveWakeTime({
      platform: "android",
      endReason: "wake_point",
      endAt: at(1, "09:00"),
      wakePoint: wakePointIso,
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "09:00")));
    const result = estimateSleep({
      nightStart: at(0, "23:00"),
      wakeTime: new Date(wakeMs).toISOString(),
      usePeriods: [],
      allowanceMin: ALLOWANCE_MIN,
      rules: SLEEP_RULES,
    });
    expect(result.estSleepMin).toBe(585); // 11:15 pm -> 9:00 am = 9 h 45 m
  });

  test("AC-NI-22 [iPhone]: app opened at 12:00 noon -> estimated wake time is 10:00 am (wake point 7 am + 3 h)", () => {
    const wakeMs = resolveWakeTime({
      platform: "iphone",
      endReason: "wake_point",
      endAt: at(1, "12:00"),
      wakePoint: wakePointIso,
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "10:00")));
  });

  test("[iPhone] app opened BEFORE the cap uses the real opening time", () => {
    const wakeMs = resolveWakeTime({
      platform: "iphone",
      endReason: "wake_point",
      endAt: at(1, "08:30"),
      wakePoint: wakePointIso,
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "08:30")));
  });

  test("[iPhone] app opened exactly at wake point + 3 h = 10:00 am", () => {
    const wakeMs = resolveWakeTime({
      platform: "iphone",
      endReason: "wake_point",
      endAt: at(1, "10:00"),
      wakePoint: wakePointIso,
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "10:00")));
  });

  test("[iPhone] the 3-hour cap needs the wake point (loud error if it is missing)", () => {
    expect(() =>
      resolveWakeTime({
        platform: "iphone",
        endReason: "wake_point",
        endAt: at(1, "12:00"),
        iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
      }),
    ).toThrow();
  });

  test('"I\'m awake" that came first is the wake time (both platforms, no cap)', () => {
    for (const platform of ["android", "iphone"] as const) {
      const wakeMs = resolveWakeTime({
        platform,
        endReason: "awake",
        endAt: at(1, "06:10"),
        iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
      });
      expect(wakeMs).toBe(ms(at(1, "06:10")));
    }
  });

  test("ending alarm: wake time is when the night ended (final mission completed)", () => {
    const wakeMs = resolveWakeTime({
      platform: "android",
      endReason: "alarm",
      endAt: at(1, "07:05"),
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "07:05")));
  });

  test("[iPhone, SW-02 off] Stop: the night ends at the Stop moment", () => {
    const wakeMs = resolveWakeTime({
      platform: "iphone",
      endReason: "alarm_stop_no_mission",
      endAt: at(1, "07:00"),
      iphoneWakeCapMin: SLEEP_RULES.iphoneWakeCapMin,
    });
    expect(wakeMs).toBe(ms(at(1, "07:00")));
  });
});
