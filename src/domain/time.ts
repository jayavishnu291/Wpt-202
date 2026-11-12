// Pure time helpers. No React / RN / Expo imports. Never reads the clock:
// every function receives "now" (or other times) as input.
// PRD 9.5.1, 11.2, 12, 9.3 edge cases.

export interface NightRules {
  /** Hours before AND after bedtime (config/rules.ts, currently 4) */
  nightWindowHalfHours: number;
  /** Hours the late-start period lasts after the window ends (currently 6) */
  lateStartHours: number;
}

export interface MinuteRange {
  /** minutes after midnight, 0..1439 */
  startMin: number;
  /** minutes after midnight, 0..1439 (may be smaller than startMin = crosses midnight) */
  endMin: number;
}

const MIN_PER_DAY = 1440;
const MS_PER_MIN = 60_000;
const MAX_OFFSET_MINUTES = 14 * 60;

const mod = (n: number, m: number): number => ((n % m) + m) % m;
const pad = (n: number, len = 2): string => String(n).padStart(len, "0");

function validateOffset(offsetMinutes: number): void {
  if (
    !Number.isInteger(offsetMinutes) ||
    Math.abs(offsetMinutes) > MAX_OFFSET_MINUTES
  ) {
    throw new RangeError("offsetMinutes must be an integer between -840 and 840");
  }
}

function validateMinuteOfDay(minute: number, name: string): void {
  if (!Number.isInteger(minute) || minute < 0 || minute >= MIN_PER_DAY) {
    throw new RangeError(`${name} must be an integer between 0 and 1439`);
  }
}

function validateRules(rules: NightRules): void {
  if (
    !Number.isInteger(rules.nightWindowHalfHours) ||
    rules.nightWindowHalfHours < 0 ||
    rules.nightWindowHalfHours >= 12 ||
    !Number.isInteger(rules.lateStartHours) ||
    rules.lateStartHours < 0 ||
    rules.lateStartHours >= 24
  ) {
    throw new RangeError("Night rules contain an invalid duration");
  }
}

// ---------- 1. Save a time (ISO-8601 with offset) ----------

