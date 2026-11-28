
import React, { useMemo } from 'react';
import { Link } from 'expo-router';
import { Pressable, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { t } from '../../text/t';
import { useTheme } from '../../ui/theme';

export default function SettingsScreen() {
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{t('nav.settings')}</Text>

      <Text style={styles.subtitle}>
        {t('settings.subtitle')}
      </Text>
      {__DEV__ || process.env.EXPO_PUBLIC_BLOCKING_TEST === '1' ? (
        <Link href="/dev" asChild>
          <Pressable accessibilityRole="button" style={styles.devButton}>
            <Text style={styles.devButtonText}>{t('developer.sessionMonitorTestTools')}</Text>
          </Pressable>
        </Link>
      ) : null}
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
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedText,
      marginTop: spacing.md,
    },
    devButton: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: radius.sm,
      marginTop: spacing.xl,
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    devButtonText: {
      color: colors.onAccent,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
