
import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { t } from '../../text/t';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('nav.home')}</Text>

      <Text style={styles.subtitle}>
        {t('home.subtitle')}
      </Text>

      <Link href="/onboarding" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>{t('onboarding.getStarted')}</Text>
        </Pressable>
      </Link>

      <Link href="/focus/setup" asChild>
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
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
