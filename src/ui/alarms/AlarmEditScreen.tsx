
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isOn, rules, switches } from '../../../config/rules';
import { t } from '../../text/t';
import type { Alarm } from '../../services/data';
import { useTheme } from '../theme';

interface Props {
  initialAlarm?: Alarm | null;
  onSave: (alarm: Alarm) => void | Promise<void>;
  onCancel: () => void;
}

type Mission = 'math' | 'shake';
type SoundId =
  | 'morning-bell'
  | 'soft-chimes'
  | 'birdsong'
  | 'rising-tone'
  | 'classic-beep'
  | 'strong-bell';

const DAYS = [
  { key: 'mon', value: 1 },
  { key: 'tue', value: 2 },
  { key: 'wed', value: 3 },
  { key: 'thu', value: 4 },
  { key: 'fri', value: 5 },
  { key: 'sat', value: 6 },
  { key: 'sun', value: 0 },
] as const;

const SOUNDS = [
  {
    id: 'morning-bell',
    textKey: 'alarmEdit.soundMorningBell',
    source: require('../../../assets/sounds/morning-bell.wav'),
  },
  {
    id: 'soft-chimes',
    textKey: 'alarmEdit.soundSoftChimes',
    source: require('../../../assets/sounds/soft-chimes.wav'),
  },
  {
    id: 'birdsong',
    textKey: 'alarmEdit.soundBirdsong',
    source: require('../../../assets/sounds/birdsong.wav'),
  },
  {
    id: 'rising-tone',
    textKey: 'alarmEdit.soundRisingTone',
    source: require('../../../assets/sounds/rising-tone.wav'),
  },
  {
    id: 'classic-beep',
    textKey: 'alarmEdit.soundClassicBeep',
    source: require('../../../assets/sounds/classic-beep.wav'),
  },
  {
    id: 'strong-bell',
    textKey: 'alarmEdit.soundStrongBell',
    source: require('../../../assets/sounds/strong-bell.wav'),
  },
] as const;

const DIFFICULTY_KEYS = ['levelEasy', 'levelMedium', 'levelHard'] as const;

const DIFFICULTIES = rules.alarms.mathsDifficultyLevels.map((value, index) => ({
  value,
  key: DIFFICULTY_KEYS[index],
}));

const SHAKE_LEVELS = rules.alarms.shakeLevels.map((value, index) => ({
  value,
  key: DIFFICULTY_KEYS[index],
}));

function isMathMission(alarm?: Alarm | null): boolean {
  return alarm?.mission_type === 'math' || alarm?.mission_type === 'maths';
}

function initialMathsLevel(alarm?: Alarm | null): number {
  const level = alarm?.level;

  return level !== null &&
    level !== undefined &&
    rules.alarms.mathsDifficultyLevels.some((value) => value === level)
    ? level
    : rules.alarms.defaultMathsLevel;
}

function initialShakeLevel(alarm?: Alarm | null): number {
  const level = alarm?.level;

  return level !== null &&
    level !== undefined &&
    rules.alarms.shakeLevels.some((value) => value === level)
    ? level
    : rules.alarms.shakeLevels[0];
}

function limitLabel(value: string): string {
  return Array.from(value)
    .slice(0, rules.alarms.maximumLabelCharacters)
    .join('');
}

