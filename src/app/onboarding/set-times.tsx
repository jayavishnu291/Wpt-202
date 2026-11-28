
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

const COLORS = {
  background: '#F7F5EF',
  white: '#FFFFFF',
  text: '#1E2430',
  textSoft: '#4A5160',
  accent: '#3A7D44',
  accentPressed: '#2F6638',
  border: '#E6E4DC',
};

const TOP_SPACE =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 16 : 56;

interface SetTimesScreenProps {
  initialBedtime?: { hours: number; minutes: number };
  initialWakeUpTime?: { hours: number; minutes: number };
  initialReminderEnabled?: boolean;
  showReminder?: boolean;
  onContinue: (settings: {
    bedtime: { hours: number; minutes: number };
    wakeUpTime: { hours: number; minutes: number };
    reminderEnabled: boolean;
  }) => void;
  onBack: () => void;
}

function formatTime(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function adjustTime(
  time: { hours: number; minutes: number },
  change: number,
) {
  const total = (time.hours * 60 + time.minutes + change + 1440) % 1440;
  return {
    hours: Math.floor(total / 60),
    minutes: total % 60,
  };
}

function TimePicker({
  label,
  time,
  onChange,
}: {
  label: string;
  time: { hours: number; minutes: number };
  onChange: (time: { hours: number; minutes: number }) => void;
}) {
  return (
    <View style={styles.timeCard}>
      <Text style={styles.timeLabel}>{label}</Text>

      <View style={styles.timeControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Earlier ${label}`}
          onPress={() => onChange(adjustTime(time, -30))}
          style={styles.adjustButton}
        >
          <Text style={styles.adjustText}>−</Text>
        </Pressable>

        <Text style={styles.timeValue}>
          {formatTime(time.hours, time.minutes)}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Later ${label}`}
          onPress={() => onChange(adjustTime(time, 30))}
          style={styles.adjustButton}
        >
          <Text style={styles.adjustText}>+</Text>
        </Pressable>
      </View>

      <Text style={styles.helper}>Adjust in 30-minute steps</Text>
    </View>
  );
}

export default function SetTimesScreen({
  initialBedtime = { hours: 23, minutes: 0 },
  initialWakeUpTime = { hours: 7, minutes: 0 },
  initialReminderEnabled = true,
  showReminder = true,
  onContinue,
  onBack,
}: SetTimesScreenProps) {
  const [bedtime, setBedtime] = useState(initialBedtime);
  const [wakeUpTime, setWakeUpTime] = useState(initialWakeUpTime);
  const [reminderEnabled, setReminderEnabled] = useState(
    initialReminderEnabled,
  );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: TOP_SPACE }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>

        <Text accessibilityRole="header" style={styles.heading}>
          Set your times
        </Text>

        <Text style={styles.subtitle}>
          Choose when your day ends and when your morning begins. You can
          change these later.
        </Text>

        <TimePicker
          label="Bedtime"
          time={bedtime}
          onChange={setBedtime}
        />

        <TimePicker
          label="Wake-up time"
          time={wakeUpTime}
          onChange={setWakeUpTime}
        />

        {showReminder && (
          <View style={styles.reminderCard}>
            <View style={styles.reminderText}>
              <Text style={styles.reminderTitle}>
                Remind me at bedtime
              </Text>
              <Text style={styles.helper}>
                Get a gentle reminder when bedtime arrives.
              </Text>
            </View>

            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#C9C9C9', true: '#A6CDAA' }}
              thumbColor={reminderEnabled ? COLORS.accent : '#F4F3F0'}
              accessibilityLabel="Remind me at bedtime"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            onContinue({
              bedtime,
              wakeUpTime,
              reminderEnabled: showReminder
                ? reminderEnabled
                : false,
            })
          }
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingRight: 20,
    marginBottom: 18,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  heading: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSoft,
    marginBottom: 26,
  },
  timeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSoft,
    marginBottom: 16,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EDF2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustText: {
    fontSize: 26,
    fontWeight: '600',
    color: COLORS.accent,
  },
  timeValue: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.text,
  },
  helper: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSoft,
    marginTop: 12,
  },
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderText: {
    flex: 1,
    paddingRight: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: COLORS.accentPressed,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});
