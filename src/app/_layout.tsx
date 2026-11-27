
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '../services/data';
import { configureAlarmEngine } from '../services/alarmEngine';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getDatabase()
      .then(() => {
    configureAlarmEngine();
    if (mounted) {
          setReady(true);
        }
      })
      .catch((err: unknown) => {
        console.error('Database initialization failed:', err);

        if (mounted) {
          setError(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Unable to initialize the database.</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dev/session-monitor" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
