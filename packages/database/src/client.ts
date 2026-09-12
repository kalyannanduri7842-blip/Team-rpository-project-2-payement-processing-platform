import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { config } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';

const logger = createLogger('system');

export interface DatabaseAdapter {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  close(): Promise<void>;
}

// In-Memory & File-Backed JSON/SQL Data Store for seamless local execution
export class LocalDataStore {
  private static instance: LocalDataStore;
  private filePath: string;
  public data: {
    users: any[];
    customers: any[];
    merchants: any[];
    payment_methods: any[];
    payments: any[];
    transactions: any[];
    refunds: any[];
    fraud_events: any[];
    notifications: any[];
    audit_logs: any[];
    settlements: any[];
    disputes: any[];
    service_health: any[];
  };

  private constructor() {
    this.filePath = path.resolve(process.cwd(), 'database.json');
    this.data = {
      users: [],
      customers: [],
      merchants: [],
      payment_methods: [],
      payments: [],
      transactions: [],
      refunds: [],
      fraud_events: [],
      notifications: [],
      audit_logs: [],
      settlements: [],
      disputes: [],
      service_health: [],
    };
    this.load();
  }

  public static getInstance(): LocalDataStore {
    if (!LocalDataStore.instance) {
      LocalDataStore.instance = new LocalDataStore();
    }
    return LocalDataStore.instance;
  }

  public load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        logger.info(`Loaded local database from ${this.filePath}`);
      }
    } catch (err: any) {
      logger.warn(`Failed to load database.json: ${err.message}. Initializing empty store.`);
    }
  }

  public save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err: any) {
      logger.error('Failed to persist database.json', err);
    }
  }

  public clear(): void {
    for (const key of Object.keys(this.data) as (keyof typeof this.data)[]) {
      this.data[key] = [];
    }
    this.save();
  }
}

class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const res = await this.pool.query(sql, params);
    return res.rows;
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export class DatabaseService {
  private static instance: DatabaseService;
  private adapter?: DatabaseAdapter;
  private localStore: LocalDataStore;

  private constructor() {
    this.localStore = LocalDataStore.getInstance();
    if (config.db.type === 'postgres' && process.env.ENABLE_POSTGRES === 'true') {
      try {
        this.adapter = new PostgresAdapter(config.db.url);
        logger.info('Connected to PostgreSQL Database');
      } catch (err) {
        logger.warn('Failed to connect to PostgreSQL, using Local Data Store fallback');
      }
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getStore(): LocalDataStore {
    return this.localStore;
  }
}

export const dbService = DatabaseService.getInstance();
