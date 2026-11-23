/**
 * src/app/focus/result.tsx
 *
 * S-13 Focus Result screen.
 * PRD refs: FR-FO-06, FR-FO-09, FR-FO-14, PRD 8.3, 8.4,
 * and W2 design pack section S-13.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { rules } from '../../../config/rules';
import { t } from '../../../t';
import { FocusFlowerCanvas } from '../../ui/focus/FocusFlowerCanvas';
import { ColorTheme, useTheme } from '../../ui/theme/colors';

export default function FocusResultScreen() {
  const { colors: theme } = useTheme('day');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const params = useLocalSearchParams<{
    result?: string;
    seed?: string;
    duration?: string;
  }>();

  const isBloom = params.result !== 'bud';
  const seedNumber = Number(params.seed) || 42;
  const durationMinutes =
    Number(params.duration) || rules.focus.presetsMinutes[0];

  // Trigger light haptic once on bloom reveal (PRD 8.4)
  const hapticFiredRef = useRef(false);
  useEffect(() => {
    if (isBloom && !hapticFiredRef.current) {
      hapticFiredRef.current = true;
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Safe fallback in test or unsupported environments
      }
    }
  }, [isBloom]);

  const handleBackToGarden = () => {
    router.replace('/(tabs)');
  };

  const handleStartAnother = () => {
    router.replace('/focus/setup');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        {/* Soft badge containing Skia flower or bud */}
        <View style={styles.badgeContainer}>
          <FocusFlowerCanvas
            stage={isBloom ? 'bloom' : 'bud'}
            progress={isBloom ? 1.0 : 0.75}
            seed={seedNumber}
            durationMinutes={durationMinutes}
            size={160}
            showRing={false}
            themeMode="day"
          />
        </View>

        {/* Heading copy */}
        <Text
          accessibilityRole="header"
          style={styles.heading}
        >
          {isBloom ? t('focus.resultBloom') : t('focus.resultBud')}
        </Text>

        <View style={styles.grow} />

        {/* Primary button: Back to garden */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('focus.resultGarden')}
          onPress={handleBackToGarden}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {t('focus.resultGarden')}
          </Text>
        </Pressable>

        {/* Bud outcome only: Start another text button */}
        {!isBloom && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('focus.resultAgain')}
            onPress={handleStartAnother}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {t('focus.resultAgain')}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: ColorTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topSpacer: {
      height: 48,
    },
    badgeContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: theme.accentMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    heading: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      maxWidth: 320,
    },
    grow: {
      flex: 1,
      minHeight: 40,
    },
    primaryButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.onAccent,
    },
    secondaryButton: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent,
    },
  });
}
