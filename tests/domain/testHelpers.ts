// tests/domain/testHelpers.ts
// Small helpers so the tests read like the PRD examples. Test-only: never imported by src/.

const BASE_DAY_MS = Date.UTC(2026, 9, 1); // 1 Oct 2026

/**
 * A time in India (+05:30).  at(0, "23:00") = 1 Oct 11:00 pm,  at(1, "07:00") = 2 Oct 7:00 am.
 * Optional seconds: at(0, "23:30", 20) = 11:30:20 pm.
 */
export function at(dayOffset: number, hhmm: string, seconds = 0): string {
  const date = new Date(BASE_DAY_MS + dayOffset * 86_400_000).toISOString().slice(0, 10);
  const ss = String(seconds).padStart(2, "0");
  return `${date}T${hhmm}:${ss}+05:30`;
}

/** Minutes after midnight for a clock time: clock("07:00") = 420. */
export function clock(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Milliseconds for an `at()` time, for comparing with results. */
export function ms(iso: string): number {
  return Date.parse(iso);
}
