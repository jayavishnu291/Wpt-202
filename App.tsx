import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  readEvents,
  serviceType,
  startTestSession,
  stopSession,
  stopServiceForTest,
} from './modules/session-monitor/src';
import type { SessionEvent, SessionKind } from './modules/session-monitor/src';

const SESSION_OPTIONS: Array<{ kind: SessionKind; durationMs: number }> = [
  { kind: 'focus', durationMs: 15 * 60_000 },
  { kind: 'night', durationMs: 8 * 60 * 60_000 },
  { kind: 'nap', durationMs: 60 * 60_000 },
];

export default function App() {
  if (!__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Session monitor</Text>
        <Text style={styles.body}>The session monitor panel is available in development builds.</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return <SessionMonitorPanel />;
}

function SessionMonitorPanel() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshEvents = useCallback(async () => {
    if (Platform.OS !== 'android') return;
    try {
      setEvents(await readEvents());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(successMessage);
      await refreshEvents();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  };

  const start = (kind: SessionKind, durationMs: number) => {
    const plannedEndMs = Date.now() + durationMs;
    void runAction(
      () => startTestSession(kind, plannedEndMs),
      `${capitalize(kind)} session started.`,
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>DEVELOPER TOOLS</Text>
        <Text style={styles.title}>Session monitor</Text>
        <Text style={styles.body}>Android foreground service type: {serviceType}</Text>

        {Platform.OS === 'android' ? (
          <>
            <View style={styles.actions}>
              {SESSION_OPTIONS.map(({ kind, durationMs }) => (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  key={kind}
                  onPress={() => start(kind, durationMs)}
                  style={[styles.button, busy && styles.disabled]}
                >
                  <Text style={styles.buttonText}>Start {kind} test</Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void runAction(stopSession, 'Session stopped.');
                }}
                style={[styles.button, styles.stopButton, busy && styles.disabled]}
              >
                <Text style={styles.buttonText}>Stop session</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void runAction(
                    stopServiceForTest,
                    'Service stopped; the next heartbeat should record its recovery.',
                  );
                }}
                style={[styles.button, styles.stopButton, busy && styles.disabled]}
              >
                <Text style={styles.buttonText}>Stop service (missing-service test)</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void refreshEvents()}
                style={[styles.button, styles.secondaryButton, busy && styles.disabled]}
              >
                <Text style={styles.secondaryButtonText}>Refresh events</Text>
              </Pressable>
            </View>

            {busy ? <ActivityIndicator color="#245c4b" style={styles.spinner} /> : null}
            {message ? <Text style={styles.message}>{message}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <Text style={styles.sectionTitle}>Recorded events ({events.length})</Text>
            {events.length === 0 ? (
              <Text style={styles.body}>No session events recorded yet.</Text>
            ) : (
              events.slice().reverse().map((event) => (
                <View key={`${event.seq}-${event.session_id}`} style={styles.event}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>{event.type.replaceAll('_', ' ')}</Text>
                    <Text style={styles.eventSequence}>#{event.seq}</Text>
                  </View>
                  <Text style={styles.eventTime}>{event.at}</Text>
                  <Text style={styles.eventDetails}>
                    {event.kind ? `${capitalize(event.kind)} · ` : ''}
                    Boot {event.boot_count} · elapsed {event.elapsed} ms
                  </Text>
                  {event.detail ? <Text style={styles.eventDetails}>{event.detail}</Text> : null}
                </View>
              ))
            )}
          </>
        ) : (
          <Text style={styles.body}>The native session monitor is currently Android-only.</Text>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f5',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
  },
  eyebrow: {
    color: '#52786b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: '#18352d',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#52635d',
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    marginTop: 24,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#245c4b',
    borderRadius: 10,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stopButton: {
    backgroundColor: '#8b3c37',
  },
  secondaryButton: {
    backgroundColor: '#e4ece7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#18352d',
    fontSize: 15,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
  spinner: {
    marginTop: 20,
  },
  message: {
    color: '#245c4b',
    marginTop: 16,
  },
  error: {
    color: '#a52f28',
    marginTop: 16,
  },
  sectionTitle: {
    color: '#18352d',
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 32,
  },
  event: {
    backgroundColor: '#fff',
    borderColor: '#e3e9e5',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  eventHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventType: {
    color: '#18352d',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  eventSequence: {
    color: '#6b7b74',
    fontSize: 12,
  },
  eventTime: {
    color: '#52635d',
    marginTop: 6,
  },
  eventDetails: {
    color: '#6b7b74',
    fontSize: 12,
    marginTop: 4,
  },
});
