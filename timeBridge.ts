// src/domain/timeBridge.ts
//
// ONE small door between our calculation code and the date/time helpers.
// The team rule says: use India's helpers from src/domain/time.ts for the
// "circular average" and the "sleep day". Everything else in the domain folder
// imports ONLY from this file, so if India's function names differ from what is
// guessed here, you fix them in this ONE file and nothing else changes.
//
// HOW TO SWITCH TO INDIA'S HELPERS (Step 4 of the guide):
//   1. Open src/domain/time.ts and look at its `export`s.
//   2. Add at the top:   import * as India from "./time";
//   3. Make the body of `circularAverageMinutes` and `sleepDayOf` below just
//      call India's function (adapting the input/output shape if needed).
//   4. Run `npx jest tests/domain` – the tests prove the behaviour is unchanged.

// Unit conversions (these are not "rules", they are just how clocks work).
export const MS_PER_SEC = 1_000;
export const MS_PER_MIN = 60_000;
export const MIN_PER_DAY = 1_440;
export const MS_PER_DAY = MS_PER_MIN * MIN_PER_DAY;

/** ISO string -> milliseconds since 1970. Throws on rubbish so bugs are loud, not silent. */
export function toMs(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    throw new Error(`Not a valid date-time: "${iso}"`);
  }
  return ms;
}

/** Offset written at the end of an ISO string, in minutes: "+05:30" -> 330, "Z" -> 0. */
export function offsetMinutesOf(iso: string): number {
  if (/Z$/.test(iso)) return 0;
  const m = /([+-])(\d{2}):?(\d{2})$/.exec(iso);
  if (!m) {
    throw new Error(`Date-time has no offset (like +05:30): "${iso}"`);
  }
  const sign = m[1] === "-" ? -1 : 1;
  const hours = Number(m[2] ?? "0");
  const minutes = Number(m[3] ?? "0");
  return sign * (hours * 60 + minutes);
}

/** Minutes since local midnight (0 to 1439.99), using the offset written in the string. */
export function localMinutesOfDay(iso: string): number {
  const localMs = toMs(iso) + offsetMinutesOf(iso) * MS_PER_MIN;
  const msOfDay = ((localMs % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
  return msOfDay / MS_PER_MIN;
}

/** The sleep day = the local calendar date on which a night ENDS, as "YYYY-MM-DD". (India's helper) */
export function sleepDayOf(endIso: string): string {
  const localMs = toMs(endIso) + offsetMinutesOf(endIso) * MS_PER_MIN;
  return new Date(localMs).toISOString().slice(0, 10);
}

/** Whole calendar days from day `a` to day `b` ("YYYY-MM-DD"). Positive if b is later. */
export function daysBetween(a: string, b: string): number {
  const msA = Date.parse(`${a}T00:00:00Z`);
  const msB = Date.parse(`${b}T00:00:00Z`);
  return Math.round((msB - msA) / MS_PER_DAY);
}

/** Add (or subtract, with a negative number) whole days to a "YYYY-MM-DD" day. */
export function addDays(day: string, days: number): string {
  const ms = Date.parse(`${day}T00:00:00Z`) + days * MS_PER_DAY;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Average of clock times on a 24-hour circle (India's helper).
 * Input: minutes since midnight, e.g. 23:30 = 1410 and 00:30 = 30. Output: 0 = midnight.
 * Example: [1410, 30] -> 0 (that is 12:00 am), NOT 12:00 pm like a plain average would say.
 */
export function circularAverageMinutes(minutesOfDay: number[]): number {
  if (minutesOfDay.length === 0) {
    throw new Error("Cannot average an empty list of times");
  }
  let sinSum = 0;
  let cosSum = 0;
  for (const m of minutesOfDay) {
    const angle = (m / MIN_PER_DAY) * 2 * Math.PI;
    sinSum += Math.sin(angle);
    cosSum += Math.cos(angle);
  }
  // Times exactly opposite each other (e.g. 6 am and 6 pm) have no meaningful average.
  if (Math.abs(sinSum) < 1e-9 && Math.abs(cosSum) < 1e-9) {
    return minutesOfDay[0] ?? 0;
  }
  let average = (Math.atan2(sinSum, cosSum) / (2 * Math.PI)) * MIN_PER_DAY;
  if (average < 0) average += MIN_PER_DAY;
  return average;
}
