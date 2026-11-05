
import type { DatabaseAdapter } from '../adapter';
import { INITIAL_SCHEMA } from '../schema';

export async function migrate001Initial(
  db: DatabaseAdapter,
): Promise<void> {
  await db.exec(INITIAL_SCHEMA);
}
