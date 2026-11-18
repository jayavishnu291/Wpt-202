import { getDatabase } from '../db';
import type { DatabaseAdapter } from '../db/adapter';

export interface HistoryEntry {
  id: string;
  type: 'focus' | 'night' | 'nap';
  startAt: string;
  endAt: string;
  plannedMinutes: number | null;
  result: 'bloom' | 'bud' | null;
  label: string | null;
  sleepMinutes: number | null;
  star: 'star' | 'faint' | 'none' | null;
  pickups: number | null;
}

interface FocusRow {
  id: string;
  start_at: string;
  end_at: string;
  planned_min: number;
  result: 'bloom' | 'bud' | null;
  label: string | null;
}

interface NightRow {
  id: string;
  kind: 'night' | 'nap';
  start_at: string;
  end_at: string;
  est_sleep_min: number | null;
  star: 'star' | 'faint' | 'none' | null;
  pickups_count: number;
}

export async function listHistory(
  database?: DatabaseAdapter,
): Promise<HistoryEntry[]> {
  const db = database ?? await getDatabase();
  const [focusRows, nightRows] = await Promise.all([
    db.all<FocusRow>(
      `SELECT id, start_at, end_at, planned_min, result, label
       FROM focus_sessions
       WHERE end_at IS NOT NULL
       ORDER BY start_at DESC
       LIMIT 50`,
    ),
    db.all<NightRow>(
      `SELECT id, kind, start_at, end_at, est_sleep_min, star, pickups_count
       FROM nights
       WHERE end_at IS NOT NULL
       ORDER BY start_at DESC
       LIMIT 50`,
    ),
  ]);

  const focusEntries: HistoryEntry[] = focusRows.map((row) => ({
    id: row.id,
    type: 'focus',
    startAt: row.start_at,
    endAt: row.end_at,
    plannedMinutes: row.planned_min,
    result: row.result,
    label: row.label,
    sleepMinutes: null,
    star: null,
    pickups: null,
  }));
  const nightEntries: HistoryEntry[] = nightRows.map((row) => ({
    id: row.id,
    type: row.kind,
    startAt: row.start_at,
    endAt: row.end_at,
    plannedMinutes: null,
    result: null,
    label: null,
    sleepMinutes: row.est_sleep_min,
    star: row.star,
    pickups: row.pickups_count,
  }));

  return [...focusEntries, ...nightEntries]
    .sort((left, right) => right.startAt.localeCompare(left.startAt))
    .slice(0, 50);
}
