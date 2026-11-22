
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { rules } from '../../../config/rules';
import { t } from '../../text/t';
import {
  deleteAlarm,
  listAlarms,
  saveAlarm,
  type Alarm,
} from '../../services/data';
import { useTheme } from '../theme';

interface Props {
  onAdd: () => void;
  onEdit: (alarm: Alarm) => void;
}

const DAYS = [
  { key: 'mon', value: 1 },
  { key: 'tue', value: 2 },
  { key: 'wed', value: 3 },
  { key: 'thu', value: 4 },
  { key: 'fri', value: 5 },
  { key: 'sat', value: 6 },
  { key: 'sun', value: 0 },
] as const;

declare const __DEV__: boolean;

export default function AlarmListScreen({ onAdd, onEdit }: Props) {
  const { colors, spacing, radius, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, layout),
    [colors, spacing, radius, layout],
  );
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAlarmId, setBusyAlarmId] = useState<string | null>(null);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [showVolumeBanner, setShowVolumeBanner] = useState(false);

  const mounted = useRef(false);

  // Load alarms when the screen opens
  useEffect(() => {
    let active = true;
    mounted.current = true;

    const loadInitialAlarms = async () => {
      try {
        const result = await listAlarms();

        if (active) {
          setAlarms(result);
        }
      } catch (error) {
        console.error('Unable to load alarms:', error);

        if (active) {
          Alert.alert(
            t('common.error'),
            t('alarmList.loadFailed'),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialAlarms();

    return () => {
      active = false;
      mounted.current = false;
    };
  }, []);

  // Enable or disable an alarm
  const toggleAlarm = async (alarm: Alarm, enabled: boolean) => {
    if (busyAlarmId !== null) return;

    setBusyAlarmId(alarm.id);

    try {
      const updatedAlarm = {
        ...alarm,
        enabled,
      };

      await saveAlarm(updatedAlarm);

      if (mounted.current) {
        setAlarms((current) =>
          current.map((item) =>
            item.id === alarm.id ? updatedAlarm : item,
          ),
        );
      }
    } catch (error) {
      console.error('Unable to update alarm:', error);

      Alert.alert(
        t('common.error'),
        t('alarmList.updateFailed'),
      );
    } finally {
      if (mounted.current) {
        setBusyAlarmId(null);
      }
    }
  };

  // Delete the selected alarm
  const removeAlarm = async (alarm: Alarm) => {
    if (busyAlarmId !== null) return;

    setBusyAlarmId(alarm.id);

    try {
      await deleteAlarm(alarm.id);

      if (mounted.current) {
        setAlarms((current) =>
          current.filter((item) => item.id !== alarm.id),
        );

        try {
          const refreshedAlarms = await listAlarms();

          if (mounted.current) {
            setAlarms(refreshedAlarms);
          }
        } catch (error) {
          console.error('Unable to refresh alarms after deletion:', error);

          if (mounted.current) {
            Alert.alert(
              t('common.error'),
              t('alarmList.loadFailed'),
            );
          }
        }
      }
    } catch (error) {
      console.error('DELETE ERROR DETAILS:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
      }

      Alert.alert(
        t('common.error'),
        t('alarmList.deleteFailed'),
      );
    } finally {
      if (mounted.current) {
        setBusyAlarmId(null);
      }
    }
  };

  // Confirm before deleting
  const confirmDelete = (alarm: Alarm) => {
    if (busyAlarmId !== null) return;

    const message = t('alarmList.deleteMessage', {
      time: alarm.time,
    });

    // Browser confirmation
    if (Platform.OS === 'web') {
      const browserGlobal = globalThis as unknown as {
        confirm?: (message?: string) => boolean;
      };
      const confirmed = browserGlobal.confirm?.(message) ?? false;

      if (confirmed) {
        void removeAlarm(alarm);
      }

      return;
    }

    // Android and iOS confirmation
    Alert.alert(
      t('alarmList.deleteTitle'),
      message,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('alarmEdit.delete'),
          style: 'destructive',
          onPress: () => void removeAlarm(alarm),
        },
      ],
    );
  };

  // Format repeat days
  const formatRepeat = (days: number[]) => {
    if (days.length === 0) {
      return t('alarmList.repeatOnce');
    }

    if (days.length === DAYS.length) {
      return t('alarmList.repeatEveryDay');
    }

    return DAYS
      .filter((day) => days.includes(day.value))
      .map((day) => t(`common.day.${day.key}`))
      .join(', ');
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>
          {t('alarmList.loading')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          {t('alarmList.title')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {__DEV__ && (
          <View style={styles.devToggles}>
            <TouchableOpacity
              onPress={() =>
                setShowPermissionBanner((current) => !current)
              }
              style={styles.devButton}
            >
              <Text style={styles.devText}>
                {t(
                  showPermissionBanner
                    ? 'alarmList.hidePermissionBanner'
                    : 'alarmList.showPermissionBanner',
                )}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setShowVolumeBanner((current) => !current)
              }
              style={styles.devButton}
            >
              <Text style={styles.devText}>
                {t(
                  showVolumeBanner
                    ? 'alarmList.hideVolumeBanner'
                    : 'alarmList.showVolumeBanner',
                )}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showPermissionBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {t('alarmList.bannerOff')}
            </Text>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  t('alarmList.permissionFixTitle'),
                  t('alarmList.permissionFixMessage'),
                )
              }
              accessibilityRole="button"
              accessibilityLabel={t('common.fix')}
              style={styles.fixButton}
            >
              <Text style={styles.fixText}>
                {t('common.fix')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {showVolumeBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              {t('alarmList.lowVolume')}
            </Text>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  t('alarmList.volumeFixTitle'),
                  t('alarmList.volumeFixMessage'),
                )
              }
              accessibilityRole="button"
              accessibilityLabel={t('common.fix')}
              style={styles.fixButton}
            >
              <Text style={styles.fixText}>
                {t('common.fix')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {alarms.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>◷</Text>
            <Text style={styles.emptyTitle}>
              {t('alarmList.empty')}
            </Text>
          </View>
        ) : (
          alarms.map((alarm) => (
            <View key={alarm.id} style={styles.alarmCard}>
              <TouchableOpacity
                style={styles.alarmDetails}
                onPress={() => onEdit(alarm)}
                accessibilityRole="button"
                accessibilityLabel={t('alarmList.editAlarm')}
                activeOpacity={0.8}
                disabled={busyAlarmId !== null}
              >
                <Text style={styles.time}>
                  {alarm.time}
                </Text>

                <Text style={styles.label}>
                  {alarm.label || t('alarmList.alarmLabel')}
                </Text>

                <Text style={styles.repeat}>
                  {formatRepeat(alarm.repeat_days)}
                </Text>

                {alarm.mission_type && (
                  <Text style={styles.mission}>
                    {t('alarmList.missionSummary', {
                      mission:
                        alarm.mission_type === 'shake'
                          ? t('alarmEdit.missionShake')
                          : t('alarmEdit.missionMaths'),
                    })}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.actions}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {t(
                      alarm.enabled
                        ? 'alarmList.on'
                        : 'alarmList.off',
                    )}
                  </Text>

                  <Switch
                    value={alarm.enabled}
                    disabled={busyAlarmId !== null}
                    onValueChange={(value) =>
                      void toggleAlarm(alarm, value)
                    }
                    accessibilityLabel={t('alarmList.toggleAlarm')}
                    trackColor={{
                      false: colors.controlOff,
                      true: colors.accent,
                    }}
                    thumbColor={
                      alarm.enabled ? colors.onAccent : colors.surface
                    }
                  />
                </View>

                <TouchableOpacity
                  onPress={() => confirmDelete(alarm)}
                  disabled={busyAlarmId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={t('alarmEdit.delete')}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>
                    {busyAlarmId === alarm.id
                      ? '...'
                      : t('alarmEdit.delete')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {alarms.length < rules.alarms.maximumAlarms && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAdd}
            accessibilityRole="button"
            disabled={busyAlarmId !== null}
          >
            <Text style={styles.addButtonText}>
              + {t('alarmList.add')}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.limitText}>
          {t('alarmList.alarmCount', {
            count: alarms.length,
            maximum: rules.alarms.maximumAlarms,
          })}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>['colors'],
  spacing: ReturnType<typeof useTheme>['spacing'],
  radius: ReturnType<typeof useTheme>['radius'],
  layout: ReturnType<typeof useTheme>['layout'],
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.md,
    },
    header: {
      paddingHorizontal: spacing.xl,
      paddingTop: 16,
      paddingBottom: 16,
    },
    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
    },
    content: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: 35,
      gap: spacing.md,
    },
    devToggles: {
      gap: spacing.sm,
    },
    devButton: {
      borderRadius: radius.sm,
      padding: 10,
      backgroundColor: colors.disabledBackground,
    },
    devText: {
      color: colors.text,
      textAlign: 'center',
    },
    banner: {
      backgroundColor: colors.warningBackground,
      borderRadius: radius.card,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bannerText: {
      color: colors.warningText,
      flex: 1,
    },
    fixButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    fixText: {
      color: colors.warningText,
      fontWeight: 'bold',
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: 28,
      alignItems: 'center',
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      color: colors.accent,
      fontSize: 48,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: spacing.md,
      textAlign: 'center',
    },
    muted: {
      color: colors.mutedText,
      fontSize: 14,
      textAlign: 'center',
    },
    alarmCard: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    alarmDetails: {
      marginBottom: spacing.md,
    },
    time: {
      color: colors.accent,
      fontSize: 36,
      fontWeight: 'bold',
    },
    label: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
      marginTop: 4,
    },
    repeat: {
      color: colors.textSecondary,
      marginTop: 5,
    },
    mission: {
      color: colors.textSecondary,
      marginTop: 7,
      fontSize: 13,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    switchLabel: {
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: 9,
    },
    deleteText: {
      color: colors.danger,
      fontWeight: '600',
    },
    addButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      padding: spacing.lg,
      alignItems: 'center',
      marginTop: 4,
    },
    addButtonText: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: 'bold',
    },
    limitText: {
      color: colors.mutedText,
      textAlign: 'center',
      marginTop: 2,
    },
  });
}
