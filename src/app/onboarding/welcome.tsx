
import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { t } from '../../text/t';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🌸</Text>

      <Text style={styles.title}>
        {t('onboarding.welcomeTitle')}
      </Text>

      <Text style={styles.subtitle}>
        {t('onboarding.welcomeSubtitle')}
      </Text>

      <Link href="/onboarding/how-it-works" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            {t('onboarding.getStarted')}
          </Text>
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
    padding: 28,
  },
  emoji: {
    fontSize: 65,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 35,
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
