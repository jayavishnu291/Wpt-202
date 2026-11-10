// src/domain/milestones.ts  -  PRD 11.5 (lifetime stars at 7, 30, 100; faint stars not counted)

import type { MilestoneRules, StarResult } from "./calcTypes";

/** Lifetime stars: only real stars. Faint stars and "none" are not counted. */
export function countLifetimeStars(results: StarResult[]): number {
  return results.filter((r) => r === "star").length;
}

/** All milestones reached so far (ascending). */
export function milestonesReached(starsTotal: number, rules: MilestoneRules): number[] {
  return [...rules.thresholds].sort((a, b) => a - b).filter((t) => starsTotal >= t);
}

/** Milestones crossed by going from `starsBefore` to `starsAfter` (show the celebration once). */
export function newlyReachedMilestones(
  starsBefore: number,
  starsAfter: number,
  rules: MilestoneRules,
): number[] {
  return [...rules.thresholds]
    .sort((a, b) => a - b)
    .filter((t) => starsBefore < t && starsAfter >= t);
}
