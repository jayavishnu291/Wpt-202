import type { DatabaseAdapter } from '../adapter';

export async function migrate002AlarmDefaults(
  db: DatabaseAdapter,
): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS alarms_migration (
      id TEXT PRIMARY KEY NOT NULL,
      time TEXT NOT NULL,
      repeat_days TEXT NOT NULL DEFAULT '[]',
      label TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      mission_type TEXT,
      level INTEGER,
      count INTEGER,
      sound TEXT,
      vibration INTEGER NOT NULL DEFAULT 1,
      snooze_on INTEGER NOT NULL DEFAULT 0,
      snoozes_used INTEGER NOT NULL DEFAULT 0,
      next_trigger_at TEXT,
      skip_next INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR REPLACE INTO alarms_migration (
      id, time, repeat_days, label, enabled, mission_type,
      level, count, sound, vibration, snooze_on, snoozes_used,
      next_trigger_at, skip_next
    )
    SELECT
      id, time, repeat_days, label, enabled, mission_type,
      level, count, sound, vibration,
      CASE WHEN snooze_on IS NULL THEN 0 ELSE snooze_on END,
      snoozes_used, next_trigger_at, skip_next
    FROM alarms;

    DROP TABLE alarms;
    ALTER TABLE alarms_migration RENAME TO alarms;
    CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(enabled);
  `);
}
