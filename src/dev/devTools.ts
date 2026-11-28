/**
 * Developer tools are visible in development builds, and in the "Android Test APK"
 * build (EXPO_PUBLIC_BLOCKING_TEST=1). Never in a store build.
 */
export const DEV_TOOLS_ENABLED: boolean =
  __DEV__ || process.env.EXPO_PUBLIC_BLOCKING_TEST === '1';
