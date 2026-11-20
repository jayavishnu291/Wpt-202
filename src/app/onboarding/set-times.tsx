
import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { t } from '../../text/t';

export default function SetTimesScreen() {
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [reminder, setReminder] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.timesTitle')}
      </Text>

      <Text style={styles.label}>
        {t('onboarding.bedtimeLabel')}
      </Text>
      <Pressable
        style={styles.timeButton}
        onPress={() =>
          setBedtime(bedtime === '23:00' ? '22:00' : '23:00')
        }
      >
        <Text style={styles.timeText}>{bedtime}</Text>
        <Text style={styles.hint}>{t('onboarding.tapToChange')}</Text>
      </Pressable>

      <Text style={styles.label}>
        {t('onboarding.wakeTimeLabel')}
      </Text>
      <Pressable
        style={styles.timeButton}
        onPress={() =>
          setWakeTime(wakeTime === '07:00' ? '06:00' : '07:00')
        }
      >
        <Text style={styles.timeText}>{wakeTime}</Text>
        <Text style={styles.hint}>{t('onboarding.tapToChange')}</Text>
      </Pressable>

      <View style={styles.reminderRow}>
        <Text style={styles.reminderText}>
          {t('onboarding.bedtimeReminder')}
        </Text>
        <Switch
          value={reminder}
          onValueChange={setReminder}
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>
          {t('onboarding.timesSave')}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 35,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 10,
  },
  timeButton: {
    backgroundColor: '#F2F0FF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  hint: {
    fontSize: 12,
    color: '#888888',
    marginTop: 5,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  reminderText: {
    fontSize: 15,
    color: '#555555',
    flex: 1,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
