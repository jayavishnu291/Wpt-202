import React, { useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';

import BlockingTestScreen from './BlockingTestScreen';

/**
 * Doorway to the dev-only blocking test screen. Works with ANY navigation (no Expo Router needed).
 *
 * It shows a small "Blocking test" button on top of your app. Tap it: the test screen opens full
 * screen. Tap "Close" to go back to the app.
 *
 * The button exists ONLY in development builds, or in a test build made with
 * EXPO_PUBLIC_BLOCKING_TEST=1 (see FIXES_README.md). In a normal release build it renders nothing
 * extra, so nobody outside the team ever sees it.
 */
export const BLOCKING_TEST_ENABLED: boolean =
  __DEV__ || process.env.EXPO_PUBLIC_BLOCKING_TEST === '1';

export function DevBlockingGate({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  if (!BLOCKING_TEST_ENABLED) {
    return <>{children}</>;
  }

  const top = (StatusBar.currentHeight ?? 24) + 8;

  return (
    <View style={styles.root}>
      {children}
      <Pressable style={[styles.openButton, { top }]} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>Blocking test</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.root}>
          <BlockingTestScreen />
          <Pressable style={[styles.closeButton, { top }]} onPress={() => setOpen(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

/**
 * Wrap your root component once:
 *   function App() { ...your existing code... }
 *   export default withBlockingTestGate(App);
 */
export function withBlockingTestGate<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const Wrapped = (props: P) => (
    <DevBlockingGate>
      <Component {...props} />
    </DevBlockingGate>
  );
  return Wrapped;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  openButton: {
    position: 'absolute',
    right: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#3A7D44',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#1E2430',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    zIndex: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
