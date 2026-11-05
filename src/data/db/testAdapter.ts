
import BetterSqlite3 from 'better-sqlite3';
import type { DatabaseAdapter, SqlValue } from './adapter';

export class TestSQLiteAdapter implements DatabaseAdapter {
  private readonly db: BetterSqlite3.Database;

  constructor() {
    this.db = new BetterSqlite3(':memory:');
    this.db.pragma('foreign_keys = ON');
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async run(
    sql: string,
    params: SqlValue[] = [],
  ): Promise<void> {
    this.db.prepare(sql).run(...params);
  }

  async all<T>(
    sql: string,
    params: SqlValue[] = [],
  ): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[];
  }

  async transaction<T>(
    work: (transaction: DatabaseAdapter) => Promise<T>,
  ): Promise<T> {
    this.db.exec('BEGIN');

    try {
      const result = await work(this);
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  close(): void {
    this.db.close();
  }
}
