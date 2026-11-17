import { TestSQLiteAdapter } from '../../src/data/db/testAdapter';
import { runMigrations } from '../../src/data/db';
import { listHistory } from '../../src/data/repos/history';

describe('History repository', () => {
  let db: TestSQLiteAdapter;

  beforeEach(async () => {
    db = new TestSQLiteAdapter();
    await runMigrations(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns completed focus sessions, nights, and naps newest first', async () => {
    await db.exec(`
      INSERT INTO focus_sessions (id, start_at, end_at, planned_min, result, label)
        VALUES ('focus', '2026-10-30T09:00:00Z', '2026-10-30T09:25:00Z', 25, 'bloom', 'Reading');
      INSERT INTO nights (id, kind, start_at, end_at, est_sleep_min, star, pickups_count)
        VALUES ('night', 'night', '2026-10-30T22:00:00Z', '2026-10-31T07:00:00Z', 480, 'star', 2);
      INSERT INTO nights (id, kind, start_at, end_at)
        VALUES ('nap', 'nap', '2026-10-31T12:00:00Z', '2026-10-31T12:30:00Z');
      INSERT INTO focus_sessions (id, start_at, planned_min)
        VALUES ('running-focus', '2026-10-31T13:00:00Z', 25);
    `);

    await expect(listHistory(db)).resolves.toEqual([
      expect.objectContaining({ id: 'nap', type: 'nap' }),
      expect.objectContaining({
        id: 'night',
        type: 'night',
        sleepMinutes: 480,
        star: 'star',
        pickups: 2,
      }),
      expect.objectContaining({
        id: 'focus',
        type: 'focus',
        plannedMinutes: 25,
        result: 'bloom',
        label: 'Reading',
      }),
    ]);
  });
});
