import { TestSQLiteAdapter } from '../../src/data/db/testAdapter';
import { INITIAL_SCHEMA } from '../../src/data/db/schema';
import {
  getSettings,
  saveSettings,
} from '../../src/data/repos/settings';

describe('Settings repository', () => {
  let db: TestSQLiteAdapter;

  beforeEach(async () => {
    db = new TestSQLiteAdapter();
    await db.exec(INITIAL_SCHEMA);
  });

  afterEach(() => {
    db.close();
  });

  it('saves and reads settings', async () => {
    await saveSettings(
      {
        bedtime: '22:00',
        default_wake_time: '06:30',
        sleep_goal_min: 480,
        allowance_min: 30,
        reminder_on: true,
        reminder_offset_min: 15,
        default_focus_min: 25,
        focus_goal_min: 120,
        session_sound_on: true,
        crash_reports_on: false,
        same_block_list: false,
        install_date: '2026-10-29',
        onboarding_done: true,
        rating_asked: false,
      },
      db,
    );

    const result = await getSettings(db);

    expect(result.bedtime).toBe('22:00');
    expect(result.default_wake_time).toBe('06:30');
    expect(result.sleep_goal_min).toBe(480);
    expect(result.reminder_on).toBe(true);
    expect(result.bedtime_changed_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+05:30$/,
    );
  });

  it('calculates window_start as four hours before bedtime', async () => {
    await saveSettings(
      {
        bedtime: '22:00',
        default_wake_time: '06:30',
      },
      db,
    );

    const result = await getSettings(db);

    expect(result.window_start).toBe('18:00');
  });
});
