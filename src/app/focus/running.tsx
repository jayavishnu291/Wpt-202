/**
 * src/app/focus/running.tsx
 *
 * S-12 Focus in Progress screen.
 * PRD refs: FR-FO-04, FR-FO-05, FR-FO-06, FR-FO-10, FR-FO-12, FR-FO-14, AC-FO-5,
 * PRD 8.3, 8.4, and W2 design pack section S-12.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { rules } from '../../../config/rules';
import {
  DEV_SPEED_MULTIPLIER,
  formatTimeRemaining,
  getFocusStage,
  SECONDS_PER_MINUTE,
} from '../../domain/focus';
import { t } from '../../../t';
import { FocusFlowerCanvas } from '../../ui/focus/FocusFlowerCanvas';
import { ColorTheme, useTheme } from '../../ui/theme/colors';

export default function FocusRunningScreen() {
  const { colors: theme } = useTheme('day');
  const styles = useMemo(() => createStyles(theme), [theme]);

  const params = useLocalSearchParams<{
    duration?: string;
    seed?: string;
  }>();

  const durationMinutes =
    Number(params.duration) || rules.focus.presetsMinutes[0];
  const seedNumber = Number(params.seed) || 42;
  const totalSeconds = durationMinutes * SECONDS_PER_MINUTE;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(totalSeconds);
  const [passUsed, setPassUsed] = useState<boolean>(false);
  const [showGiveUpDialog, setShowGiveUpDialog] = useState<boolean>(false);
  const [isFastForward, setIsFastForward] = useState<boolean>(false);

  const isFastForwardRef = useRef<boolean>(false);

  useEffect(() => {
    isFastForwardRef.current = isFastForward;
  }, [isFastForward]);

  // Block Android hardware back button (FR-FO-12)
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true
    );
    return () => subscription.remove();
  }, []);

  // Timer loop with active 60x developer speed-up (FR-FO-14)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let lastTime = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const deltaRealSec = (now - lastTime) / 1000;
      lastTime = now;

      const speedMultiplier = isFastForwardRef.current
        ? DEV_SPEED_MULTIPLIER
        : 1;
      const elapsedFocusSec = deltaRealSec * speedMultiplier;

      setRemainingSeconds((prev) => {
        const next = prev - elapsedFocusSec;
        if (next <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle completion when remainingSeconds hits 0
  const hasFinishedRef = useRef(false);
  useEffect(() => {
    if (remainingSeconds <= 0 && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);

      router.replace({
        pathname: '/focus/result',
        params: {
          result: 'bloom',
          seed: String(seedNumber),
          duration: String(durationMinutes),
        },
      });
    }
  }, [remainingSeconds, seedNumber, durationMinutes]);

  const progress =
    totalSeconds > 0
      ? Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds))
      : 1;

  const stage = getFocusStage(progress);

  // Dev speed-up toggle (FR-FO-14: accelerates countdown timer 60x faster)
  const handleToggleFastForward = () => {
    setIsFastForward((prev) => !prev);
  };

  const handleTakePass = () => {
    // Correction 1: Placeholder with one-time disabled state (AC-FO-5)
    setPassUsed(true);
  };

  const handleGiveUpConfirm = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowGiveUpDialog(false);

    // FR-FO-10: Confirm -> S-13 (bud)
    router.replace({
      pathname: '/focus/result',
      params: {
        result: 'bud',
        seed: String(seedNumber),
        duration: String(durationMinutes),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* text-ok: dev condition */}
      {typeof __DEV__ !== 'undefined' && __DEV__ && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('focus.devSpeedUp')}
          onPress={handleToggleFastForward}
          style={[
            styles.devChip,
            isFastForward && styles.devChipActive,
          ]}
        >
          <Text
            style={[
              styles.devChipText,
              isFastForward && styles.devChipTextActive,
            ]}
          >
            {isFastForward ? t('focus.devSpeedUpActive') : t('focus.devSpeedUp')}
          </Text>
        </Pressable>
      )}

      <View style={styles.content}>
        <View style={styles.topSpacer} />

        {/* Circular progress ring and growing flower art */}
        <View style={styles.canvasContainer}>
          <FocusFlowerCanvas
            stage={stage}
            progress={progress}
            seed={seedNumber}
            durationMinutes={durationMinutes}
            size={240}
            showRing={true}
            themeMode="day"
          />
        </View>

        {/* Timer display */}
        <Text
          accessibilityRole="text"
          accessibilityLabel={t('focus.timeLeft', {
            time: formatTimeRemaining(remainingSeconds),
          })}
          style={styles.timerText}
        >
          {formatTimeRemaining(remainingSeconds)}
        </Text>

        <Text style={styles.subtitleText}>{t('focus.growing')}</Text>

        <View style={styles.grow} />

        {/* Take a pass button (one-time placeholder) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('focus.takePass')}
          disabled={passUsed}
          onPress={handleTakePass}
          style={[
            styles.passButton,
            passUsed && styles.passButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.passButtonText,
              passUsed && styles.passButtonTextDisabled,
            ]}
          >
            {t('focus.takePass')}
          </Text>
        </Pressable>

        {passUsed && (
          <Text style={styles.passUsedText}>{t('focus.passUsed')}</Text>
        )}

        {/* Give up button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('focus.giveUp')}
          onPress={() => setShowGiveUpDialog(true)}
          style={styles.giveUpButton}
        >
          <Text style={styles.giveUpButtonText}>{t('focus.giveUp')}</Text>
        </Pressable>
      </View>

      {/* Give up confirmation modal */}
      <Modal
        visible={showGiveUpDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGiveUpDialog(false)}
      >
        <View style={styles.scrim}>
          <View
            style={styles.dialog}
            accessibilityRole="alert"
            aria-modal={true}
          >
            <Text style={styles.dialogMessage}>
              {t('focus.giveUpConfirm')}
            </Text>

            <View style={styles.dialogActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('focus.giveUpNo')}
                onPress={() => setShowGiveUpDialog(false)}
                style={styles.dialogButton}
              >
                <Text style={styles.dialogActionKeep}>
                  {t('focus.giveUpNo')}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('focus.endNow')}
                onPress={handleGiveUpConfirm}
                style={styles.dialogButton}
              >
                <Text style={styles.dialogActionEnd}>
                  {t('focus.endNow')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(theme: ColorTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bg,
    },
    devChip: {
      position: 'absolute',
      top: 48,
      right: 16,
      zIndex: 10,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.textSecondary,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'transparent',
    },
    devChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    devChipText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    devChipTextActive: {
      color: theme.onAccent,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 24,
      alignItems: 'center',
    },
    topSpacer: {
      height: 48,
    },
    canvasContainer: {
      width: 240,
      height: 240,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    timerText: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '700',
      color: theme.text,
      fontVariant: ['tabular-nums'],
      marginBottom: 4,
    },
    subtitleText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      color: theme.textSecondary,
    },
    grow: {
      flex: 1,
      minHeight: 32,
    },
    passButton: {
      width: '100%',
      height: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.accent,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    passButtonDisabled: {
      backgroundColor: theme.disabledBg,
      borderColor: theme.border,
    },
    passButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.accent,
    },
    passButtonTextDisabled: {
      color: theme.disabledText,
    },
    passUsedText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.textSecondary,
      marginTop: 6,
    },
    giveUpButton: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    giveUpButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.accent,
    },
    scrim: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    dialog: {
      width: '100%',
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
    },
    dialogMessage: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
    },
    dialogActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
    dialogButton: {
      minHeight: 48,
      paddingHorizontal: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogActionKeep: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.accent,
    },
    dialogActionEnd: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.accent,
    },
  });
}
