// @ts-ignore - sql.js doesn't have types
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db!: SqlJsDatabase;
  private dbPath: string;
  private SQL: any;

  constructor() {
    // Use data directory in project root
    const dataDir = join(process.cwd(), '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbPath = join(dataDir, 'tagflow.db');
  }

  async onModuleInit() {
    // Initialize sql.js
    this.SQL = await initSqlJs();
    
    // Load existing database or create new one
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
    }
    
    // Enable WAL mode for better concurrency (note: sql.js doesn't support WAL, but we keep for compatibility)
    console.log(`Database connected: ${this.dbPath}`);
  }

  async onModuleDestroy() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
      console.log('Database connection closed');
    }
  }

  /**
   * Save database to file
   */
  private saveDatabase() {
    if (this.db) {
      const data = this.db.export();
      fs.writeFileSync(this.dbPath, data);
    }
  }

  /**
   * Execute a query and return results
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      const results: T[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }
      stmt.free();
      
      this.saveDatabase();
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
      const results = this.query<T>(sql, params);
      return results[0];
    } catch (error: any) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Execute an insert/update/delete query
   */
  exec(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    try {
      this.db.run(sql, params);
      this.saveDatabase();
      
      // Get changes and last insert rowid
      const changes = this.db.getRowsModified();
      const lastInsertRowid = this.queryOne<{ id: number }>('SELECT last_insert_rowid() as id')?.id || 0;
      
      return { 
        changes,
        lastInsertRowid
      };
    } catch (error: any) {
      console.error('Database exec error:', error);
      throw error;
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  transaction<T>(callback: () => T): T {
    try {
      this.db.run('BEGIN TRANSACTION');
      const result = callback();
      this.db.run('COMMIT');
      this.saveDatabase();
      return result;
    } catch (error) {
      this.db.run('ROLLBACK');
      throw error;
    }
  }

  /**
   * Get the underlying database instance
   */
  getDatabase(): SqlJsDatabase {
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
      
      // Split SQL by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          this.db.run(statement);
        }
      }
    }

    this.saveDatabase();
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
      
      // Split SQL by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          this.db.run(statement);
        }
      }
    }

    this.saveDatabase();
    console.log('All seeds completed');
  }
}
