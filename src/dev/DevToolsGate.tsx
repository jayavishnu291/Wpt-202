import React, { useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';

import BlockingTestScreen from './BlockingTestScreen';
import { GardenTestScreen } from './GardenTestScreen';
import SessionMonitorScreen from './SessionMonitorScreen';

/**
 * TEST BUILDS ONLY. A small "Dev tools" button on top of the app that opens the dev test screens:
 * blocking (H3 / FC-4), session monitor (H1 / FC-9) and garden (G1 / FC-6).
 * Shown only in development builds or in a test build made with EXPO_PUBLIC_BLOCKING_TEST=1.
 */
const ENABLED: boolean = __DEV__ || process.env.EXPO_PUBLIC_BLOCKING_TEST === '1';

type ToolId = 'blocking' | 'session' | 'garden';

const TOOLS: { id: ToolId; label: string }[] = [
  { id: 'blocking', label: 'Blocking test (H3 / FC-4)' },
  { id: 'session', label: 'Session monitor (H1 / FC-9)' },
  { id: 'garden', label: 'Garden test (G1 / FC-6)' },
];

export function DevToolsGate({ children }: { children?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tool, setTool] = useState<ToolId | null>(null);

  if (!ENABLED) {
    return <>{children}</>;
  }

  const top = (StatusBar.currentHeight ?? 24) + 8;

  return (
    <View style={styles.root}>
      {children}
      <Pressable style={[styles.openButton, { top }]} onPress={() => setMenuOpen(true)}>
        <Text style={styles.buttonText}>Dev tools</Text>
      </Pressable>

      <Modal visible={menuOpen} animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={[styles.menu, { paddingTop: top + 56 }]}>
          {TOOLS.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setTool(item.id);
              }}
            >
              <Text style={styles.buttonText}>{item.label}</Text>
            </Pressable>
          ))}
          <Pressable style={[styles.closeButton, { top }]} onPress={() => setMenuOpen(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={tool !== null} animationType="slide" onRequestClose={() => setTool(null)}>
        <View style={styles.root}>
          {tool === 'blocking' ? <BlockingTestScreen /> : null}
          {tool === 'session' ? <SessionMonitorScreen /> : null}
          {tool === 'garden' ? <GardenTestScreen /> : null}
          <Pressable style={[styles.closeButton, { top }]} onPress={() => setTool(null)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  menu: { flex: 1, padding: 24, gap: 12, backgroundColor: '#F7F5EF' },
  menuItem: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3A7D44',
    justifyContent: 'center',
  },
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
