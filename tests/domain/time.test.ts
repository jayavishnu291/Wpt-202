import {
  circularAverageMinutes,
  elapsedMs,
  elapsedMinutes,
  formatDuration,
  isInLateStartPeriod,
  isInNightWindow,
  isMinuteInRange,
  lateStartPeriod,
  minuteOfDay,
  nightWindow,
  parseIsoWithOffset,
  sleepDay,
  toIsoWithOffset,
} from "../../src/domain/time";
import { rules } from "../../config/rules";
import type { NightRules } from "../../src/domain/time";

const TIME_RULES: NightRules = {
  nightWindowHalfHours: rules.night.windowBeforeBedtimeHours,
  lateStartHours: rules.night.lateStartHours,
};

const h = (hours: number, mins = 0) => hours * 60 + mins;
const IST = 330;
// Build an epoch from IST local time
const ist = (y: number, mo: number, d: number, hh: number, mm = 0) =>
  Date.UTC(y, mo - 1, d, hh, mm) - IST * 60_000;

describe("circularAverageMinutes", () => {
  test("11:30 pm and 12:30 am average to midnight", () => {
    expect(circularAverageMinutes([1410, 30])).toBe(0);
  });
  test("10:00 pm and 11:00 pm average to 10:30 pm", () => {
    expect(circularAverageMinutes([h(22), h(23)])).toBe(h(22, 30));
  });
  test("single value returns itself", () => {
    expect(circularAverageMinutes([h(7)])).toBe(h(7));
  });
  test("empty input throws", () => {
    expect(() => circularAverageMinutes([])).toThrow();
  });
});

describe("night window", () => {
  test("daytime bedtime 1:00 pm -> 9:00 am to 5:00 pm", () => {
    expect(nightWindow(h(13), TIME_RULES)).toEqual({ startMin: h(9), endMin: h(17) });
  });
  test("bedtime 11:00 pm -> 7:00 pm to 3:00 am (crosses midnight)", () => {
    expect(nightWindow(h(23), TIME_RULES)).toEqual({ startMin: h(19), endMin: h(3) });
  });
  test("late-start period for 11:00 pm -> 3:00 am to 9:00 am", () => {
    expect(lateStartPeriod(h(23), TIME_RULES)).toEqual({ startMin: h(3), endMin: h(9) });
  });
  test("isInNightWindow: 10:30 pm yes, 4:00 pm no (bedtime 11 pm)", () => {
    expect(isInNightWindow(ist(2026, 10, 27, 22, 30), IST, h(23), TIME_RULES)).toBe(true);
    expect(isInNightWindow(ist(2026, 10, 27, 16, 0), IST, h(23), TIME_RULES)).toBe(false);
  });
  test("isInNightWindow works after midnight (1 am, bedtime 11 pm)", () => {
    expect(isInNightWindow(ist(2026, 10, 28, 1, 0), IST, h(23), TIME_RULES)).toBe(true);
  });
  test("isInNightWindow: shift worker 9:30 am, bedtime 1 pm", () => {
    expect(isInNightWindow(ist(2026, 10, 27, 9, 30), IST, h(13), TIME_RULES)).toBe(true);
  });
  test("isInLateStartPeriod: 4 am yes, 10 am no (bedtime 11 pm)", () => {
    expect(isInLateStartPeriod(ist(2026, 10, 28, 4, 0), IST, h(23), TIME_RULES)).toBe(true);
    expect(isInLateStartPeriod(ist(2026, 10, 28, 10, 0), IST, h(23), TIME_RULES)).toBe(false);
  });
  test("night-window start is inclusive and its end is exclusive", () => {
    expect(isMinuteInRange(h(19), nightWindow(h(23), TIME_RULES))).toBe(true);
    expect(isMinuteInRange(h(3), nightWindow(h(23), TIME_RULES))).toBe(false);
  });
  test("late-start start is inclusive and its end is exclusive", () => {
    expect(isMinuteInRange(h(3), lateStartPeriod(h(23), TIME_RULES))).toBe(true);
    expect(isMinuteInRange(h(9), lateStartPeriod(h(23), TIME_RULES))).toBe(false);
  });
});

