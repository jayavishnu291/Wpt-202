
import { getDatabase } from '../db';
import type { DatabaseAdapter } from '../db/adapter';

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

function fromRow(row: AlarmRow): Alarm {
  return {
    ...row,
    repeat_days: JSON.parse(row.repeat_days) as number[],
    enabled: row.enabled === 1,
    vibration: row.vibration === 1,
    snooze_on: row.snooze_on === 1,
    skip_next: row.skip_next === 1,
  };
}

export async function listAlarms(
  database?: DatabaseAdapter,
): Promise<Alarm[]> {
  const db = database ?? await getDatabase();
  const rows = await db.all<AlarmRow>(
    'SELECT * FROM alarms ORDER BY time ASC',
  );

  return rows.map(fromRow);
}

export async function saveAlarm(
  alarm: Alarm,
  database?: DatabaseAdapter,
): Promise<void> {
  const db = database ?? await getDatabase();

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time)) {
    throw new Error('Alarm time must use HH:mm format.');
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