/** Epoch milliseconds + local offset (minutes east of UTC) -> ISO-8601 with an explicit offset. */
export function toIsoWithOffset(epochMs: number, offsetMinutes: number): string {
  if (!Number.isInteger(epochMs)) {
    throw new RangeError("epochMs must be a finite integer");
  }
  validateOffset(offsetMinutes);

  const local = new Date(epochMs + offsetMinutes * MS_PER_MIN);
  if (
    !Number.isFinite(local.getTime()) ||
    local.getUTCFullYear() < 0 ||
    local.getUTCFullYear() > 9999
  ) {
    throw new RangeError("epochMs is outside the supported ISO year range");
  }

  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const milliseconds = local.getUTCMilliseconds();
  return (
    `${pad(local.getUTCFullYear(), 4)}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
    `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}` +
    (milliseconds === 0 ? "" : `.${pad(milliseconds, 3)}`) +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** Reverse of toIsoWithOffset. Returns null if the text is not valid. */
export function parseIsoWithOffset(
  iso: string,
): { epochMs: number; offsetMinutes: number } | null {
  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?([+-])(\d{2}):(\d{2})$/.exec(
      iso,
    );
  if (!m) return null;
  const [, y, mo, d, h, mi, s, fraction, sign, oh, om] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  const hour = Number(h);
  const minute = Number(mi);
  const second = Number(s);
  const offsetHour = Number(oh);
  const offsetMinute = Number(om);
  if (
    month < 1 ||
    month > 12 ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 14 ||
    offsetMinute > 59 ||
    (offsetHour === 14 && offsetMinute !== 0)
  ) {
    return null;
  }

  const localAsUtc = new Date(0);
  localAsUtc.setUTCFullYear(year, month - 1, day);
  localAsUtc.setUTCHours(
    hour,
    minute,
    second,
    fraction === undefined ? 0 : Number(fraction.padEnd(3, "0")),
  );
  if (
    localAsUtc.getUTCFullYear() !== year ||
    localAsUtc.getUTCMonth() !== month - 1 ||
    localAsUtc.getUTCDate() !== day
  ) {
    return null;
  }

  const offsetMinutes =
    (sign === "-" ? -1 : 1) * (offsetHour * 60 + offsetMinute);
  const epochMs = localAsUtc.getTime() - offsetMinutes * MS_PER_MIN;
  if (!Number.isFinite(epochMs)) return null;
  return { epochMs, offsetMinutes };
}

// ---------- 2. Sleep day ----------

/** Local date ("YYYY-MM-DD") on which the night ENDS. */
export function sleepDay(nightEndEpochMs: number, offsetMinutes: number): string {
  return toIsoWithOffset(nightEndEpochMs, offsetMinutes).slice(0, 10);
}

// ---------- 3. Night window (any bedtime) ----------

/** bedtimeMin = minutes after midnight (1 pm = 780). Window = bedtime ± halfHours. */
export function nightWindow(bedtimeMin: number, rules: NightRules): MinuteRange {
  validateMinuteOfDay(bedtimeMin, "bedtimeMin");
  validateRules(rules);
  const half = rules.nightWindowHalfHours * 60;
  return {
    startMin: mod(bedtimeMin - half, MIN_PER_DAY),
    endMin: mod(bedtimeMin + half, MIN_PER_DAY),
  };
}

// ---------- 4. Late-start period ----------

/** From end of night window to lateStartHours after it. */
export function lateStartPeriod(bedtimeMin: number, rules: NightRules): MinuteRange {
  const win = nightWindow(bedtimeMin, rules);
  return {
    startMin: win.endMin,
    endMin: mod(win.endMin + rules.lateStartHours * 60, MIN_PER_DAY),
  };
}

// ---------- 5. Is now inside? ----------

/** Minutes after local midnight for an instant. */
export function minuteOfDay(epochMs: number, offsetMinutes: number): number {
  if (!Number.isFinite(epochMs)) {
    throw new RangeError("epochMs must be finite");
  }
  validateOffset(offsetMinutes);
  return mod(Math.floor(epochMs / MS_PER_MIN) + offsetMinutes, MIN_PER_DAY);
}

/** Wrap-aware range check; start inclusive, end exclusive. */
export function isMinuteInRange(minute: number, range: MinuteRange): boolean {
  validateMinuteOfDay(minute, "minute");
  validateMinuteOfDay(range.startMin, "range.startMin");
  validateMinuteOfDay(range.endMin, "range.endMin");
  const { startMin, endMin } = range;
  if (startMin === endMin) return false;
  return startMin < endMin
    ? minute >= startMin && minute < endMin
    : minute >= startMin || minute < endMin;
}

export function isInNightWindow(
  nowMs: number,
  offsetMinutes: number,
  bedtimeMin: number,
  rules: NightRules,
): boolean {
  return isMinuteInRange(minuteOfDay(nowMs, offsetMinutes), nightWindow(bedtimeMin, rules));
}

export function isInLateStartPeriod(
  nowMs: number,
  offsetMinutes: number,
  bedtimeMin: number,
  rules: NightRules,
): boolean {
  return isMinuteInRange(minuteOfDay(nowMs, offsetMinutes), lateStartPeriod(bedtimeMin, rules));
}

// ---------- 6. Average on a 24-hour circle ----------

/** Input: minutes after midnight. Output: integer 0..1439. [1410, 30] -> 0 */
export function circularAverageMinutes(minutes: number[]): number {
  if (minutes.length === 0) throw new Error("circularAverageMinutes: empty input");
  let sumSin = 0;
  let sumCos = 0;
  for (const min of minutes) {
    if (!Number.isFinite(min)) {
      throw new RangeError("circularAverageMinutes values must be finite");
    }
    const angle = (mod(min, MIN_PER_DAY) / MIN_PER_DAY) * 2 * Math.PI;
    sumSin += Math.sin(angle);
    sumCos += Math.cos(angle);
  }
  let avgAngle = Math.atan2(sumSin, sumCos);
  if (avgAngle < 0) avgAngle += 2 * Math.PI;
  const avgMin = Math.round((avgAngle / (2 * Math.PI)) * MIN_PER_DAY);
  return mod(avgMin, MIN_PER_DAY); // also fixes 1440 -> 0 and -0 -> 0
}

// ---------- 7. Duration format ----------

/** 465 -> "7 h 45 m" ; 45 -> "0 h 45 m" ; negative -> "0 h 0 m" */
export function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes)) {
    throw new RangeError("totalMinutes must be finite");
  }
  const safe = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(safe / 60)} h ${safe % 60} m`;
}

// ---------- 8. Elapsed time (monotonic clock) ----------

/**
 * Both values come from a steady clock (e.g. performance.now() / SystemClock.elapsedRealtime),
 * NOT from Date.now(). Phone clock or time zone changes cannot affect the result.
 */
export function elapsedMs(startMonotonicMs: number, nowMonotonicMs: number): number {
  if (!Number.isFinite(startMonotonicMs) || !Number.isFinite(nowMonotonicMs)) {
    throw new RangeError("Monotonic clock readings must be finite");
  }
  return Math.max(0, nowMonotonicMs - startMonotonicMs);
}

export function elapsedMinutes(startMonotonicMs: number, nowMonotonicMs: number): number {
  return Math.floor(elapsedMs(startMonotonicMs, nowMonotonicMs) / MS_PER_MIN);
}