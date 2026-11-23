/**
 * src/domain/focus.ts
 *
 * Focus mode domain rules and calculations.
 * PRD refs: FR-FO-01, FR-FO-05, FR-FO-13, Tech Architecture section 4, BRD 12.1.
 * Pure TypeScript: no React, no React Native, no Skia, no Math.random().
 */

import { rules } from '../../config/rules';

export type FocusStage = 'seed' | 'sprout' | 'bud' | 'bloom';

export const SECONDS_PER_MINUTE = 60;
export const DEV_SPEED_MULTIPLIER = rules.focus.devSpeedMultiplier;

let lastUsedDuration: number = rules.focus.presetsMinutes[0];

export function getLastUsedFocusDuration(): number {
  return lastUsedDuration;
}

export function setLastUsedFocusDuration(minutes: number): void {
  lastUsedDuration = clampDuration(minutes);
}

export function clampDuration(
  minutes: number,
  minMinutes: number = rules.focus.customMinMinutes,
  maxMinutes: number = rules.focus.customMaxMinutes
): number {
  return Math.min(maxMinutes, Math.max(minMinutes, minutes));
}

/**
 * Returns the growth stage of a flower from its progress ratio (0.0 to 1.0+).
 * FR-FO-05:
 *   - seed:   0–24% (progress < 0.25)
 *   - sprout: 25–49% (0.25 <= progress < 0.50)
 *   - bud:    50–99% (0.50 <= progress < 1.00)
 *   - bloom:  100%   (progress >= 1.00)
 */
export function getFocusStage(
  progress: number,
  thresholds = rules.focus.stageThresholds
): FocusStage {
  if (progress >= thresholds.budMax) {
    return 'bloom';
  }
  if (progress >= thresholds.sproutMax) {
    return 'bud';
  }
  if (progress >= thresholds.seedMax) {
    return 'sprout';
  }
  return 'seed';
}

/**
 * Formats remaining seconds as "mm:ss".
 * Negative numbers are clamped to 00:00.
 */
export function formatTimeRemaining(seconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const mm = Math.floor(safeSeconds / SECONDS_PER_MINUTE);
  const ss = safeSeconds % SECONDS_PER_MINUTE;
  const mmStr = mm < 10 ? `0${mm}` : `${mm}`;
  const ssStr = ss < 10 ? `0${ss}` : `${ss}`;
  return `${mmStr}:${ssStr}`;
}

/**
 * Steps a custom duration up or down by rules.focus.customStepMinutes,
 * clamping within [customMinMinutes, customMaxMinutes].
 * FR-FO-01, FR-FO-13.
 */
export function stepCustomDuration(
  currentMinutes: number,
  direction: 'up' | 'down',
  minMinutes: number = rules.focus.customMinMinutes,
  maxMinutes: number = rules.focus.customMaxMinutes,
  stepMinutes: number = rules.focus.customStepMinutes
): number {
  const delta = direction === 'up' ? stepMinutes : -stepMinutes;
  const next = currentMinutes + delta;
  return clampDuration(next, minMinutes, maxMinutes);
}
