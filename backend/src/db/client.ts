import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface DbResult<T = any> {
  rows: T[];
  rowCount?: number;
}

export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<DbResult<T>>;
  init(): Promise<void>;
  close(): Promise<void>;
}

class PostgresDatabaseClient implements IDatabaseClient {
  private pool: any = null;
  private pglite: any = null;
  private isPglite = false;

  async init(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      console.log(' Connecting to PostgreSQL via DATABASE_URL...');
      const { Pool } = await import('pg');
      this.pool = new Pool({
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
      });
      this.isPglite = false;
    } else {
      console.log(' Initializing embedded PostgreSQL (PGlite) with filesystem persistence...');
      const { PGlite } = await import('@electric-sql/pglite');
      const dataDir = path.join(__dirname, '..', '..', 'data', 'pglite_db');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      this.pglite = new PGlite(dataDir);
      this.isPglite = true;
    }

    // Execute schema if needed
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await this.exec(schemaSql);
      console.log(' PostgreSQL schema verified & ready.');
    }

    // Check if seeded
    const countRes = await this.query('SELECT COUNT(*) as count FROM properties');
    const count = parseInt(countRes.rows[0]?.count || '0', 10);
    if (count === 0) {
      console.log(' Empty database detected. Seeding initial properties, tenants, vendors, and complaints...');
      const seedPath = path.join(__dirname, 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        await this.exec(seedSql);
        console.log(' Seed data inserted successfully.');
      }
    }
  }

  async exec(sql: string): Promise<void> {
    if (this.isPglite) {
      await this.pglite.exec(sql);
    } else {
      await this.pool.query(sql);
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<DbResult<T>> {
    if (this.isPglite) {
      const res = await this.pglite.query(sql, params || []);
      return {
        rows: res.rows as T[],
        rowCount: res.rows?.length
      };
    } else {
      const res = await this.pool.query(sql, params || []);
      return {
        rows: res.rows as T[],
        rowCount: res.rowCount
      };
    }
  }

  async close(): Promise<void> {
    if (this.isPglite && this.pglite) {
      await this.pglite.close();
    } else if (this.pool) {
      await this.pool.end();
    }
  }
}

export const db: IDatabaseClient = new PostgresDatabaseClient();
