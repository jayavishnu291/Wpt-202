
import { getDatabase } from './index';
import type { DatabaseAdapter } from './adapter';

const TABLES_TO_CLEAR = [
  'phone_use',
  'device_events',
  'focus_sessions',
  'nights',
  'alarms',
  'block_lists',
  'streaks',
  'milestones',
  'ad_state',
  'settings',
] as const;

export async function deleteAllData(
  database?: DatabaseAdapter,
): Promise<void> {
  const db = database ?? await getDatabase();

  await db.transaction(async (transaction) => {
    for (const table of TABLES_TO_CLEAR) {
      await transaction.exec(`DELETE FROM ${table};`);
    }
  });

  // TODO: cancel native alarms after the alarm scheduler is implemented.
  // TODO: clear native stores and reset native ad consent after those integrations exist.
}
