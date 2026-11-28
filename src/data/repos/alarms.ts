
import { getDatabase } from '../db';
import type { DatabaseAdapter } from '../db/adapter';
import { rules } from '../../../config/rules';
import { countLabelCharacters, limitLabel } from '../../domain/label';

export interface Alarm {
  id: string;
  time: string;
  repeat_days: number[];
  label: string;
  enabled: boolean;
  mission_type: string | null;
  level: number | null;
  count: number | null;
  sound: string | null;
  vibration: boolean;
  snooze_on: boolean;
  snoozes_used: number;
  next_trigger_at: string | null;
  skip_next: boolean;
}

interface AlarmRow {
  id: string;
  time: string;
  repeat_days: string;
  label: string;
  enabled: number;
  mission_type: string | null;
  level: number | null;
  count: number | null;
  sound: string | null;
  vibration: number;
  snooze_on: number;
  snoozes_used: number;
  next_trigger_at: string | null;
  skip_next: number;
}

function fromRow(row: AlarmRow): Alarm | null {
  if (!row.id || !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.time)) {
    return null;
  }

  let repeatDays: number[];
  try {
    const parsed: unknown = JSON.parse(row.repeat_days);
    repeatDays = Array.isArray(parsed)
      ? parsed.filter((day): day is number =>
          typeof day === 'number' &&
          Number.isInteger(day) &&
          day >= 0 &&
          day <= 6,
        )
      : [];
  } catch {
    repeatDays = [];
  }

  const alarm: Alarm = {
    ...row,
    label: typeof row.label === 'string'
      ? limitLabel(row.label)
      : '',
    repeat_days: [...new Set(repeatDays)],
    enabled: row.enabled === 1,
    vibration: row.vibration === 1,
    snooze_on: row.snooze_on === 1,
    skip_next: row.skip_next === 1,
  };

  return alarm;
}

export async function listAlarms(
  database?: DatabaseAdapter,
): Promise<Alarm[]> {
  const db = database ?? await getDatabase();
  const rows = await db.all<AlarmRow>(
    'SELECT * FROM alarms ORDER BY time ASC',
  );

  return rows
    .map(fromRow)
    .filter((alarm): alarm is Alarm => alarm !== null)
    .slice(0, rules.alarms.maximumAlarms);
}

export async function saveAlarm(
  alarm: Alarm,
  database?: DatabaseAdapter,
): Promise<void> {
  const db = database ?? await getDatabase();

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time)) {
    throw new Error('Alarm time must use HH:mm format.');
  }

  if (!alarm.id.trim()) {
    throw new Error('Alarm id is required.');
  }

  if (
    alarm.repeat_days.some(
      (day) => !Number.isInteger(day) || day < 0 || day > 6,
    )
  ) {
    throw new Error('Alarm repeat days are invalid.');
  }

  if (countLabelCharacters(alarm.label) > rules.alarms.maximumLabelCharacters) {
    throw new Error('Alarm label is too long.');
  }

  if (
    alarm.mission_type !== null &&
    alarm.mission_type !== 'math' &&
    alarm.mission_type !== 'maths' &&
    alarm.mission_type !== 'shake'
  ) {
    throw new Error('Alarm mission is invalid.');
  }

  if (
    alarm.sound !== null &&
    ![
      'morning-bell',
      'soft-chimes',
      'birdsong',
      'rising-tone',
      'classic-beep',
      'strong-bell',
    ].includes(alarm.sound)
  ) {
    throw new Error('Alarm sound is invalid.');
  }

  if (alarm.mission_type === 'math' || alarm.mission_type === 'maths') {
    if (
      alarm.level !== null &&
      !rules.alarms.mathsDifficultyLevels.some((level) => level === alarm.level)
    ) {
      throw new Error('Alarm mission level is invalid.');
    }

    if (
      alarm.count !== null &&
      (
        alarm.count < rules.alarms.mathsMinimumProblems ||
        alarm.count > rules.alarms.mathsMaximumProblems
      )
    ) {
      throw new Error('Alarm mission count is invalid.');
    }
  }

  if (alarm.mission_type === 'shake') {
    if (
      alarm.level !== null &&
      !rules.alarms.shakeLevels.some((level) => level === alarm.level)
    ) {
      throw new Error('Alarm mission level is invalid.');
    }
  }

  const existing = await listAlarms(db);

  if (
    existing.length >= rules.alarms.maximumAlarms &&
    !existing.some((item) => item.id === alarm.id)
  ) {
    throw new Error('Alarm limit reached.');
  }

  const duplicate = existing.find((item) =>
    item.id !== alarm.id &&
    item.time === alarm.time &&
    item.repeat_days.slice().sort().join(',') ===
      alarm.repeat_days.slice().sort().join(','),
  );

  if (duplicate) {
    throw new Error('Duplicate alarm.');
  }

  await db.run(
    `INSERT INTO alarms (
      id, time, repeat_days, label, enabled, mission_type,
      level, count, sound, vibration, snooze_on, snoozes_used,
      next_trigger_at, skip_next
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      time = excluded.time,
      repeat_days = excluded.repeat_days,
      label = excluded.label,
      enabled = excluded.enabled,
      mission_type = excluded.mission_type,
      level = excluded.level,
      count = excluded.count,
      sound = excluded.sound,
      vibration = excluded.vibration,
      snooze_on = excluded.snooze_on,
      snoozes_used = excluded.snoozes_used,
      next_trigger_at = excluded.next_trigger_at,
      skip_next = excluded.skip_next`,
    [
      alarm.id,
      alarm.time,
      JSON.stringify(alarm.repeat_days),
      alarm.label,
      Number(alarm.enabled),
      alarm.mission_type,
      alarm.level,
      alarm.count,
      alarm.sound,
      Number(alarm.vibration),
      Number(alarm.snooze_on),
      alarm.snoozes_used,
      alarm.next_trigger_at,
      Number(alarm.skip_next),
    ],
  );
}

export async function deleteAlarm(
  id: string,
  database?: DatabaseAdapter,
): Promise<void> {
  const db = database ?? await getDatabase();
  await db.run('DELETE FROM alarms WHERE id = ?', [id]);
}
