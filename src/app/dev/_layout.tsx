import { Redirect, Stack } from 'expo-router';

import { DEV_TOOLS_ENABLED } from '../../dev/devTools';

/** Every screen under /dev is developer-only. In a store build it sends you Home. */
export default function DevLayout() {
  if (!DEV_TOOLS_ENABLED) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: true, title: '' }} />;
}
