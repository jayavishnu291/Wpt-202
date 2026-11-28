
import React, { useState } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { t } from '../../text/t';

export default function FocusSetupScreen() {
  const [duration, setDuration] = useState(25);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('focus.setupScreenTitle')}</Text>

      <Text style={styles.subtitle}>
        {t('focus.setupSubtitle')}
      </Text>

      <View style={styles.durationBox}>
        <Pressable
          style={styles.adjustButton}
          onPress={() => setDuration(Math.max(5, duration - 5))}
          accessibilityRole="button"
          accessibilityLabel={t('focus.decreaseDuration')}
        >
          <Text style={styles.adjustText}>−</Text>
        </Pressable>

        <Text style={styles.duration}>{duration}</Text>

        <Pressable
          style={styles.adjustButton}
          onPress={() => setDuration(Math.min(120, duration + 5))}
          accessibilityRole="button"
          accessibilityLabel={t('focus.increaseDuration')}
        >
          <Text style={styles.adjustText}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.minutes}>{t('focus.minutes')}</Text>

      <Link
        href={{
          pathname: '/focus/running',
          params: { duration: String(duration) },
        }}
        asChild
      >
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>{t('focus.start')}</Text>
        </Pressable>
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
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    marginTop: 12,
    marginBottom: 35,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 35,
  },
  adjustButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 30,
    color: '#6C63FF',
  },
  duration: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  minutes: {
    fontSize: 16,
    color: '#777777',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 55,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
