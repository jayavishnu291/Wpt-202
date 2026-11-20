
import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { t } from '../../text/t';

export default function HowItWorksScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {t('onboarding.howTitle')}
      </Text>

      <View style={styles.point}>
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.text}>
          {t('onboarding.howPoint1')}
        </Text>
      </View>

      <View style={styles.point}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.text}>
          {t('onboarding.howPoint2')}
        </Text>
      </View>

      <View style={styles.point}>
        <Text style={styles.emoji}>🌅</Text>
        <Text style={styles.text}>
          {t('onboarding.howPoint3')}
        </Text>
      </View>

      <Link href="/onboarding/set-times" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>
            {t('onboarding.howNext')}
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
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 35,
    textAlign: 'center',
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 16,
  },
  emoji: {
    fontSize: 35,
  },
  text: {
    flex: 1,
    fontSize: 17,
    color: '#555555',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
