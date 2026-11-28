/**
 * src/services/homeService.ts
 *
 * WPT 202 - Home Screen Data Service (PRD FR-HM-02, FR-HM-04, FR-HM-05, FR-ON-08).
 * Provides dummy data for Sprint 1 / G1. Screens never call the database directly.
 */
import { FC6_FLOWER_COUNT } from '../domain/gardenLayout';
export interface LastNightSummary {
  readonly durationMinutes: number;
  readonly score: number;
  readonly starType: 'star' | 'faint' | 'none';
}

export interface HomeSettings {
  readonly bedtime: {
    readonly hours: number;
    readonly minutes: number;
  };
  readonly wakeUpTime: {
    readonly hours: number;
    readonly minutes: number;
  };
}

export interface HomeData {
  readonly todayFocusMinutes: number;
  readonly nextAlarmTime: string | null;
  readonly currentNightStreak: number;
  readonly hasRecordedNight: boolean;
  readonly lastNightSummary: LastNightSummary | null;
  readonly settings: HomeSettings;
  readonly hasAppBlockingSetup: boolean;
  readonly sceneFlowerCount: number;
  readonly sceneStarCount: number;
}

/** Default dummy data conforming to PRD specifications. */
const DEFAULT_HOME_DATA: HomeData = {
  todayFocusMinutes: 45, // FR-HM-02
  nextAlarmTime: '7:00 am', // FR-HM-02
  currentNightStreak: 5, // FR-HM-02
  hasRecordedNight: true, // FR-HM-04 / FR-HM-05
  lastNightSummary: {
    durationMinutes: 465, // 7h 45m
    score: 85,
    starType: 'star',
  },
  settings: {
    bedtime: { hours: 23, minutes: 0 }, // 11:00 pm (PRD default)
    wakeUpTime: { hours: 7, minutes: 0 }, // 7:00 am (PRD default)
  },
  hasAppBlockingSetup: false, // FR-ON-08: shows setup card on Android when false
  sceneFlowerCount: 18,
  sceneStarCount: 7,
};

let currentHomeData: HomeData = { ...DEFAULT_HOME_DATA };

/**
 * Retrieves the current home screen data.
 * Pure service call that screens consume.
 */
export async function getHomeData(): Promise<HomeData> {
  // Returns a promise to simulate async service interface used in later sprints
  return Promise.resolve({ ...currentHomeData });
}

/** Synchronous getter for instant initial render. */
export function getHomeDataSync(): HomeData {
  return { ...currentHomeData };
}

/**
 * Allows switching between having a recorded night and having no night
 * for testing FR-HM-04 vs FR-HM-05.
 */
export function setDummyHasRecordedNight(hasNight: boolean): void {
  currentHomeData = {
    ...currentHomeData,
    hasRecordedNight: hasNight,
    lastNightSummary: hasNight
      ? { durationMinutes: 465, score: 85, starType: 'star' }
      : null,
  };
}

/** Allows overriding bedtime for testing the theme switch. */
export function setDummyBedtime(hours: number, minutes: number): void {
  currentHomeData = {
    ...currentHomeData,
    settings: {
      ...currentHomeData.settings,
      bedtime: { hours, minutes },
    },
  };
}
/** Records a completed focus session and grows one garden flower. */
export function completeFocusSession(durationMinutes: number): void {
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    return;
  }

  currentHomeData = {
    ...currentHomeData,
    todayFocusMinutes:
      currentHomeData.todayFocusMinutes + durationMinutes,
    sceneFlowerCount: Math.min(
      FC6_FLOWER_COUNT,
      currentHomeData.sceneFlowerCount + 1,
    ),
  };
}

/** Saves onboarding time selections in the in-memory home settings. */
export function setOnboardingTimes(
  bedtime: { hours: number; minutes: number },
  wakeUpTime: { hours: number; minutes: number },
): void {
  currentHomeData = {
    ...currentHomeData,
    settings: {
      bedtime: { ...bedtime },
      wakeUpTime: { ...wakeUpTime },
    },
    nextAlarmTime: `${String(
      wakeUpTime.hours % 12 || 12,
    ).padStart(1, '0')}:${String(wakeUpTime.minutes).padStart(2, '0')} ${
      wakeUpTime.hours >= 12 ? 'pm' : 'am'
    }`,
  };
}

/** Resets dummy data back to defaults. */
export function resetDummyHomeData(): void {
  currentHomeData = { ...DEFAULT_HOME_DATA };
}
