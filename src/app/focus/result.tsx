
import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { t } from '../../text/t';

export default function FocusResultScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🌸</Text>

      <Text style={styles.title}>{t('focus.resultScreenTitle')}</Text>

      <Text style={styles.subtitle}>
        {t('focus.resultSubtitle')}
      </Text>

      <Text style={styles.reward}>{t('focus.rewardStar')}</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>{t('focus.resultHome')}</Text>
      </Pressable>
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
  emoji: {
    fontSize: 75,
    marginBottom: 25,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 30,
  },
  reward: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5A800',
    marginBottom: 35,
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
