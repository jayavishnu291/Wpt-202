// tests/domain/milestones.test.ts  -  PRD 11.5 (7, 30, 100 lifetime stars; faint not counted), FR-GA-11
import {
  countLifetimeStars,
  milestonesReached,
  newlyReachedMilestones,
} from "../../src/domain/milestones";
import type { StarResult } from "../../src/domain/calcTypes";
import { MILESTONE_RULES } from "./testRules";

describe("lifetime stars", () => {
  test("faint stars and empty nights are NOT counted", () => {
    const history: StarResult[] = ["star", "faint", "star", "none", "faint", "star"];
    expect(countLifetimeStars(history)).toBe(3);
  });
  test("an empty history is 0", () => {
    expect(countLifetimeStars([])).toBe(0);
  });
});

describe("milestones at 7, 30 and 100 stars", () => {
  test("none before 7", () => {
    expect(milestonesReached(0, MILESTONE_RULES)).toEqual([]);
    expect(milestonesReached(6, MILESTONE_RULES)).toEqual([]);
  });
  test("exactly 7, 30 and 100 reach the milestone", () => {
    expect(milestonesReached(7, MILESTONE_RULES)).toEqual([7]);
    expect(milestonesReached(29, MILESTONE_RULES)).toEqual([7]);
    expect(milestonesReached(30, MILESTONE_RULES)).toEqual([7, 30]);
    expect(milestonesReached(99, MILESTONE_RULES)).toEqual([7, 30]);
    expect(milestonesReached(100, MILESTONE_RULES)).toEqual([7, 30, 100]);
    expect(milestonesReached(250, MILESTONE_RULES)).toEqual([7, 30, 100]);
  });
  test("a milestone is announced once: only when the star total crosses it", () => {
    expect(newlyReachedMilestones(6, 7, MILESTONE_RULES)).toEqual([7]);
    expect(newlyReachedMilestones(7, 8, MILESTONE_RULES)).toEqual([]);
    expect(newlyReachedMilestones(29, 30, MILESTONE_RULES)).toEqual([30]);
    expect(newlyReachedMilestones(99, 100, MILESTONE_RULES)).toEqual([100]);
  });
  test("a faint star never moves the total, so it never triggers a milestone", () => {
    const before = countLifetimeStars(["star", "star", "star", "star", "star", "star"]); // 6
    const after = countLifetimeStars(["star", "star", "star", "star", "star", "star", "faint"]); // still 6
    expect(newlyReachedMilestones(before, after, MILESTONE_RULES)).toEqual([]);
  });
  test("the thresholds come from the rules, not from the code", () => {
    expect(milestonesReached(5, { thresholds: [5, 10] })).toEqual([5]);
  });
});
