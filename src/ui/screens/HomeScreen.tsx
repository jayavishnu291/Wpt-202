
/**
 * src/ui/screens/HomeScreen.tsx
 *
 * WPT 202 - S-10 Home screen (garden and sky)
 * PRD refs: FR-HM-01 to FR-HM-06, FR-ON-08, PRD 8.1; Tech Architecture 12.4.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { EN } from '../../constants/en';
import { createGardenLayout } from '../../domain/gardenLayout';
import {
  formatDuration,
  getHomePrimaryAction,
  shouldUseNightTheme,
} from '../../domain/time';
import { getHomeDataSync } from '../../services/homeService';
import type { HomeData } from '../../services/homeService';
import { GardenScene } from '../garden/GardenScene';
import { getTheme } from '../theme';
import type { ThemeColors } from '../theme';

export interface HomeScreenProps {
  /** Optional custom initial data (defaults to dummy service data). */
  initialData?: HomeData;
  /** Optional callback when Start Focus is pressed. */
  onStartFocus?: () => void;
  /** Optional callback when Start Night is pressed. */
  onStartNight?: () => void;
  /** Optional callback when Last Night card is pressed. */
  onOpenReport?: () => void;
  /** Optional callback when App Blocking setup is pressed. */
  onOpenAppBlocking?: () => void;
  /** Optional callback to open the development-only FC-6 garden test. */
  onOpenGardenTest?: () => void;
}

type ActivePlaceholder = 'morning_report' | 'focus_setup' | 'night_session' | 'app_blocking' | null;

