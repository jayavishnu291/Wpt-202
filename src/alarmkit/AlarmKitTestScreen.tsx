
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

import { scheduleNativeAlarm } from '../services/nativeAlarmKit';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AlarmKitTestScreen() {
  const [hour, setHour] = useState('7');
  const [minute, setMinute] = useState('0');
  const [days, setDays] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setDays(current =>
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  const schedule = async () => {
    const h = Number(hour);
    const m = Number(minute);

   if (
  !/^\d{1,2}$/.test(hour) ||
  !/^\d{1,2}$/.test(minute) ||
  h < 0 || h > 23 ||
  m < 0 || m > 59
) {
  setStatus('Invalid time. Use 0-23 hours and 0-59 minutes.');
  return;
}

    if (Platform.OS !== 'ios') {
      setStatus('Native AlarmKit requires iOS.');
      return;
    }

    setLoading(true);
    setStatus('Requesting permission and scheduling...');

    try {
      const success = await scheduleNativeAlarm(h, m, days);
      setStatus(
        success
          ? 'Alarm scheduled successfully.'
          : 'Alarm not scheduled. Check permission, native build and logs.'
      );
    } catch (error) {
      setStatus(`Error: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>WPT202 AlarmKit</Text>
      <Text style={styles.subtitle}>Native iPhone Alarm Test</Text>

      <Text style={styles.label}>Hour (0-23)</Text>
      <TextInput
        style={styles.input}
        value={hour}
        onChangeText={setHour}
        keyboardType="number-pad"
        maxLength={2}
      />

      <Text style={styles.label}>Minute (0-59)</Text>
      <TextInput
        style={styles.input}
        value={minute}
        onChangeText={setMinute}
        keyboardType="number-pad"
        maxLength={2}
      />

      <Text style={styles.label}>Repeat Days</Text>
      <View style={styles.days}>
        {DAYS.map(day => (
          <Pressable
            key={day}
            onPress={() => toggleDay(day)}
            style={[
              styles.day,
              days.includes(day) && styles.selected,
            ]}
          >
            <Text style={styles.dayText}>{day}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={schedule}
        disabled={loading}
        style={[styles.button, loading && styles.disabled]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Scheduling...' : 'Schedule Native Alarm'}
        </Text>
      </Pressable>

      <Text style={styles.status}>{status}</Text>
      <Text style={styles.note}>
        No repeat days selected = one-time alarm.
        Native scheduling requires a compatible iOS build.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 55,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#172554',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 5,
    marginBottom: 25,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 18,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  day: {
    backgroundColor: '#cbd5e1',
    padding: 10,
    borderRadius: 8,
  },
  selected: {
    backgroundColor: '#60a5fa',
  },
  dayText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    marginTop: 25,
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 15,
    color: '#64748b',
    lineHeight: 22,
  },
});
