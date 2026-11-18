
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
 hotel/h2-fc5-pr
import { useCallback, useEffect, useState } from 'react';
import AlarmKitTestScreen from './src/alarmkit/AlarmKitTestScreen';

import {
  isAvailable as isAndroidAlarmAvailable,
  canScheduleExactAlarms,
  scheduleTestAlarm,
} from './modules/alarm-engine/src';

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

import type {
  SessionEvent,
  SessionKind,
} from './modules/session-monitor/src';

const SESSION_OPTIONS: {
  kind: SessionKind;
  durationMs: number;
}[] = [
  { kind: 'focus', durationMs: 15 * 60_000 },
  { kind: 'night', durationMs: 8 * 60 * 60_000 },
  { kind: 'nap', durationMs: 60 * 60_000 },
];

export default function App() {
  if (Platform.OS === 'ios') {
    return <AlarmKitTestScreen />;
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
      setError(
        caught instanceof Error
          ? caught.message
          : String(caught)
      );
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshEvents();
  }, [refreshEvents]);

  const runAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await action();
      setMessage(successMessage);
      await refreshEvents();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : String(caught)
      );
    } finally {
      setBusy(false);
    }
  };

  const start = (
    kind: SessionKind,
    durationMs: number
  ) => {
    // eslint-disable-next-line react-hooks/purity
    const plannedEndMs = Date.now() + durationMs;

    void runAction(
      () => startTestSession(kind, plannedEndMs),
      `${capitalize(kind)} session started.`
    );
  };

  // H2 FC-5: Android native alarm scheduling test
  const testAndroidAlarm = async () => {
    if (Platform.OS !== 'android') {
      setError('This test is available only on Android.');
      return;
    }

    if (!isAndroidAlarmAvailable()) {
      setError('Android native AlarmEngine module unavailable.');
      return;
    }

    if (!canScheduleExactAlarms()) {
      setError(
        'Exact alarm permission required. Enable Alarms & reminders in Android Settings.'
      );
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const timeMs = Date.now() + 2 * 60 * 1000;
      const success = await scheduleTestAlarm(timeMs);

      if (success) {
        setMessage(
          'H2 Android alarm scheduled for 2 minutes from now.'
        );
      } else {
        setError('H2 Android alarm scheduling failed.');
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : String(caught)
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>
          DEVELOPER TOOLS
        </Text>

        <Text style={styles.title}>
          Session monitor
        </Text>

        <Text style={styles.body}>
          Android foreground service type: {serviceType}
        </Text>

        {Platform.OS === 'android' ? (
          <>
            <View style={styles.actions}>
              {/* H2 FC-5 Android Alarm Test */}
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void testAndroidAlarm()}
                style={[
                  styles.button,
                  busy && styles.disabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  Test Android Alarm (2 Minutes)
                </Text>
              </Pressable>

              {/* Existing H5 Session Tests */}
              {SESSION_OPTIONS.map(({ kind, durationMs }) => (
                <Pressable
                  key={kind}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => start(kind, durationMs)}
                  style={[
                    styles.button,
                    busy && styles.disabled,
                  ]}
                >
                  <Text style={styles.buttonText}>
                    Start {kind} test
                  </Text>
                </Pressable>
              ))}

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void runAction(
                    stopSession,
                    'Session stopped.'
                  );
                }}
                style={[
                  styles.button,
                  styles.stopButton,
                  busy && styles.disabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  Stop session
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => {
                  void runAction(
                    stopServiceForTest,
                    'Service stopped; the next heartbeat should record its recovery.'
                  );
                }}
                style={[
                  styles.button,
                  styles.stopButton,
                  busy && styles.disabled,
                ]}
              >
                <Text style={styles.buttonText}>
                  Stop service (missing-service test)
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void refreshEvents()}
                style={[
                  styles.button,
                  styles.secondaryButton,
                  busy && styles.disabled,
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  Refresh events
                </Text>
              </Pressable>
            </View>

            {busy ? (
              <ActivityIndicator
                color="#245c4b"
                style={styles.spinner}
              />
            ) : null}

            {message ? (
              <Text style={styles.message}>
                {message}
              </Text>
            ) : null}

            {error ? (
              <Text
                accessibilityRole="alert"
                style={styles.error}
              >
                {error}
              </Text>
            ) : null}

            <Text style={styles.sectionTitle}>
              Recorded events ({events.length})
            </Text>

            {events.length === 0 ? (
              <Text style={styles.body}>
                No session events recorded yet.
              </Text>
            ) : (
              events.slice().reverse().map((event) => (
                <View
                  key={`${event.seq}-${event.session_id}`}
                  style={styles.event}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>
                      {event.type.replaceAll('_', ' ')}
                    </Text>

                    <Text style={styles.eventSequence}>
                      #{event.seq}
                    </Text>
                  </View>

                  <Text style={styles.eventTime}>
                    {event.at}
                  </Text>

                  <Text style={styles.eventDetails}>
                    {event.kind
                      ? `${capitalize(event.kind)} · `
                      : ''}
                    Boot {event.boot_count} · elapsed{' '}
                    {event.elapsed} ms
                  </Text>

                  {event.detail ? (
                    <Text style={styles.eventDetails}>
                      {event.detail}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : (
          <Text style={styles.body}>
            The native session monitor is currently
            Android-only.
          </Text>
        )}
      </ScrollView>

      <StatusBar style="auto" />

import { StyleSheet, Text, View } from 'react-native';
import { withBlockingTestGate } from './src/dev/DevBlockingGate';

function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {screen === 'list' ? (
        <AlarmListScreen
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      ) : (
        <AlarmEditScreen
          initialAlarm={selectedAlarm}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
 main
    </View>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1020',
  },
});
export default withBlockingTestGate(App);