export function HomeScreen({
  initialData,
  onStartFocus,
  onStartNight,
  onOpenReport,
  onOpenAppBlocking,
  onOpenGardenTest,
}: HomeScreenProps) {
  const { width, height } = useWindowDimensions();

  // Current dummy data from service
  const [homeData, setHomeData] = useState<HomeData>(() => initialData ?? getHomeDataSync());

  // Current device time (refreshed periodically and on AppState resume)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Active placeholder modal for non-implemented flows
  const [placeholder, setPlaceholder] = useState<ActivePlaceholder>(null);

  // Refresh clock and theme when returning to app
  useEffect(() => {
    const updateNow = () => {
      setCurrentTime(new Date());
    };

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        updateNow();
        setHomeData(initialData ?? getHomeDataSync());
      }
    });

    const intervalId = setInterval(updateNow, 5000);

    return () => {
      sub.remove();
      clearInterval(intervalId);
    };
  }, [initialData]);

  // Evaluate Night theme vs Day theme
  const isNight = useMemo(() => {
    return shouldUseNightTheme(
      currentTime,
      homeData.settings.bedtime.hours,
      homeData.settings.bedtime.minutes,
    );
  }, [currentTime, homeData.settings.bedtime]);

  const theme: ThemeColors = useMemo(() => getTheme(isNight), [isNight]);

  // Decide primary vs secondary action
  const primaryAction = useMemo(() => {
    return getHomePrimaryAction(
      currentTime,
      homeData.settings.bedtime.hours,
      homeData.settings.bedtime.minutes,
    );
  }, [currentTime, homeData.settings.bedtime]);

  // Top 60% scene height
  const sceneHeight = Math.max(200, Math.round(height * 0.6));

  // Garden and sky layout
  const gardenLayout = useMemo(() => {
    if (width <= 0 || sceneHeight <= 0) return null;
    return createGardenLayout(width, sceneHeight, {
      flowerCount: homeData.sceneFlowerCount,
      starCount: homeData.sceneStarCount,
    });
  }, [width, sceneHeight, homeData.sceneFlowerCount, homeData.sceneStarCount]);

  // Button actions with fallback placeholders
  const handleFocusPress = useCallback(() => {
    if (onStartFocus) {
      onStartFocus();
    } else {
      setPlaceholder('focus_setup');
    }
  }, [onStartFocus]);

  const handleNightPress = useCallback(() => {
    if (onStartNight) {
      onStartNight();
    } else {
      setPlaceholder('night_session');
    }
  }, [onStartNight]);

  const handleLastNightPress = useCallback(() => {
    if (onOpenReport) {
      onOpenReport();
    } else {
      setPlaceholder('morning_report');
    }
  }, [onOpenReport]);

  const handleAppBlockingPress = useCallback(() => {
    if (onOpenAppBlocking) {
      onOpenAppBlocking();
    } else {
      setPlaceholder('app_blocking');
    }
  }, [onOpenAppBlocking]);

  const closePlaceholder = useCallback(() => {
    setPlaceholder(null);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar style={isNight ? 'light' : 'dark'} />

      {/* Top 60%: Garden and Sky Scene */}
      <View style={[styles.sceneContainer, { height: sceneHeight }]}>
        {gardenLayout !== null && <GardenScene layout={gardenLayout} />}
      </View>

      {/* Bottom Content Area */}
      <ScrollView
        style={[styles.contentScrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {EN.home.minutesCount(homeData.todayFocusMinutes)}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSoft }]}>
              {EN.home.todayFocus}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {homeData.nextAlarmTime ?? EN.home.noAlarmSet}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSoft }]}>
              {EN.home.nextAlarm}
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.metricValue, { color: theme.text }]}>
              {EN.home.nightsCount(homeData.currentNightStreak)}
            </Text>
            <Text style={[styles.metricLabel, { color: theme.textSoft }]}>
              {EN.home.nightStreak}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {primaryAction === 'start_night' ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EN.home.startNight}
                accessibilityHint={EN.home.startNightHint}
                onPress={handleNightPress}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.primaryButtonBg },
                  pressed && { backgroundColor: theme.accentPressed },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                  {EN.home.startNight}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EN.home.startFocus}
                accessibilityHint={EN.home.startFocusHint}
                onPress={handleFocusPress}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.secondaryButtonBg,
                    borderColor: theme.secondaryButtonBorder,
                  },
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.secondaryButtonText }]}>
                  {EN.home.startFocus}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EN.home.startFocus}
                accessibilityHint={EN.home.startFocusHint}
                onPress={handleFocusPress}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.primaryButtonBg },
                  pressed && { backgroundColor: theme.accentPressed },
                ]}
              >
                <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>
                  {EN.home.startFocus}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EN.home.startNight}
                accessibilityHint={EN.home.startNightHint}
                onPress={handleNightPress}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  {
                    backgroundColor: theme.secondaryButtonBg,
                    borderColor: theme.secondaryButtonBorder,
                  },
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.secondaryButtonText }]}>
                  {EN.home.startNight}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Last Night Card or No-Night Message */}
        {homeData.hasRecordedNight && homeData.lastNightSummary !== null ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={EN.home.lastNightTitle}
            accessibilityHint={EN.home.lastNightTapHint}
            onPress={handleLastNightPress}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {EN.home.lastNightTitle}
              </Text>
              <View style={styles.starBadge}>
                <Text style={[styles.starIcon, { color: theme.starGold }]}>★</Text>
                <Text style={[styles.starBadgeText, { color: theme.textSoft }]}>
                  {homeData.lastNightSummary.starType === 'faint'
                    ? EN.home.faintStarEarned
                    : EN.home.starEarned}
                </Text>
              </View>
            </View>

            <Text style={[styles.cardSubtitle, { color: theme.textSoft }]}>
              {formatDuration(homeData.lastNightSummary.durationMinutes)} {EN.common.estimate} ·{' '}
              {EN.keyCopy.scoreEstimateLabel}: {homeData.lastNightSummary.score}
            </Text>
          </Pressable>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.cardMessage, { color: theme.textSoft }]}>
              {EN.home.noNightMessage}
            </Text>
          </View>
        )}

        {/* App Blocking Card */}
        {Platform.OS === 'android' && !homeData.hasAppBlockingSetup && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderTextContainer}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {EN.home.appBlockingTitle}
                </Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSoft }]}>
                  {EN.home.appBlockingDesc}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={EN.home.setUpButton}
                accessibilityHint={EN.home.setUpButtonHint}
                onPress={handleAppBlockingPress}
                style={({ pressed }) => [
                  styles.smallSetupButton,
                  { backgroundColor: theme.accent },
                  pressed && { backgroundColor: theme.accentPressed },
                ]}
              >
                <Text style={styles.smallSetupButtonText}>{EN.home.setUpButton}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Development-only FC-6 test shortcut */}
        {__DEV__ && onOpenGardenTest && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open FC-6 Garden Test"
            onPress={onOpenGardenTest}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: theme.secondaryButtonBg,
                borderColor: theme.secondaryButtonBorder,
              },
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.secondaryButtonText }]}>
              FC-6 Garden Test
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Flow Placeholders Modal */}
      <Modal
        visible={placeholder !== null}
        transparent
        animationType="fade"
        onRequestClose={closePlaceholder}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {placeholder === 'morning_report' && EN.placeholders.morningReportTitle}
              {placeholder === 'focus_setup' && EN.placeholders.focusSetupTitle}
              {placeholder === 'night_session' && EN.placeholders.nightModeTitle}
              {placeholder === 'app_blocking' && EN.placeholders.appBlockingTitle}
            </Text>

            <Text style={[styles.modalSubtitle, { color: theme.textSoft }]}>
              {placeholder === 'morning_report' && EN.placeholders.morningReportSubtitle}
              {placeholder === 'focus_setup' && EN.placeholders.focusSetupSubtitle}
              {placeholder === 'night_session' && EN.placeholders.nightModeSubtitle}
              {placeholder === 'app_blocking' && EN.placeholders.appBlockingSubtitle}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={EN.common.close}
              onPress={closePlaceholder}
              style={[styles.modalCloseButton, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.modalCloseButtonText}>{EN.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sceneContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  contentScrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
  },
  starBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallSetupButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSetupButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalCloseButton: {
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
