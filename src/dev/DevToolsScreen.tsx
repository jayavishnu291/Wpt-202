import React from 'react';
import { Link } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** DEV ONLY. One list of every test screen. English only: never shown to users. */
const SCREENS: { href: string; label: string; platform: 'android' | 'ios' | 'both' }[] = [
  { href: '/dev/session-monitor', label: 'H1 · Session monitor (FC-9)', platform: 'android' },
  { href: '/dev/alarm-engine', label: 'H2 · Alarm engine (FC-5)', platform: 'android' },
  { href: '/dev/blocking', label: 'H3 · Blocking (FC-4)', platform: 'android' },
  { href: '/dev/alarmkit', label: 'H4 · iPhone AlarmKit (FC-10, 1, 3, 7)', platform: 'ios' },
  { href: '/dev/lifecycle', label: 'H5 · iPhone lock and app-closed (FC-2, 8)', platform: 'ios' },
];

export default function DevToolsScreen() {
  const visible = SCREENS.filter(
    (screen) => screen.platform === 'both' || screen.platform === Platform.OS,
  );
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Developer tools</Text>
        {visible.map((screen) => (
          <Link key={screen.href} href={screen.href as never} asChild>
            <Pressable accessibilityRole="button" style={styles.button}>
              <Text style={styles.buttonText}>{screen.label}</Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F5EF' },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E2430', marginBottom: 8 },
  button: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#3A7D44',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
