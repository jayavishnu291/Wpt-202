import { TestSQLiteAdapter } from '../../src/data/db/testAdapter';
import { runMigrations } from '../../src/data/db';
import {
  listAlarms,
  saveAlarm,
  type Alarm,
} from '../../src/data/repos/alarms';

describe('Alarm repository', () => {
  let db: TestSQLiteAdapter;

  beforeEach(async () => {
    db = new TestSQLiteAdapter();
    await runMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  it('saves and reads an alarm without changing its values', async () => {
    const alarm: Alarm = {
      id: 'alarm-1',
      time: '06:30',
      repeat_days: [1, 3, 5],
      label: 'Wake up',
      enabled: true,
      mission_type: 'math',
      level: 2,
      count: 5,
      sound: 'default',
      vibration: true,
      snooze_on: false,
      snoozes_used: 1,
      next_trigger_at: '2026-10-31T06:30:00+05:30',
      skip_next: false,
    };

    await saveAlarm(alarm, db);

    await expect(listAlarms(db)).resolves.toEqual([alarm]);
  });
});
