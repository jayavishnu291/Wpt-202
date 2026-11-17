// tests/domain/stars.test.ts  -  PRD 11.3, FR-NI-09, FR-NI-10, AC-NI-7, AC-NI-8
import { nightLengthMin } from "../../src/domain/sleep";
import {
  decideStar,
  sleepDayAlreadyDecided,
  sleepDayOutcome,
} from "../../src/domain/stars";
import type { NightOnSleepDay } from "../../src/domain/stars";
import { sleepDayOf } from "../../src/domain/timeBridge";
import { at } from "./testHelpers";
import { STAR_RULES } from "./testRules";

const star = (
  nightLengthMinutes: number,
  pickupsUsed: number,
  sleepDayDecided = false,
  kind: "night" | "nap" = "night",
) =>
  decideStar({
    kind,
    nightLengthMin: nightLengthMinutes,
    pickupsUsed,
    sleepDayAlreadyDecided: sleepDayDecided,
    rules: STAR_RULES,
  });

describe("star table (PRD 11.3)", () => {
  test("under 3 hours -> nothing, whatever the pickups", () => {
    expect(star(179, 0).star).toBe("none");
    expect(star(179, 3).star).toBe("none");
    expect(star(0, 0).star).toBe("none");
  });

  test("exactly 3 hours counts as 3 hours or more", () => {
    expect(star(180, 0).star).toBe("star");
  });

  test("2 h 59 m 59 s is still under 3 hours", () => {
    const length = nightLengthMin(at(0, "23:00", 0), at(1, "01:59", 59));
    expect(star(length, 0).star).toBe("none");
  });

  test("3+ hours and 0 pickups -> star", () => {
    expect(star(480, 0)).toEqual({ star: "star", countedForStar: true });
  });

  test("3+ hours and 1 or more pickups -> faint star", () => {
    expect(star(480, 1)).toEqual({ star: "faint", countedForStar: true });
    expect(star(480, 5)).toEqual({ star: "faint", countedForStar: true });
  });

  test("AC-NI-7: 'I'm awake' at 1 am after an 11 pm start (2 h) -> no star", () => {
    expect(star(nightLengthMin(at(0, "23:00"), at(1, "01:00")), 0).star).toBe("none");
  });

  test("AC-NI-3: 11 pm - 7 am with no phone use = star", () => {
    expect(star(nightLengthMin(at(0, "23:00"), at(1, "07:00")), 0).star).toBe("star");
  });
});

describe("one star per sleep day (FR-NI-10)", () => {
  test("AC-NI-8: a second 4-hour night on the same sleep day after a star -> no second star", () => {
    // Night A: 9 pm - 1 am.  Night B: 3 am - 7 am.  Both END on the same sleep day.
    const endA = at(1, "01:00");
    const endB = at(1, "07:00");
    expect(sleepDayOf(endA)).toBe(sleepDayOf(endB));

    const first = star(nightLengthMin(at(0, "21:00"), endA), 0, false);
    expect(first).toEqual({ star: "star", countedForStar: true });

    const decidedAlready = sleepDayAlreadyDecided([{ kind: "night", ...first }]);
    expect(decidedAlready).toBe(true);

    const second = star(nightLengthMin(at(1, "03:00"), endB), 0, decidedAlready);
    expect(second).toEqual({ star: "none", countedForStar: false });
  });

  test("the FIRST 3+ hour night decides the day, even if it was only a faint star", () => {
    const first = star(240, 2, false);
    expect(first.star).toBe("faint");
    // A later, perfect 4-hour night that day earns nothing.
    expect(star(240, 0, true).star).toBe("none");
  });

  test("a night under 3 hours does NOT use up the day's star", () => {
    const short = star(120, 0, false);
    expect(short).toEqual({ star: "none", countedForStar: false });
    const decided = sleepDayAlreadyDecided([{ kind: "night", ...short }]);
    expect(decided).toBe(false);
    expect(star(240, 0, decided).star).toBe("star");
  });

  test("naps never earn stars, and never use up the day's star", () => {
    const nap = star(240, 0, false, "nap");
    expect(nap).toEqual({ star: "none", countedForStar: false });
    expect(sleepDayAlreadyDecided([{ kind: "nap", star: "none", countedForStar: false }])).toBe(false);
  });
});

describe("what a sleep day produced (for the streak)", () => {
  const nights = (...list: NightOnSleepDay[]) => list;

  test("no nights at all -> none", () => {
    expect(sleepDayOutcome([])).toBe("none");
  });
  test("only a nap -> none (naps have no streak effect)", () => {
    expect(sleepDayOutcome(nights({ kind: "nap", star: "none", countedForStar: false }))).toBe("none");
  });
  test("a star night plus a nap -> star", () => {
    expect(
      sleepDayOutcome(
        nights(
          { kind: "nap", star: "none", countedForStar: false },
          { kind: "night", star: "star", countedForStar: true },
        ),
      ),
    ).toBe("star");
  });
  test("two nights: the deciding (first 3+ h) night's result is the day's result", () => {
    expect(
      sleepDayOutcome(
        nights(
          { kind: "night", star: "faint", countedForStar: true },
          { kind: "night", star: "none", countedForStar: false },
        ),
      ),
    ).toBe("faint");
  });
});
