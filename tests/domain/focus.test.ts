// tests/domain/focus.test.ts
// PRD 9.3, FR-FO-01, FR-FO-05, FR-FO-13, AC-FO-1, BRD 12.1

import { rules } from '../../config/rules';
import { colors } from '../../src/ui/theme/tokens';
import {
  clampDuration,
  DEV_SPEED_MULTIPLIER,
  formatTimeRemaining,
  getFocusStage,
  getLastUsedFocusDuration,
  SECONDS_PER_MINUTE,
  setLastUsedFocusDuration,
  stepCustomDuration,
} from '../../src/domain/focus';

describe('focus stages (PRD FR-FO-05)', () => {
  test('seed: 0% to 24.99%', () => {
    expect(getFocusStage(0)).toBe('seed');
    expect(getFocusStage(0.1)).toBe('seed');
    expect(getFocusStage(0.24)).toBe('seed');
    expect(getFocusStage(0.249)).toBe('seed');
  });

  test('sprout: 25% to 49.99%', () => {
    expect(getFocusStage(0.25)).toBe('sprout');
    expect(getFocusStage(0.35)).toBe('sprout');
    expect(getFocusStage(0.499)).toBe('sprout');
  });

  test('bud: 50% to 99.99%', () => {
    expect(getFocusStage(0.5)).toBe('bud');
    expect(getFocusStage(0.75)).toBe('bud');
    expect(getFocusStage(0.999)).toBe('bud');
  });

  test('bloom: 100% and above', () => {
    expect(getFocusStage(1.0)).toBe('bloom');
    expect(getFocusStage(1.25)).toBe('bloom');
  });
});

describe('focus time formatting', () => {
  test('formats whole minutes and seconds', () => {
    expect(formatTimeRemaining(1500)).toBe('25:00');
    expect(formatTimeRemaining(2700)).toBe('45:00');
    expect(formatTimeRemaining(3600)).toBe('60:00');
    expect(formatTimeRemaining(65)).toBe('01:05');
    expect(formatTimeRemaining(9)).toBe('00:09');
    expect(formatTimeRemaining(0)).toBe('00:00');
  });

  test('clamps negative values to 00:00', () => {
    expect(formatTimeRemaining(-10)).toBe('00:00');
  });
});

describe('custom duration limits and stepper (FR-FO-01, FR-FO-13)', () => {
  test('rules config matches PRD 9.3', () => {
    expect(rules.focus.presetsMinutes).toEqual([25, 45, 60]);
    expect(rules.focus.customMinMinutes).toBe(10);
    expect(rules.focus.customMaxMinutes).toBe(120);
    expect(rules.focus.customStepMinutes).toBe(5);
    expect(rules.focus.minimumMinutes).toBe(10);
  });

  test('steps up by customStepMinutes', () => {
    expect(stepCustomDuration(25, 'up')).toBe(30);
    expect(stepCustomDuration(30, 'up')).toBe(35);
  });

  test('steps down by customStepMinutes', () => {
    expect(stepCustomDuration(35, 'down')).toBe(30);
    expect(stepCustomDuration(30, 'down')).toBe(25);
  });

  test('does not step below minimum allowed duration (10 min, FR-FO-13)', () => {
    expect(stepCustomDuration(10, 'down')).toBe(10);
    expect(stepCustomDuration(12, 'down')).toBe(10);
  });

  test('does not step above maximum allowed duration (120 min, FR-FO-01)', () => {
    expect(stepCustomDuration(120, 'up')).toBe(120);
    expect(stepCustomDuration(118, 'up')).toBe(120);
  });
});

describe('developer speed-up calculations (FR-FO-14)', () => {
  test('DEV_SPEED_MULTIPLIER accelerates timer by 60x', () => {
    expect(DEV_SPEED_MULTIPLIER).toBe(60);
    expect(SECONDS_PER_MINUTE).toBe(60);

    // In 1 real second at 60x speed, 60 focus seconds (1 focus minute) elapse
    const realSecondsElapsed = 1;
    const focusSecondsElapsed = realSecondsElapsed * DEV_SPEED_MULTIPLIER;
    expect(focusSecondsElapsed).toBe(60);

    // 25 minutes (1500 seconds) elapses in exactly 25 real seconds
    const totalFocusSeconds = 25 * SECONDS_PER_MINUTE;
    const realTimeNeededSeconds = totalFocusSeconds / DEV_SPEED_MULTIPLIER;
    expect(realTimeNeededSeconds).toBe(25);
  });
});

describe('last-used duration memory and clamping (FR-FO-01)', () => {
  test('defaults to first preset (25 min)', () => {
    expect(rules.focus.presetsMinutes[0]).toBe(25);
  });

  test('remembers and restores updated duration', () => {
    setLastUsedFocusDuration(45);
    expect(getLastUsedFocusDuration()).toBe(45);

    setLastUsedFocusDuration(35);
    expect(getLastUsedFocusDuration()).toBe(35);

    // Reset back to default
    setLastUsedFocusDuration(rules.focus.presetsMinutes[0]);
    expect(getLastUsedFocusDuration()).toBe(25);
  });

  test('clamps custom duration to [10, 120] range', () => {
    expect(clampDuration(5)).toBe(10);
    expect(clampDuration(10)).toBe(10);
    expect(clampDuration(50)).toBe(50);
    expect(clampDuration(120)).toBe(120);
    expect(clampDuration(150)).toBe(120);
  });

  test('rules config defines dummyBlockedAppsCount and stageThresholds', () => {
    expect(rules.focus.dummyBlockedAppsCount).toBe(4);
    expect(rules.focus.devSpeedMultiplier).toBe(60);
    expect(rules.focus.stageThresholds).toEqual({
      seedMax: 0.25,
      sproutMax: 0.50,
      budMax: 1.00,
    });
  });
});

describe('focus theme rules (PRD Section 8.1)', () => {
  test('day theme colors match PRD Section 8.1 specification', () => {
    // PRD Section 8.1: Day Theme used on Focus screens
    // Background: #F7F5EF, Main text: #1E2430, Accent: #3A7D44
    expect(colors.day.bg).toBe('#F7F5EF');
    expect(colors.day.text).toBe('#1E2430');
    expect(colors.day.accent).toBe('#3A7D44');
  });
});
