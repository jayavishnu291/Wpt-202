
import type { DatabaseAdapter } from './adapter';
import { getAdapter } from './adapter';
import { runMigrations } from './migrations';

export { getAdapter };
export { runMigrations } from './migrations';

export async function getDatabase(): Promise<DatabaseAdapter> {
  const db = await getAdapter();
  await runMigrations(db);
  return db;
}
