import Database from 'better-sqlite3';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: Database.Database;
  private dbPath: string;

  constructor() {
    // Use data directory in project root
    const dataDir = join(process.cwd(), '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = join(dataDir, 'tagflow.db');
  }

  async onModuleInit() {
    this.db = new Database(this.dbPath);
    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    console.log(`Database connected: ${this.dbPath}`);
  }

  async onModuleDestroy() {
    if (this.db) {
      this.db.close();
      console.log('Database connection closed');
    }
  }

  /**
   * Execute a query and return results
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      const results = stmt.all(...params) as T[];
      return results;
    } catch (error: any) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute a query and return the first result
   */
  queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.get(...params) as T | undefined;
    } catch (error: any) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute an insert/update/delete query
   */
  exec(sql: string, params: any[] = []): Database.RunResult {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(...params);
    } catch (error: any) {
      console.error('Database exec error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  transaction<T>(callback: () => T): T {
    const transaction = this.db.transaction(callback);
    return transaction();
  }

  /**
   * Get the underlying database instance
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  /**
   * Run migrations
   */
  async runMigrations() {
    const migrationsDir = join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(join(migrationsDir, file), 'utf-8');
      console.log(`Running migration: ${file}`);
      this.db.exec(sql);
    }

    console.log('All migrations completed');
  }

  /**
   * Run seed data
   */
  async runSeeds() {
    const seedsDir = join(__dirname, 'seeds');
    
    if (!fs.existsSync(seedsDir)) {
      console.log('No seeds directory found');
      return;
    }

    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${seedFiles.length} seed files`);

    for (const file of seedFiles) {
      const sql = fs.readFileSync(join(seedsDir, file), 'utf-8');
      console.log(`Running seed: ${file}`);
      this.db.exec(sql);
    }

    console.log('All seeds completed');
  }
}
