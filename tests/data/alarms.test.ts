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
      sound: 'morning-bell',
      vibration: true,
      snooze_on: false,
      snoozes_used: 1,
      next_trigger_at: '2026-10-31T06:30:00+05:30',
      skip_next: false,
    };

    await saveAlarm(alarm, db);

    await expect(listAlarms(db)).resolves.toEqual([alarm]);
  });

  it('rejects invalid and duplicate alarm entries', async () => {
    const alarm: Alarm = {
      id: 'alarm-1',
      time: '06:30',
      repeat_days: [1, 3, 5],
      label: 'Wake up',
      enabled: true,
      mission_type: 'math',
      level: 2,
      count: 5,
      sound: 'morning-bell',
      vibration: true,
      snooze_on: false,
      snoozes_used: 0,
      next_trigger_at: null,
      skip_next: false,
    };

    await saveAlarm(alarm, db);
    await expect(saveAlarm({ ...alarm, id: 'alarm-2' }, db))
      .rejects.toThrow('Duplicate alarm.');
    await expect(saveAlarm({ ...alarm, id: 'alarm-3', time: '25:00' }, db))
      .rejects.toThrow('Alarm time must use HH:mm format.');
  });

  it('enforces the maximum alarm count', async () => {
    for (let index = 0; index < 5; index += 1) {
      await saveAlarm({
        id: `alarm-${index}`,
        time: `06:${String(index).padStart(2, '0')}`,
        repeat_days: [1],
        label: '',
        enabled: true,
        mission_type: 'math',
        level: 2,
        count: 2,
        sound: 'morning-bell',
        vibration: true,
        snooze_on: false,
        snoozes_used: 0,
        next_trigger_at: null,
        skip_next: false,
      }, db);
    }

    await expect(saveAlarm({
      id: 'alarm-6',
      time: '07:00',
      repeat_days: [1],
      label: '',
      enabled: true,
      mission_type: 'math',
      level: 2,
      count: 2,
      sound: 'morning-bell',
      vibration: true,
      snooze_on: false,
      snoozes_used: 0,
      next_trigger_at: null,
      skip_next: false,
    }, db)).rejects.toThrow('Alarm limit reached.');
  });

  it('accepts a grapheme-safe 30-character label and limits repository reads', async () => {
    const alarm: Alarm = {
      id: 'alarm-unicode',
      time: '08:00',
      repeat_days: [0, 1, 2, 3, 4, 5, 6],
      label: '😀'.repeat(30),
      enabled: true,
      mission_type: 'math',
      level: 2,
      count: 2,
      sound: 'morning-bell',
      vibration: true,
      snooze_on: false,
      snoozes_used: 0,
      next_trigger_at: null,
      skip_next: false,
    };

    await expect(saveAlarm(alarm, db)).resolves.toBeUndefined();
    await expect(listAlarms(db)).resolves.toEqual([alarm]);
  });

  it('rejects invalid mission and sound values', async () => {
    const alarm: Alarm = {
      id: 'alarm-validation',
      time: '08:30',
      repeat_days: [1],
      label: 'Test',
      enabled: true,
      mission_type: 'invalid',
      level: 2,
      count: 2,
      sound: 'invalid-sound',
      vibration: true,
      snooze_on: false,
      snoozes_used: 0,
      next_trigger_at: null,
      skip_next: false,
    };

    await expect(saveAlarm(alarm, db)).rejects.toThrow('Alarm mission is invalid.');
  });
});
