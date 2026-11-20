import { Redirect } from 'expo-router';

import SessionMonitorTestScreen from '../../session-monitor/SessionMonitorTestScreen';

export default function SessionMonitorRoute() {
  if (!__DEV__) {
    return <Redirect href="/(tabs)" />;
  }

  return <SessionMonitorTestScreen />;
}
