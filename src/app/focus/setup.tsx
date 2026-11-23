/**
 * src/app/focus/setup.tsx
 *
 * S-11 Focus Setup screen.
 * PRD refs: FR-FO-01, FR-FO-02, FR-FO-03, FR-FO-11b, FR-FO-13,
 * PRD 8.1, 8.3, AX-04, AX-07, and W2 design pack section S-11.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { isOn, rules } from '../../../config/rules';
import {
  clampDuration,
  getLastUsedFocusDuration,
  setLastUsedFocusDuration,
  stepCustomDuration,
} from '../../domain/focus';
import { getSettings, saveSettings } from '../../services/data';
import { t } from '../../../t';
import { appConfig } from '../../../appConfig';
import { FocusFlowerCanvas } from '../../ui/focus/FocusFlowerCanvas';
import { ColorTheme, useTheme } from '../../ui/theme/colors';

export default function FocusSetupScreen() {
  const { colors: theme } = useTheme('day');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const presets = rules.focus.presetsMinutes;
  const initialDuration = getLastUsedFocusDuration();
  const isInitialPreset = (presets as readonly number[]).includes(initialDuration);

  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    isInitialPreset ? initialDuration : null
  );
  const [isCustom, setIsCustom] = useState<boolean>(!isInitialPreset);
  const [customValue, setCustomValue] = useState<number>(
    isInitialPreset ? presets[0] : clampDuration(initialDuration)
  );

  const applyDuration = useCallback((duration: number) => {
    const isPreset = (presets as readonly number[]).includes(duration);
    if (isPreset) {
      setSelectedPreset(duration);
      setIsCustom(false);
    } else {
      setSelectedPreset(null);
      setIsCustom(true);
      setCustomValue(clampDuration(duration));
    }
  }, [presets]);

  // Restore persistent last-used duration from database on mount
  useEffect(() => {
    void getSettings()
      .then((settings) => {
        if (settings && typeof settings.default_focus_min === 'number') {
          applyDuration(settings.default_focus_min);
          setLastUsedFocusDuration(settings.default_focus_min);
        }
      })
      .catch(() => {
        // Fallback gracefully if database is unavailable
      });
  }, [applyDuration]);

  const effectiveDuration = isCustom
    ? customValue
    : (selectedPreset ?? presets[0]);

  const handleStart = () => {
    // Remember and save last-used duration (both in memory and persistent storage)
    setLastUsedFocusDuration(effectiveDuration);
    void saveSettings({ default_focus_min: effectiveDuration }).catch(() => {});

    // PRD FR-FO-03: "Start" begins immediately and opens S-12
    const seed = Math.floor(Date.now() % 100000) + 1;
    router.replace({
      pathname: '/focus/running',
      params: {
        duration: String(effectiveDuration),
        seed: String(seed),
      },
    });
  };

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  const handleBlockingEdit = () => {
    Alert.alert(
      t('focus.setupTitle'),
      t('focus.blockingHint')
    );
  };

  const showIphoneWarning = Platform.OS === 'ios' && !isOn('SW-01');
  const showBlockingCard = Platform.OS === 'android';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={8}
        >
          <Ionicons name="close" size={26} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Seed preview art */}
        <View style={styles.artContainer}>
          <FocusFlowerCanvas
            stage="seed"
            seed={42}
            durationMinutes={effectiveDuration}
            size={96}
            themeMode="day"
          />
        </View>

        <Text style={styles.heading}>{t('focus.howLong')}</Text>

        {/* Preset chips row */}
        <View style={styles.chipsContainer}>
          {presets.map((preset) => {
            const active = !isCustom && selectedPreset === preset;
            return (
              <Pressable
                key={preset}
                accessibilityRole="button"
                accessibilityLabel={t('common.minutes', { minutes: preset })}
                onPress={() => {
                  setIsCustom(false);
                  setSelectedPreset(preset);
                }}
                style={[styles.chip, active && styles.chipActive]}
              >
                {active && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={theme.onAccent}
                    style={styles.chipIcon}
                  />
                )}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t('common.minutes', { minutes: preset })}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('focus.custom')}
            onPress={() => setIsCustom(true)}
            style={[styles.chip, isCustom && styles.chipActive]}
          >
            {isCustom && (
              <Ionicons
                name="checkmark"
                size={18}
                color={theme.onAccent}
                style={styles.chipIcon}
              />
            )}
            <Text style={[styles.chipText, isCustom && styles.chipTextActive]}>
              {t('focus.custom')}
            </Text>
          </Pressable>
        </View>

        {/* Custom duration stepper (FR-FO-01, FR-FO-13: 10 to 120 min) */}
        {isCustom && (
          <View style={styles.stepperContainer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('focus.stepperLess')}
              disabled={customValue <= rules.focus.customMinMinutes}
              onPress={() =>
                setCustomValue((prev) => stepCustomDuration(prev, 'down'))
              }
              style={[
                styles.stepperButton,
                customValue <= rules.focus.customMinMinutes &&
                  styles.stepperButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.stepperButtonText,
                  customValue <= rules.focus.customMinMinutes &&
                    styles.stepperButtonTextDisabled,
                ]}
              >
                –
              </Text>
            </Pressable>

            <Text style={styles.stepperValue}>
              {t('common.minutes', { minutes: customValue })}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('focus.stepperMore')}
              disabled={customValue >= rules.focus.customMaxMinutes}
              onPress={() =>
                setCustomValue((prev) => stepCustomDuration(prev, 'up'))
              }
              style={[
                styles.stepperButton,
                customValue >= rules.focus.customMaxMinutes &&
                  styles.stepperButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.stepperButtonText,
                  customValue >= rules.focus.customMaxMinutes &&
                    styles.stepperButtonTextDisabled,
                ]}
              >
                +
              </Text>
            </Pressable>
          </View>
        )}

        {/* Android-only: Blocking count line (FR-FO-02) */}
        {showBlockingCard && (
          <View style={styles.blockingCard}>
            <Text style={styles.blockingText}>
              {t('focus.blockingCount', {
                count: rules.focus.dummyBlockedAppsCount,
              })}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('focus.blockingEdit')}
              onPress={handleBlockingEdit}
              style={styles.editButton}
            >
              <Text style={styles.editText}>{t('focus.blockingEdit')}</Text>
            </Pressable>
          </View>
        )}

        {/* iPhone-only warning when SW-01 is off (FR-FO-11b) */}
        {showIphoneWarning && (
          <View style={styles.warningBanner}>
            <Ionicons
              name="warning-outline"
              size={20}
              color={theme.warningText}
            />
            <Text style={styles.warningText}>
              {t('focus.iphoneLockWarning', { appName: appConfig.appName })}
            </Text>
          </View>
        )}

        <View style={styles.grow} />

        {/* Primary Start button (PRD 8.3: one primary per screen) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('focus.start')}
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.startButtonText}>{t('focus.start')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ColorTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    header: {
      height: 48,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    closeButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    artContainer: {
      height: 96,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    heading: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 16,
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    chip: {
      minHeight: 48,
      minWidth: 64,
      paddingHorizontal: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    chipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    chipIcon: {
      marginRight: 2,
    },
    chipText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    chipTextActive: {
      color: theme.onAccent,
    },
    stepperContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 24,
    },
    stepperButton: {
      width: 48,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonDisabled: {
      backgroundColor: theme.disabledBg,
      borderColor: theme.border,
    },
    stepperButtonText: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
    },
    stepperButtonTextDisabled: {
      color: theme.disabledText,
    },
    stepperValue: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      minWidth: 96,
      textAlign: 'center',
    },
    blockingCard: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      minHeight: 48,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    blockingText: {
      fontSize: 16,
      color: theme.text,
    },
    editButton: {
      height: 48,
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    editText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent,
    },
    warningBanner: {
      backgroundColor: theme.warningBg,
      borderRadius: 14,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      color: theme.warningText,
    },
    grow: {
      flex: 1,
      minHeight: 24,
    },
    startButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.85,
    },
    startButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.onAccent,
    },
  });
}
