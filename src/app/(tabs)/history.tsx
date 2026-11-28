
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { t } from '../../text/t';
import { listHistory, type HistoryEntry } from '../../services/data';
import { useTheme } from '../../ui/theme';

export default function HistoryScreen() {
  const { colors, spacing, radius, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, layout),
    [colors, spacing, radius, layout],
  );
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);

      listHistory()
        .then((result) => {
          if (active) setEntries(result);
        })
        .catch((error: unknown) => {
          console.error('Unable to load history:', error);
          if (active) {
            Alert.alert(t('common.error'), t('history.loadFailed'));
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loading} edges={['top']}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.muted}>{t('history.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('history.title')}</Text>
      </View>
      <FlatList
        data={entries}
        keyExtractor={(entry) => `${entry.type}-${entry.id}`}
        contentContainerStyle={[
          styles.content,
          entries.length === 0 && styles.emptyContent,
        ]}
        ListEmptyComponent={(
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>◷</Text>
            <Text style={styles.emptyText}>{t('history.empty')}</Text>
          </View>
        )}
        renderItem={({ item }) => <HistoryCard entry={item} />}
      />
    </SafeAreaView>
  );
}

function HistoryCard({ entry }: { entry: HistoryEntry }) {
  const { colors, spacing, radius, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, layout),
    [colors, spacing, radius, layout],
  );
  const start = new Date(entry.startAt);
  const date = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  const typeLabel = entry.type === 'focus'
    ? t('history.focus')
    : t(entry.type === 'night' ? 'history.night' : 'history.nap');
  const resultLabel = entry.result
    ? t(entry.result === 'bloom' ? 'history.bloom' : 'history.bud')
    : null;
  const plannedDuration = entry.plannedMinutes !== null
    ? t('history.plannedDuration', { minutes: entry.plannedMinutes })
    : null;
  const sleepDuration = entry.sleepMinutes !== null
    ? t('history.estimatedSleep', {
      duration: t('common.minutes', { minutes: entry.sleepMinutes }),
    })
    : null;
  const pickups = entry.pickups !== null
    ? t('history.pickups', { count: entry.pickups })
    : null;
  const starLabel = entry.star
    ? t(entry.star === 'star'
      ? 'history.star'
      : entry.star === 'faint'
        ? 'history.faintStar'
        : 'history.noStar')
    : null;
  const isFocus = entry.type === 'focus';
  const icon = isFocus ? '🌱' : entry.type === 'night' ? '🌙' : '☀️';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headingGroup}>
          <Text style={styles.icon}>
            {icon}
          </Text>
          <View>
            <Text style={styles.cardTitle}>{entry.label || typeLabel}</Text>
            <Text style={styles.date}>{`${date} · ${time}`}</Text>
          </View>
        </View>
        {resultLabel && (
          <Text
            style={[
              styles.badge,
              entry.result === 'bloom' ? styles.bloomBadge : styles.budBadge,
            ]}
          >
            {resultLabel}
          </Text>
        )}
      </View>

      {isFocus && plannedDuration && (
        <Text style={styles.detail}>{plannedDuration}</Text>
      )}
      {!isFocus && (
        <View style={styles.details}>
          {sleepDuration && <Text style={styles.detail}>{sleepDuration}</Text>}
          {pickups && <Text style={styles.detail}>{pickups}</Text>}
          {starLabel && <Text style={styles.detail}>{starLabel}</Text>}
        </View>
      )}
    </View>
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
    content: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: 35,
      gap: spacing.md,
    },
    emptyContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      color: colors.accent,
      fontSize: 48,
    },
    emptyText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 24,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    muted: {
      color: colors.mutedText,
      fontSize: 14,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: 18,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    headingGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    icon: {
      fontSize: 28,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    date: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 3,
    },
    badge: {
      borderRadius: radius.pill,
      fontSize: 12,
      fontWeight: '600',
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    bloomBadge: {
      backgroundColor: colors.accentPressed,
      color: colors.onAccent,
    },
    budBadge: {
      backgroundColor: colors.disabledBackground,
      color: colors.textSecondary,
    },
    details: {
      gap: 5,
    },
    detail: {
      color: colors.textSecondary,
      fontSize: 13,
    },
  });
}
