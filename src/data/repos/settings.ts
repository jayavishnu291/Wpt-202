
import { getDatabase } from '../db';
import type { DatabaseAdapter } from '../db/adapter';
import { toIndiaISOString } from '../time';

export interface AppSettings {
  bedtime: string;
  window_start: string;
  default_wake_time: string;
  sleep_goal_min: number;
  allowance_min: number;
  reminder_on: boolean;
  reminder_offset_min: number;
  default_focus_min: number;
  focus_goal_min: number;
  session_sound_on: boolean;
  crash_reports_on: boolean;
  same_block_list: boolean;
  install_date: string | null;
  onboarding_done: boolean;
  rating_asked: boolean;
  bedtime_changed_at: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  bedtime: '23:00',
  window_start: '19:00',
  default_wake_time: '07:00',
  sleep_goal_min: 480,
  allowance_min: 60,
  reminder_on: true,
  reminder_offset_min: 15,
  default_focus_min: 25,
  focus_goal_min: 60,
  session_sound_on: true,
  crash_reports_on: true,
  same_block_list: true,
  install_date: null,
  onboarding_done: false,
  rating_asked: false,
  bedtime_changed_at: null,
};

interface SettingsRow {
  bedtime: string;
  window_start: string;
  default_wake_time: string;
  sleep_goal_min: number;
  allowance_min: number;
  reminder_on: number;
  reminder_offset_min: number;
  default_focus_min: number;
  focus_goal_min: number;
  session_sound_on: number;
  crash_reports_on: number;
  same_block_list: number;
  install_date: string | null;
  onboarding_done: number;
  rating_asked: number;
  bedtime_changed_at: string | null;
}

function subtractFourHours(time: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    throw new Error(`Invalid time "${time}". Expected HH:mm.`);
  }

  const minutes =
    (Number(match[1]) * 60 + Number(match[2]) - 240 + 1440) % 1440;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function fromRow(row: SettingsRow): AppSettings {
  return {
    bedtime: row.bedtime,
    window_start: row.window_start,
    default_wake_time: row.default_wake_time,
    sleep_goal_min: row.sleep_goal_min,
    allowance_min: row.allowance_min,
    reminder_on: row.reminder_on === 1,
    reminder_offset_min: row.reminder_offset_min,
    default_focus_min: row.default_focus_min,
    focus_goal_min: row.focus_goal_min,
    session_sound_on: row.session_sound_on === 1,
    crash_reports_on: row.crash_reports_on === 1,
    same_block_list: row.same_block_list === 1,
    install_date: row.install_date,
    onboarding_done: row.onboarding_done === 1,
    rating_asked: row.rating_asked === 1,
    bedtime_changed_at: row.bedtime_changed_at,
  };
}

export async function getSettings(
  database?: DatabaseAdapter,
): Promise<AppSettings> {
  const db = database ?? await getDatabase();

  let rows = await db.all<SettingsRow>(
    'SELECT * FROM settings WHERE id = 1',
  );

  if (rows.length === 0) {
    await saveSettings(DEFAULT_SETTINGS, db);

    rows = await db.all<SettingsRow>(
      'SELECT * FROM settings WHERE id = 1',
    );
  }

  if (!rows[0]) {
    throw new Error('Could not initialize settings.');
  }

  return fromRow(rows[0]);
}

export async function saveSettings(
  settings: Partial<AppSettings>,
  database?: DatabaseAdapter,
): Promise<AppSettings> {
  const db = database ?? await getDatabase();

  const existingRows = await db.all<SettingsRow>(
    'SELECT * FROM settings WHERE id = 1',
  );

  const previous = existingRows[0]
    ? fromRow(existingRows[0])
    : DEFAULT_SETTINGS;

  const next: AppSettings = {
    ...previous,
    ...settings,
    window_start: subtractFourHours(
      settings.bedtime ?? previous.bedtime,
    ),
    bedtime_changed_at:
      settings.bedtime !== undefined &&
      settings.bedtime !== previous.bedtime
        ? toIndiaISOString()
        : previous.bedtime_changed_at,
  };

  await db.run(
    `INSERT INTO settings (
      id, bedtime, window_start, default_wake_time,
      sleep_goal_min, allowance_min, reminder_on,
      reminder_offset_min, default_focus_min, focus_goal_min,
      session_sound_on, crash_reports_on, same_block_list,
      install_date, onboarding_done, rating_asked, bedtime_changed_at
    ) VALUES (
      1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      bedtime = excluded.bedtime,
      window_start = excluded.window_start,
      default_wake_time = excluded.default_wake_time,
      sleep_goal_min = excluded.sleep_goal_min,
      allowance_min = excluded.allowance_min,
      reminder_on = excluded.reminder_on,
      reminder_offset_min = excluded.reminder_offset_min,
      default_focus_min = excluded.default_focus_min,
      focus_goal_min = excluded.focus_goal_min,
      session_sound_on = excluded.session_sound_on,
      crash_reports_on = excluded.crash_reports_on,
      same_block_list = excluded.same_block_list,
      install_date = excluded.install_date,
      onboarding_done = excluded.onboarding_done,
      rating_asked = excluded.rating_asked,
      bedtime_changed_at = excluded.bedtime_changed_at`,
    [
      next.bedtime,
      next.window_start,
      next.default_wake_time,
      next.sleep_goal_min,
      next.allowance_min,
      Number(next.reminder_on),
      next.reminder_offset_min,
      next.default_focus_min,
      next.focus_goal_min,
      Number(next.session_sound_on),
      Number(next.crash_reports_on),
      Number(next.same_block_list),
      next.install_date,
      Number(next.onboarding_done),
      Number(next.rating_asked),
      next.bedtime_changed_at,
    ],
  );

  return next;
}