export default function AlarmEditScreen({
  initialAlarm,
  onSave,
  onCancel,
}: Props) {
  const { colors, spacing, radius, layout } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, layout),
    [colors, spacing, radius, layout],
  );
  const shakeEnabled = isOn('SW-06');

  const showSnooze =
    Platform.OS !== 'ios' || switches['SW-03'] !== 'C';

  const player = useAudioPlayer(null);

  const [time, setTime] = useState(
    initialAlarm?.time ?? rules.alarms.defaultTime,
  );

  const [label, setLabel] = useState(initialAlarm?.label ?? '');

  const [repeatDays, setRepeatDays] = useState<number[]>(
    initialAlarm?.repeat_days ?? [...rules.alarms.defaultRepeatDays],
  );

  const [mission, setMission] = useState<Mission>(() =>
    initialAlarm?.mission_type === 'shake' && shakeEnabled
      ? 'shake'
      : 'math',
  );

  const [mathsLevel, setMathsLevel] = useState(() =>
    isMathMission(initialAlarm)
      ? initialMathsLevel(initialAlarm)
      : rules.alarms.defaultMathsLevel,
  );

  const savedMathsCount = initialAlarm?.count;

  const [mathsCount, setMathsCount] = useState(
    isMathMission(initialAlarm) &&
      savedMathsCount !== null &&
      savedMathsCount !== undefined &&
      savedMathsCount >= rules.alarms.mathsMinimumProblems &&
      savedMathsCount <= rules.alarms.mathsMaximumProblems
      ? savedMathsCount
      : rules.alarms.defaultMathsProblems,
  );

  const [shakeLevel, setShakeLevel] = useState(() =>
    initialShakeLevel(initialAlarm),
  );

  const [sound, setSound] = useState<SoundId>(
    SOUNDS.find((item) => item.id === initialAlarm?.sound)?.id ??
      rules.alarms.defaultSound,
  );

  const [vibration, setVibration] = useState(
    initialAlarm?.vibration ?? rules.alarms.defaultVibration,
  );

  const [snooze, setSnooze] = useState(
    initialAlarm?.snooze_on ?? rules.alarms.defaultSnooze,
  );

  const [saving, setSaving] = useState(false);
  const headingKey = initialAlarm ? 'alarmEdit.title' : 'alarmEdit.titleNew';
  const saveKey = saving ? 'alarmEdit.saving' : 'alarmEdit.save';
  const mathMarkKey = mission === 'math'
    ? 'alarmEdit.selectedMark'
    : 'alarmEdit.unselectedMark';
  const shakeMarkKey = mission === 'shake'
    ? 'alarmEdit.selectedMark'
    : 'alarmEdit.unselectedMark';

  useEffect(() => () => player.pause(), [player]);

  const toggleDay = (day: number) => {
    setRepeatDays((current) =>
      current.includes(day)
        ? current.filter((value) => value !== day)
        : [...current, day],
    );
  };

  const previewSound = async (soundId: SoundId) => {
    const selectedSound = SOUNDS.find((item) => item.id === soundId);

    if (!selectedSound) return;

    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      player.pause();
      player.replace(selectedSound.source);
      await player.seekTo(0);
      player.play();
    } catch (error) {
      console.error('Unable to preview alarm sound:', error);
      Alert.alert(t('common.error'), t('alarmEdit.previewFailed'));
    }
  };

  const handleSave = async () => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      Alert.alert(
        t('alarmEdit.invalidTimeTitle'),
        t('alarmEdit.invalidTimeMessage'),
      );
      return;
    }

    if (mission === 'shake' && !shakeEnabled) {
      Alert.alert(
        t('alarmEdit.shakeUnavailableTitle'),
        t('alarmEdit.shakeUnavailableMessage'),
      );
      return;
    }

    const alarm: Alarm = {
      id: initialAlarm?.id ?? `alarm-${Date.now()}`,
      time,
      repeat_days: repeatDays,
      label: limitLabel(label).trim(),
      enabled: initialAlarm?.enabled ?? true,
      mission_type: mission,
      level: mission === 'shake' ? shakeLevel : mathsLevel,
      count: mission === 'math' ? mathsCount : null,
      sound,
      vibration,
      snooze_on: showSnooze ? snooze : false,
      snoozes_used: initialAlarm?.snoozes_used ?? 0,
      next_trigger_at: initialAlarm?.next_trigger_at ?? null,
      skip_next: initialAlarm?.skip_next ?? false,
    };

    try {
      setSaving(true);
      await onSave(alarm);
    } catch (error) {
      console.error('Unable to save alarm:', error);
      Alert.alert(t('common.error'), t('alarmEdit.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const repeatSummary = () => {
    if (repeatDays.length === 0) return t('alarmEdit.once');

    if (repeatDays.length === DAYS.length) {
      return t('alarmEdit.everyDay');
    }

    return DAYS
      .filter((day) => repeatDays.includes(day.value))
      .map((day) => t(`common.day.${day.key}`))
      .join(', ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹ {t('common.back')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          {t(headingKey)}
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('alarmEdit.time')}</Text>

          <TextInput
            value={time}
            onChangeText={setTime}
            placeholder={rules.alarms.defaultTime}
            placeholderTextColor={colors.mutedText}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            accessibilityLabel={t('alarmEdit.time')}
            style={styles.timeInput}
          />

          <Text style={styles.hint}>{t('alarmEdit.timeHint')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('alarmEdit.repeat')}</Text>

          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const selected = repeatDays.includes(day.value);

              return (
                <TouchableOpacity
                  key={day.key}
                  onPress={() => toggleDay(day.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={t(`common.day.${day.key}`)}
                  style={[
                    styles.dayButton,
                    selected && styles.selectedDay,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.selectedDayText,
                    ]}
                  >
                    {t(`common.day.${day.key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.hint}>{repeatSummary()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('alarmEdit.label')}</Text>

          <TextInput
            value={label}
            onChangeText={(value) => setLabel(limitLabel(value))}
            placeholder={t('alarmEdit.labelHint')}
            placeholderTextColor={colors.mutedText}
            maxLength={rules.alarms.maximumLabelCharacters}
            accessibilityLabel={t('alarmEdit.label')}
            style={styles.textInput}
          />

          <Text style={styles.hint}>
            {t('alarmEdit.labelCharacters', {
              count: Array.from(label).length,
              maximum: rules.alarms.maximumLabelCharacters,
            })}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('alarmEdit.mission')}</Text>

          <TouchableOpacity
            onPress={() => setMission('math')}
            accessibilityRole="button"
            accessibilityState={{ selected: mission === 'math' }}
            style={[
              styles.option,
              mission === 'math' && styles.selectedOption,
            ]}
          >
            <Text style={styles.optionText}>
              {t('alarmEdit.missionMaths')}
            </Text>
            <Text style={styles.optionMark}>
              {t(mathMarkKey)}
            </Text>
          </TouchableOpacity>

          {/* text-ok: UI visibility condition */}
          {mission === 'math' && (
            <View style={styles.nestedSection}>
              <Text style={styles.hint}>
                {t('alarmEdit.mathsDifficulty')}
              </Text>

              <View style={styles.choicesRow}>
                {DIFFICULTIES.map(({ value, key }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setMathsLevel(value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mathsLevel === value }}
                    style={[
                      styles.choice,
                      mathsLevel === value && styles.selectedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        mathsLevel === value && styles.selectedDayText,
                      ]}
                    >
                      {t(`alarmEdit.${key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.hint}>
                {t('alarmEdit.mathsProblems')}
              </Text>

              <View style={styles.choicesRow}>
                {Array.from(
                  {
                    length:
                      rules.alarms.mathsMaximumProblems -
                      rules.alarms.mathsMinimumProblems + 1,
                  },
                  (_, index) =>
                    index + rules.alarms.mathsMinimumProblems,
                ).map((count) => (
                  <TouchableOpacity
                    key={count}
                    onPress={() => setMathsCount(count)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: mathsCount === count }}
                    style={[
                      styles.choice,
                      mathsCount === count && styles.selectedDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        mathsCount === count && styles.selectedDayText,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {shakeEnabled && (
            <>
              <TouchableOpacity
                onPress={() => setMission('shake')}
                accessibilityRole="button"
                accessibilityState={{ selected: mission === 'shake' }}
                style={[
                  styles.option,
                  mission === 'shake' && styles.selectedOption,
                ]}
              >
                <Text style={styles.optionText}>
                  {t('alarmEdit.missionShake')}
                </Text>
                <Text style={styles.optionMark}>
                  {t(shakeMarkKey)}
                </Text>
              </TouchableOpacity>

              {/* text-ok: UI visibility condition */}
              {mission === 'shake' && (
                <View style={styles.nestedSection}>
                  <Text style={styles.hint}>
                    {t('alarmEdit.shakeLevel')}
                  </Text>

                  <View style={styles.choicesRow}>
                    {SHAKE_LEVELS.map(({ value, key }) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setShakeLevel(value)}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: shakeLevel === value,
                        }}
                        style={[
                          styles.choice,
                          shakeLevel === value && styles.selectedDay,
                        ]}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            shakeLevel === value && styles.selectedDayText,
                          ]}
                        >
                          {t('alarmEdit.shakeLevelOption', {
                            difficulty: t(`alarmEdit.${key}`),
                            count: value,
                          })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('alarmEdit.sound')}</Text>

          {SOUNDS.map((item) => (
            <View key={item.id} style={styles.soundRow}>
              <TouchableOpacity
                onPress={() => {
                  setSound(item.id);
                  void previewSound(item.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: sound === item.id }}
                style={styles.soundName}
              >
                <Text style={styles.optionText}>
                  {t(item.textKey)}
                </Text>
                <Text style={styles.optionMark}>
                  {t(sound === item.id
                    ? 'alarmEdit.selectedMark'
                    : 'alarmEdit.unselectedMark')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSound(item.id);
                  void previewSound(item.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('alarmEdit.previewSound', {
                  sound: t(item.textKey),
                })}
                style={styles.previewButton}
              >
                <Text style={styles.previewText}>
                  {t('alarmEdit.preview')}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t('alarmEdit.vibration')}
          </Text>

          <View style={styles.settingRow}>
            <Text style={styles.optionText}>
              {t('alarmEdit.vibration')}
            </Text>

            <Switch
              value={vibration}
              onValueChange={setVibration}
              accessibilityLabel={t('alarmEdit.vibration')}
              trackColor={{
                false: colors.controlOff,
                true: colors.accent,
              }}
              thumbColor={vibration ? colors.onAccent : colors.surface}
            />
          </View>

          {showSnooze ? (
            <View style={styles.settingRow}>
              <View style={styles.snoozeInfo}>
                <Text style={styles.optionText}>
                  {t('alarmEdit.snooze')}
                </Text>
                <Text style={styles.hint}>
                  {t('alarmEdit.snoozeLimit', {
                    count: rules.alarms.snoozeCount,
                    minutes: rules.alarms.snoozeDurationMinutes,
                  })}
                </Text>
              </View>

              <Switch
                value={snooze}
                onValueChange={setSnooze}
                accessibilityLabel={t('alarmEdit.snooze')}
                trackColor={{
                  false: colors.controlOff,
                  true: colors.accent,
                }}
                thumbColor={snooze ? colors.onAccent : colors.surface}
              />
            </View>
          ) : (
            <Text style={styles.hint}>
              {t('alarmEdit.noSnoozeOnIphone')}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => void handleSave()}
          disabled={saving}
          accessibilityRole="button"
          style={[
            styles.saveButton,
            saving && styles.disabledOption,
          ]}
        >
          <Text style={styles.saveText}>
            {t(saveKey)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
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
    content: {
      padding: layout.screenPadding,
      paddingBottom: 40,
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: spacing.lg,
      paddingVertical: 6,
    },
    backText: {
      color: colors.accent,
      fontSize: 16,
    },
    heading: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: spacing.xl,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.card,
      padding: layout.cardPadding,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: spacing.lg,
    },
    timeInput: {
      color: colors.accent,
      fontSize: 38,
      fontWeight: 'bold',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: spacing.sm,
    },
    textInput: {
      color: colors.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      padding: spacing.md,
    },
    hint: {
      color: colors.mutedText,
      fontSize: 12,
      marginTop: spacing.sm,
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayButton: {
      minWidth: 36,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: colors.disabledBackground,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    selectedDay: {
      backgroundColor: colors.accent,
    },
    dayText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 12,
    },
    selectedDayText: {
      color: colors.onAccent,
      fontWeight: 'bold',
    },
    option: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 13,
      paddingHorizontal: spacing.md,
      borderRadius: radius.sm,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedOption: {
      borderWidth: 1,
      borderColor: colors.accent,
    },
    optionText: {
      color: colors.text,
      fontSize: 15,
    },
    optionMark: {
      color: colors.accent,
      fontSize: 19,
      fontWeight: 'bold',
    },
    nestedSection: {
      paddingHorizontal: 10,
      paddingBottom: spacing.md,
    },
    choicesRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    choice: {
      backgroundColor: colors.disabledBackground,
      borderRadius: radius.sm,
      minWidth: 42,
      paddingVertical: 10,
      paddingHorizontal: 13,
      alignItems: 'center',
    },
    choiceText: {
      color: colors.text,
      fontWeight: 'bold',
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      marginBottom: spacing.sm,
      paddingLeft: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    soundName: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 13,
    },
    previewButton: {
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    previewText: {
      color: colors.accent,
      fontWeight: '600',
    },
    disabledOption: {
      opacity: 0.4,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    snoozeInfo: {
      flex: 1,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: radius.button,
      padding: 17,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    saveText: {
      color: colors.onAccent,
      fontWeight: 'bold',
      fontSize: 17,
    },
    cancelButton: {
      padding: 15,
      alignItems: 'center',
    },
    cancelText: {
      color: colors.mutedText,
      fontSize: 15,
    },
  });
}
