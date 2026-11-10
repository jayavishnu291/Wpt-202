// tests/domain/testRules.ts
// The rule values from the PRD, handed to the functions the same way the services will hand over
// the values from config/rules.ts. If config/rules.ts exports the same shapes, you may import from
// there instead; the tests then also prove config/rules.ts matches the PRD.

import type {
  MilestoneRules,
  ScoreRules,
  SleepRules,
  StarRules,
  StreakRules,
} from "../../src/domain/calcTypes";

export const SLEEP_RULES: SleepRules = {
  settlingWindowMin: 120, // PRD 11.1(2)
  minUseSec: 30, // PRD 11.1(1)
  wakePointMinAfterStartMin: 180, // PRD 9.5.1(a)
  wakePointMaxAfterStartMin: 600, // PRD 9.5.1(b)
  iphoneWakeCapMin: 180, // PRD 11.1(4)
};

export const SCORE_RULES: ScoreRules = {
  durationMaxPoints: 50,
  regularityBands: [
    { maxGapMin: 30, points: 20 },
    { maxGapMin: 60, points: 16 },
    { maxGapMin: 90, points: 12 },
    { maxGapMin: 120, points: 8 },
    { maxGapMin: 150, points: 4 },
  ],
  regularityBeyondPoints: 0,
  phoneFreePoints: [20, 10, 0],
  wakeMissionPoints: 10,
  wakeMissionSnoozedPoints: 5,
  wakeNoMissionPoints: 0,
  totalMaxPoints: 100,
  missionAfterStopWindowMin: 30, // FR-AL-30
  usualBedtimeNights: 7,
};

export const STAR_RULES: StarRules = { minNightMin: 180 };
export const STREAK_RULES: StreakRules = { maxRestNights: 2, restWindowDays: 7 };
export const MILESTONE_RULES: MilestoneRules = { thresholds: [7, 30, 100] };

export const ALLOWANCE_MIN = 15; // default falling-asleep allowance (FR-SL-04)
export const SLEEP_GOAL_MIN = 480; // default goal 8 h (FR-SL-03)

