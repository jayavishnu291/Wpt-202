// src/domain/stars.ts  -  PRD 11.3 (star) and FR-NI-09 / FR-NI-10 (one star per sleep day)

import type { NightKind, StarResult, StarRules } from "./calcTypes";

export interface StarDecisionInput {
  kind: NightKind;
  /** Night start to night end, in minutes (see nightLengthMin in sleep.ts). */
  nightLengthMin: number;
  /** Output of pickupsUsedForScoring (detected pickups, raised to 1 by a "Yes"). */
  pickupsUsed: number;
  /** True if an EARLIER night (not nap) of 3+ hours on the same sleep day already decided that day. */
  sleepDayAlreadyDecided: boolean;
  rules: StarRules;
}

export interface StarDecision {
  star: StarResult;
  /** True only for the night that decides the sleep day's star (the `counted_for_star` column). */
  countedForStar: boolean;
}

export function decideStar(input: StarDecisionInput): StarDecision {
  // Naps never earn stars.
  if (input.kind === "nap") return { star: "none", countedForStar: false };
  // Under 3 hours: nothing, and it does not use up the day's one star.
  if (input.nightLengthMin < input.rules.minNightMin) return { star: "none", countedForStar: false };
  // One star per sleep day: the FIRST 3+ hour night decided it; later ones are scored but earn no star.
  if (input.sleepDayAlreadyDecided) return { star: "none", countedForStar: false };

  return input.pickupsUsed === 0
    ? { star: "star", countedForStar: true }
    : { star: "faint", countedForStar: true };
}

export interface NightOnSleepDay {
  kind: NightKind;
  star: StarResult;
  countedForStar: boolean;
}

/** Has a night (not nap) already decided this sleep day's star? Pass the nights of ONE sleep day. */
export function sleepDayAlreadyDecided(nightsOnThatDay: NightOnSleepDay[]): boolean {
  return nightsOnThatDay.some((n) => n.kind === "night" && n.countedForStar);
}

/**
 * What the sleep day produced, for the streak: the deciding night's result, or "none" when the day
 * had no qualifying night. Naps are ignored completely.
 */
export function sleepDayOutcome(nightsOnThatDay: NightOnSleepDay[]): StarResult {
  const deciding = nightsOnThatDay.find((n) => n.kind === "night" && n.countedForStar);
  return deciding ? deciding.star : "none";
}
