import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { isOn } from '../../../config/rules';
import { getSettings, saveSettings } from '../../services/data';

import WelcomeScreen from './welcome';
import HowItWorksScreen from './how-it-works';
import SetTimesScreen from './set-times';
import PermissionSheet from './permission-sheet';
import OemGuideScreen from './oem-guide';

type Step =
  | 'loading'
  | 'welcome'
  | 'how'
  | 'times'
  | 'permissions'
  | 'oem'
  | 'error';

function toTimeParts(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number);

  return {
    hours: Number.isFinite(hours) ? hours : 23,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

function toTimeString(time: { hours: number; minutes: number }): string {
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
}

export default function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('loading');
  const [bedtime, setBedtime] = useState({ hours: 23, minutes: 0 });
  const [wakeUpTime, setWakeUpTime] = useState({ hours: 7, minutes: 0 });
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const reminderAvailable = isOn('SW-14');

  useEffect(() => {
    let mounted = true;

    getSettings()
      .then((settings) => {
        if (!mounted) return;

        setBedtime(toTimeParts(settings.bedtime));
        setWakeUpTime(toTimeParts(settings.default_wake_time));
        setReminderEnabled(settings.reminder_on && reminderAvailable);
        setStep('welcome');
      })
      .catch((error: unknown) => {
        console.error('Failed to load onboarding settings:', error);

        if (mounted) {
          setErrorMessage('Unable to load your settings. Please restart the app.');
          setStep('error');
        }
      });

    return () => {
      mounted = false;
    };
  }, [reminderAvailable]);

  const handleTimesContinue = async (settings: {
    bedtime: { hours: number; minutes: number };
    wakeUpTime: { hours: number; minutes: number };
    reminderEnabled: boolean;
  }) => {
    try {
      const reminder = reminderAvailable && settings.reminderEnabled;

      await saveSettings({
        bedtime: toTimeString(settings.bedtime),
        default_wake_time: toTimeString(settings.wakeUpTime),
        reminder_on: reminder,
      });

      setBedtime(settings.bedtime);
      setWakeUpTime(settings.wakeUpTime);
      setReminderEnabled(reminder);
      setStep('permissions');
    } catch (error) {
      console.error('Failed to save onboarding settings:', error);
      setErrorMessage('Unable to save your settings. Please try again.');
      setStep('error');
    }
  };

  const handleFinish = async () => {
    try {
      await saveSettings({ onboarding_done: true });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setErrorMessage('Unable to finish setup. Please try again.');
      setStep('error');
    }
  };

  if (step === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3A7D44" />
      </View>
    );
  }

  if (step === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (step === 'welcome') {
    return (
      <WelcomeScreen
        onGetStarted={() => setStep('how')}
      />
    );
  }

  if (step === 'how') {
    return (
      <HowItWorksScreen
        onBack={() => setStep('welcome')}
        onContinue={() => setStep('times')}
      />
    );
  }

  if (step === 'times') {
    return (
      <SetTimesScreen
        initialBedtime={bedtime}
        initialWakeUpTime={wakeUpTime}
        initialReminderEnabled={reminderEnabled}
        showReminder={reminderAvailable}
        onBack={() => setStep('how')}
        onContinue={handleTimesContinue}
      />
    );
  }

  if (step === 'permissions') {
    return (
      <View style={styles.center}>
        <PermissionSheet
          visible
          permissionType="notifications"
          onContinue={() => setStep('oem')}
          onNotNow={() => setStep('oem')}
        />
      </View>
    );
  }

  if (step === 'oem') {
    return (
      <OemGuideScreen
        onBack={() => setStep('permissions')}
        onContinue={handleFinish}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5EF',
    padding: 24,
  },
  errorText: {
    color: '#1E2430',
    fontSize: 16,
    textAlign: 'center',
  },
});
