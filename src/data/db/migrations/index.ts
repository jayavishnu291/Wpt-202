
import type { DatabaseAdapter } from '../adapter';
import { SCHEMA_VERSION } from '../schema';
import { migrate001Initial } from './001_initial';

const MIGRATIONS = [
  { version: 1, migrate: migrate001Initial },
] as const;

export const CURRENT_SCHEMA_VERSION = SCHEMA_VERSION;

export async function runMigrations(
  db: DatabaseAdapter,
): Promise<void> {
  const rows = await db.all<{ user_version: number }>(
    'PRAGMA user_version;',
  );

  const currentVersion = rows[0]?.user_version ?? 0;

  if (currentVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Database version ${currentVersion} is newer than supported version ${CURRENT_SCHEMA_VERSION}.`,
    );
  }

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.transaction(async (transaction) => {
      await migration.migrate(transaction);
      await transaction.exec(`PRAGMA user_version = ${migration.version};`);
    });
  }
}
