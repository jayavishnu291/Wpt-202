import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

import type { LauncherApp } from './AppList.types';

type NativeAppList = {
  getLauncherApps(): Promise<LauncherApp[]>;
};

// Android only (FR-BL-11: iPhone has no app blocking). On any other platform, or if the native
// module is missing, we return an empty list instead of crashing.
const native: NativeAppList | null =
  Platform.OS === 'android' ? requireOptionalNativeModule<NativeAppList>('AppList') : null;

/**
 * Apps that have a home-screen icon, sorted by name (A to Z).
 * Uses the standard launcher query (ACTION_MAIN + CATEGORY_LAUNCHER), never "all packages".
 */
export async function getLauncherApps(): Promise<LauncherApp[]> {
  if (!native) {
    return [];
  }
  try {
    return await native.getLauncherApps();
  } catch (error) {
    console.warn('[app-list] could not read the app list', error);
    return [];
  }
}
