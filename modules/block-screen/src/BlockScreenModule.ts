import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

import type { BlockLogEntry, BlockingStatus, RestingMode } from './BlockScreen.types';

type NativeBlockScreen = {
  getBlockingStatus(): BlockingStatus;
  openUsageAccessSettings(): boolean;
  openOverlaySettings(): boolean;
  startTestSession(blocked: string[], allowed: string[], mode: string): BlockingStatus;
  stopTestSession(): BlockingStatus;
  getNeverBlockablePackages(): Promise<string[]>;
  getEventLog(): BlockLogEntry[];
  clearEventLog(): void;
};

// Android only. On any other platform (or if the native module is missing) every function below
// answers "Blocking is off" instead of crashing (FR-BL-07, FR-BL-11).
const native: NativeBlockScreen | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<NativeBlockScreen>('BlockScreen') : null;

const BLOCKING_OFF: BlockingStatus = {
  usageAccess: false,
  overlay: false,
  blockingAvailable: false,
  sessionRunning: false,
  blockingActive: false,
  permissionLostDuringSession: false,
};

export async function getBlockingStatus(): Promise<BlockingStatus> {
  if (!native) return BLOCKING_OFF;
  try {
    return native.getBlockingStatus();
  } catch (error) {
    console.warn('[block-screen] getBlockingStatus failed', error);
    return BLOCKING_OFF;
  }
}

/** Opens the system "Usage access" screen. Show the explainer (PRD 9.1.1) BEFORE calling this. */
export async function openUsageAccessSettings(): Promise<boolean> {
  if (!native) return false;
  try {
    return native.openUsageAccessSettings();
  } catch (error) {
    console.warn('[block-screen] openUsageAccessSettings failed', error);
    return false;
  }
}

/** Opens the system "Display over other apps" screen. Show the explainer (PRD 9.1.1) BEFORE calling this. */
export async function openOverlaySettings(): Promise<boolean> {
  if (!native) return false;
  try {
    return native.openOverlaySettings();
  } catch (error) {
    console.warn('[block-screen] openOverlaySettings failed', error);
    return false;
  }
}

/**
 * Starts the dev-only test session. If either permission is missing, nothing is blocked and the
 * returned status has blockingAvailable = false (FR-BL-07).
 */
export async function startTestSession(
  blockedPackages: string[],
  allowedPackages: string[] = [],
  mode: RestingMode = 'focus'
): Promise<BlockingStatus> {
  if (!native) return BLOCKING_OFF;
  try {
    return native.startTestSession(blockedPackages, allowedPackages, mode);
  } catch (error) {
    console.warn('[block-screen] startTestSession failed', error);
    return BLOCKING_OFF;
  }
}

export async function stopTestSession(): Promise<BlockingStatus> {
  if (!native) return BLOCKING_OFF;
  try {
    return native.stopTestSession();
  } catch (error) {
    console.warn('[block-screen] stopTestSession failed', error);
    return BLOCKING_OFF;
  }
}

/** Package names that can never be blocked (phone, emergency, clock, Settings, home screen, our app). FR-BL-03. */
export async function getNeverBlockablePackages(): Promise<string[]> {
  if (!native) return [];
  try {
    return await native.getNeverBlockablePackages();
  } catch (error) {
    console.warn('[block-screen] getNeverBlockablePackages failed', error);
    return [];
  }
}

/** Newest entries last. Classes only, never package names. */
export async function getEventLog(): Promise<BlockLogEntry[]> {
  if (!native) return [];
  try {
    return native.getEventLog();
  } catch (error) {
    console.warn('[block-screen] getEventLog failed', error);
    return [];
  }
}

export async function clearEventLog(): Promise<void> {
  if (!native) return;
  try {
    native.clearEventLog();
  } catch (error) {
    console.warn('[block-screen] clearEventLog failed', error);
  }
}
