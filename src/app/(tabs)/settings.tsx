
import React from 'react';
import { Link } from 'expo-router';
import { Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../../text/t';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('nav.settings')}</Text>

      <Text style={styles.subtitle}>
        {t('settings.subtitle')}
      </Text>

      {__DEV__ ? (
        <Link href="/dev/session-monitor" asChild>
          <Pressable
            accessibilityRole="button"
            style={styles.devButton}
          >
            <Text style={styles.devButtonText}>
              {t('developer.sessionMonitorTestTools')}
            </Text>
          </Pressable>
        </Link>
      ) : null}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
    marginTop: 12,
  },
  devButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#245c4b',
    borderRadius: 8,
    marginTop: 24,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
