
import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  BackHandler,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Link } from 'expo-router';
import { t } from '../../text/t';

export default function FocusRunningScreen() {
  const { duration } = useLocalSearchParams<{ duration?: string }>();

  const minutes = Number(duration) || 25;
  const [remainingSeconds, setRemainingSeconds] = useState(minutes * 60);
  const timerText = `${Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(remainingSeconds % 60)
    .toString()
    .padStart(2, '0')}`;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );

    const interval = setInterval(() => {
      setRemainingSeconds((current) =>
        current > 0 ? current - 1 : 0,
      );
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [minutes]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('focus.runScreenTitle')}</Text>

      <View style={styles.timerCircle}>
        <Text
          style={styles.timer}
          accessibilityRole="timer"
          accessibilityLabel={t('focus.timeLeft', { time: timerText })}
        >
          {timerText}
        </Text>
        <Text style={styles.label}>{t('focus.minutes')}</Text>
      </View>

      <Text style={styles.message}>
        {t('focus.runMessage')}
      </Text>

      <Link href="/focus/result" asChild>
        <View style={styles.button}>
          <Text style={styles.buttonText}>{t('focus.complete')}</Text>
        </View>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 45,
  },
  timerCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 8,
    borderColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  label: {
    fontSize: 16,
    color: '#777777',
  },
  message: {
    fontSize: 16,
    color: '#666666',
    marginTop: 35,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
