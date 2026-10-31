
import { TestSQLiteAdapter } from '../../src/data/db/testAdapter';
import { runMigrations } from '../../src/data/db/migrations';
import { deleteAllData } from '../../src/data/db/reset';

describe('Local SQLite database', () => {
  it('creates the required tables', async () => {
    const db = new TestSQLiteAdapter();

    try {
      await runMigrations(db);

      const rows = await db.all<{ name: string }>(
        `SELECT name FROM sqlite_master
         WHERE type = 'table'
         ORDER BY name;`,
      );

      const tableNames = rows.map((row) => row.name);

      expect(tableNames).toEqual(
        expect.arrayContaining([
          'settings',
          'alarms',
          'focus_sessions',
          'nights',
          'phone_use',
          'device_events',
          'streaks',
          'milestones',
          'block_lists',
          'ad_state',
        ]),
      );

      const expectedColumns: Record<string, string[]> = {
        settings: [
          'bedtime', 'window_start', 'default_wake_time', 'sleep_goal_min',
          'allowance_min', 'reminder_on', 'reminder_offset_min',
          'default_focus_min', 'focus_goal_min', 'session_sound_on',
          'crash_reports_on', 'same_block_list', 'install_date',
          'onboarding_done', 'rating_asked', 'bedtime_changed_at',
        ],
        alarms: [
          'id', 'time', 'repeat_days', 'label', 'enabled', 'mission_type',
          'level', 'count', 'sound', 'vibration', 'snooze_on',
          'snoozes_used', 'next_trigger_at', 'skip_next',
        ],
        focus_sessions: [
          'id', 'start_at', 'planned_min', 'end_at', 'result', 'pass_used',
          'leave_events', 'unknown_periods', 'question_answer', 'label',
          'flower_seed', 'size_class', 'rare',
        ],
        nights: [
          'id', 'kind', 'late_start', 'start_at', 'end_at', 'end_reason',
          'wake_result', 'snooze_count', 'mission_done_at', 'sleep_day',
          'pickups_count', 'pass_used', 'unknown_periods', 'question_needed',
          'question_answer', 'onset_at', 'est_sleep_min', 'score_parts',
          'score', 'star', 'counted_for_star', 'manual_edit',
        ],
        phone_use: [
          'night_id', 'start_at', 'end_at', 'kind', 'counted_as_pickup',
        ],
        device_events: ['session_kind', 'session_id', 'type', 'at'],
        streaks: [
          'night_current', 'night_best', 'focus_current', 'focus_best',
          'rest_nights_used', 'last_evaluated_day',
        ],
        milestones: ['stars_total', 'constellations_unlocked'],
        block_lists: ['list', 'package_name'],
        ad_state: ['last_ad_shown_date', 'consent_status', 'att_asked'],
      };

      for (const [table, columns] of Object.entries(expectedColumns)) {
        const tableColumns = await db.all<{ name: string }>(
          `PRAGMA table_info(${table});`,
        );
        expect(tableColumns.map((column) => column.name)).toEqual(
          expect.arrayContaining(columns),
        );
      }
    } finally {
      db.close();
    }
  });

  it('preserves version 1 data through a test version 2 migration', async () => {
    const db = new TestSQLiteAdapter();

    try {
      await runMigrations(db);
      await db.run(
        `INSERT INTO alarms (id, time, label)
         VALUES (?, ?, ?);`,
        ['migration-alarm', '07:15', 'Keep this alarm'],
      );

      await db.transaction(async (transaction) => {
        await transaction.exec(
          `ALTER TABLE alarms ADD COLUMN test_v2_value TEXT
           NOT NULL DEFAULT 'version 2';`,
        );
        await transaction.exec('PRAGMA user_version = 2;');
      });

      const versionRows = await db.all<{ user_version: number }>(
        'PRAGMA user_version;',
      );
      const alarmRows = await db.all<{
        id: string;
        time: string;
        label: string;
        test_v2_value: string;
      }>(
        'SELECT id, time, label, test_v2_value FROM alarms;',
      );

      expect(versionRows[0]?.user_version).toBe(2);
      expect(alarmRows).toEqual([
        {
          id: 'migration-alarm',
          time: '07:15',
          label: 'Keep this alarm',
          test_v2_value: 'version 2',
        },
      ]);
    } finally {
      db.close();
    }
  });

  it('deletes rows from every table without dropping the schema', async () => {
    const db = new TestSQLiteAdapter();

    try {
      await runMigrations(db);
      await db.exec(`
        INSERT INTO settings (id) VALUES (1);
        INSERT INTO alarms (id, time) VALUES ('alarm', '07:00');
        INSERT INTO focus_sessions (id, start_at, planned_min)
          VALUES ('focus', '2026-10-30T09:00:00+05:30', 25);
        INSERT INTO nights (id, kind, start_at, sleep_day)
          VALUES ('night', 'night', '2026-10-30T22:00:00+05:30', '2026-10-30');
        INSERT INTO phone_use (night_id, start_at, kind)
          VALUES ('night', '2026-10-30T22:15:00+05:30', 'use');
        INSERT INTO device_events (session_kind, session_id, type, at)
          VALUES ('focus', 'focus', 'heartbeat', '2026-10-30T09:01:00+05:30');
        INSERT INTO streaks (id) VALUES (1);
        INSERT INTO milestones (id) VALUES (1);
        INSERT INTO block_lists (list, package_name)
          VALUES ('focus', 'com.example.test');
        INSERT INTO ad_state (id) VALUES (1);
      `);

      await deleteAllData(db);

      const tableNames = [
        'settings', 'alarms', 'focus_sessions', 'nights', 'phone_use',
        'device_events', 'streaks', 'milestones', 'block_lists', 'ad_state',
      ];

      for (const table of tableNames) {
        const rows = await db.all<{ count: number }>(
          `SELECT COUNT(*) AS count FROM ${table};`,
        );
        expect(rows[0]?.count).toBe(0);
      }

      const schemaVersion = await db.all<{ user_version: number }>(
        'PRAGMA user_version;',
      );
      expect(schemaVersion[0]?.user_version).toBe(1);
    } finally {
      db.close();
    }
  });
});
