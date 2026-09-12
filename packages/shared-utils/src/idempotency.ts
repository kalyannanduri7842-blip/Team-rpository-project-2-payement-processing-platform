export type IdempotencyState = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface IdempotencyRecord<T = any> {
  key: string;
  state: IdempotencyState;
  statusCode?: number;
  response?: T;
  error?: string;
  createdAt: number;
  expiresAt: number;
}

export class IdempotencyManager {
  private cache = new Map<string, IdempotencyRecord>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 86400000) { // 24 hours
    this.defaultTtlMs = defaultTtlMs;
  }

  public reserve(key: string, ttlMs = this.defaultTtlMs): { success: boolean; existing?: IdempotencyRecord } {
    this.cleanExpired();
    const existing = this.cache.get(key);

    if (existing) {
      return { success: false, existing };
    }

    const now = Date.now();
    const record: IdempotencyRecord = {
      key,
      state: 'PENDING',
      createdAt: now,
      expiresAt: now + ttlMs,
    };
    this.cache.set(key, record);
    return { success: true };
  }

  public complete<T>(key: string, statusCode: number, response: T): void {
    const record = this.cache.get(key);
    if (record) {
      record.state = 'COMPLETED';
      record.statusCode = statusCode;
      record.response = response;
    } else {
      const now = Date.now();
      this.cache.set(key, {
        key,
        state: 'COMPLETED',
        statusCode,
        response,
        createdAt: now,
        expiresAt: now + this.defaultTtlMs,
      });
    }
  }

  public fail(key: string, error: string): void {
    const record = this.cache.get(key);
    if (record) {
      record.state = 'FAILED';
      record.error = error;
    }
  }

  public get(key: string): IdempotencyRecord | undefined {
    this.cleanExpired();
    return this.cache.get(key);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (record.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export const globalIdempotencyManager = new IdempotencyManager();
