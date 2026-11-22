
import React, { useMemo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { t } from '../../text/t';
import { useTheme } from '../../ui/theme';

export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius],
  );

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

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  radius: ReturnType<typeof useTheme>['radius'],
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.xl,
      justifyContent: 'center',
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedText,
      marginBottom: 30,
    },
    button: {
      backgroundColor: colors.accent,
      padding: spacing.lg,
      borderRadius: radius.button,
      marginBottom: 14,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
