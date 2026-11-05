
import type { SQLiteDatabase } from 'expo-sqlite';

export type SqlValue = string | number | null | Uint8Array;

export interface DatabaseAdapter {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  transaction<T>(work: (transaction: DatabaseAdapter) => Promise<T>): Promise<T>;
}

class ExpoSQLiteAdapter implements DatabaseAdapter {
  constructor(private readonly db: SQLiteDatabase) {}

  async exec(sql: string): Promise<void> {
    await this.db.execAsync(sql);
  }

  async run(sql: string, params: SqlValue[] = []): Promise<void> {
    await this.db.runAsync(sql, params);
  }

  async all<T>(sql: string, params: SqlValue[] = []): Promise<T[]> {
    return this.db.getAllAsync<T>(sql, params);
  }

  async transaction<T>(
    work: (transaction: DatabaseAdapter) => Promise<T>,
  ): Promise<T> {
    let result!: T;

    await this.db.withExclusiveTransactionAsync(async (transaction) => {
      result = await work(new ExpoSQLiteAdapter(transaction));
    });

    return result;
  }
}

let adapterPromise: Promise<DatabaseAdapter> | null = null;

export async function getAdapter(): Promise<DatabaseAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      const SQLite = await import('expo-sqlite');
      // TODO (Sprint 2): confirm a custom Application Support directory on iOS.
      const db = await SQLite.openDatabaseAsync('wpt-data.db');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      return new ExpoSQLiteAdapter(db);
    })().catch((error) => {
      adapterPromise = null;
      throw error;
    });
  }

  return adapterPromise;
}
