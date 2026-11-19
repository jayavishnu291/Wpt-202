
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
// TEST BRANCH ONLY - never merge into main.
// eslint-disable-next-line no-restricted-imports
import { DevToolsGate } from '../dev/DevToolsGate';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    getDatabase()
      .then(() => {
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
    <DevToolsGate>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DevToolsGate>
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