describe("sleepDay", () => {
  test("night 11 pm -> 7 am belongs to the 7 am date", () => {
    expect(sleepDay(ist(2026, 10, 28, 7, 0), IST)).toBe("2026-10-28");
  });
  test("uses local date, not UTC date (1 am IST is previous day in UTC)", () => {
    expect(sleepDay(ist(2026, 10, 28, 1, 0), IST)).toBe("2026-10-28");
  });
  test("uses the previous local date when the offset crosses midnight", () => {
    expect(sleepDay(Date.UTC(2026, 0, 1, 1, 0), -480)).toBe("2025-12-31");
  });
});

describe("ISO with offset", () => {
  test("formats with +05:30", () => {
    expect(toIsoWithOffset(ist(2026, 10, 27, 23, 15), IST)).toBe("2026-10-27T23:15:00+05:30");
  });
  test("negative offset", () => {
    const ms = Date.UTC(2026, 0, 1, 12, 0, 0);
    expect(toIsoWithOffset(ms, -480)).toBe("2026-01-01T04:00:00-08:00");
  });
  test("round trip", () => {
    const ms = ist(2026, 10, 27, 23, 15);
    const parsed = parseIsoWithOffset(toIsoWithOffset(ms, IST));
    expect(parsed).toEqual({ epochMs: ms, offsetMinutes: IST });
  });
  test("preserves milliseconds", () => {
    const ms = ist(2026, 10, 27, 23, 15) + 123;
    const iso = toIsoWithOffset(ms, IST);
    expect(iso).toBe("2026-10-27T23:15:00.123+05:30");
    expect(parseIsoWithOffset(iso)).toEqual({ epochMs: ms, offsetMinutes: IST });
  });
  test("parses four-digit years below 0100 without Date.UTC year adjustment", () => {
    expect(parseIsoWithOffset("0001-01-01T00:00:00+00:00")).toEqual({
      epochMs: -62_135_596_800_000,
      offsetMinutes: 0,
    });
  });
  test.each([
    "2026-02-30T12:00:00+00:00",
    "2026-01-01T24:00:00+00:00",
    "2026-01-01T12:60:00+00:00",
    "2026-01-01T12:00:00+14:01",
    "2026-01-01T12:00:00+15:00",
    "2026-01-01T12:00:00",
    "2026-01-01T12:00:00.1234+00:00",
  ])("rejects invalid ISO timestamp %s", (iso) => {
    expect(parseIsoWithOffset(iso)).toBeNull();
  });
  test("invalid text returns null", () => {
    expect(parseIsoWithOffset("nope")).toBeNull();
  });
  test("formats a local date across the UTC date boundary", () => {
    expect(toIsoWithOffset(Date.UTC(2025, 11, 31, 20, 0), 240)).toBe(
      "2026-01-01T00:00:00+04:00",
    );
  });
});

describe("formatDuration", () => {
  test("465 -> 7 h 45 m", () => {
    expect(formatDuration(465)).toBe("7 h 45 m");
  });
  test("45 -> 0 h 45 m", () => {
    expect(formatDuration(45)).toBe("0 h 45 m");
  });
  test("negative clamps to 0", () => {
    expect(formatDuration(-5)).toBe("0 h 0 m");
  });
  test("rounds fractional minutes", () => {
    expect(formatDuration(59.6)).toBe("1 h 0 m");
  });
});

describe("elapsedMs (monotonic)", () => {
  test("does not change when the wall clock jumps", () => {
    const monoStart = 1_000_000;
    const monoNow = 1_000_000 + 25 * 60_000;
    // Wall clock jumps by hours, but only monotonic values are used.
    const wallBefore = ist(2026, 10, 27, 10, 0);
    const wallAfterJump = wallBefore + 5 * 3_600_000;
    expect(wallAfterJump).not.toBe(wallBefore);
    expect(elapsedMs(monoStart, monoNow)).toBe(25 * 60_000);
  });
  test("never negative", () => {
    expect(elapsedMs(500, 100)).toBe(0);
  });
  test("elapsedMinutes uses supplied monotonic values", () => {
    expect(elapsedMinutes(1_000, 1_000 + 125_000)).toBe(2);
  });
  test("minuteOfDay handles negative epoch values and offsets", () => {
    expect(minuteOfDay(-1, 0)).toBe(1439);
  });
});
