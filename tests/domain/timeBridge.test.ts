// tests/domain/timeBridge.test.ts  -  the circular average and the sleep day (India's helpers)
import {
  addDays,
  circularAverageMinutes,
  daysBetween,
  localMinutesOfDay,
  offsetMinutesOf,
  sleepDayOf,
} from "../../src/domain/timeBridge";
import { at, clock } from "./testHelpers";

describe("circular average of clock times", () => {
  const round = (n: number) => Math.round(n) % 1440;

  test("11:30 pm and 12:30 am average to 12:00 am (not noon)", () => {
    expect(round(circularAverageMinutes([clock("23:30"), clock("00:30")]))).toBe(0);
  });
  test("ordinary evening times average normally", () => {
    expect(round(circularAverageMinutes([clock("22:00"), clock("23:00")]))).toBe(clock("22:30"));
  });
  test("a single time is itself", () => {
    expect(round(circularAverageMinutes([clock("23:15")]))).toBe(clock("23:15"));
  });
  test("an empty list is refused loudly", () => {
    expect(() => circularAverageMinutes([])).toThrow();
  });
});

describe("sleep day = the local date a night ENDS on", () => {
  test("a night ending 7:00 am on 2 Oct is sleep day 2 Oct", () => {
    expect(sleepDayOf(at(1, "07:00"))).toBe("2026-10-02");
  });
  test("a night ending just after midnight belongs to the NEW date", () => {
    expect(sleepDayOf(at(1, "00:30"))).toBe("2026-10-02");
  });
  test("uses India time: 12:30 am IST on 2 Oct is the 2nd, even though it is still the 1st in UTC", () => {
    expect(sleepDayOf("2026-10-02T00:30:00+05:30")).toBe("2026-10-02");
  });
  test("the offset written in the text decides the local date (keep +05:30 when storing times)", () => {
    expect(sleepDayOf("2026-10-01T19:00:00Z")).toBe("2026-10-01"); // same instant, written in UTC
  });
  test("11:59 pm is still the same day", () => {
    expect(sleepDayOf(at(0, "23:59"))).toBe("2026-10-01");
  });
});

describe("small clock helpers", () => {
  test("localMinutesOfDay reads the clock in the written offset", () => {
    expect(localMinutesOfDay(at(0, "23:00"))).toBe(1380);
    expect(localMinutesOfDay(at(1, "00:30"))).toBe(30);
  });
  test("offsets", () => {
    expect(offsetMinutesOf("2026-10-01T23:00:00+05:30")).toBe(330);
    expect(offsetMinutesOf("2026-10-01T23:00:00Z")).toBe(0);
    expect(offsetMinutesOf("2026-10-01T23:00:00-03:30")).toBe(-210);
    expect(() => offsetMinutesOf("2026-10-01T23:00:00")).toThrow();
  });
  test("day arithmetic across a month end", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    expect(daysBetween("2026-10-30", "2026-11-03")).toBe(4);
    expect(daysBetween("2026-11-03", "2026-10-30")).toBe(-4);
  });
});

