import { ServiceName } from '@payment-system/shared-types';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: ServiceName | 'system';
  message: string;
  correlationId?: string;
  context?: Record<string, any>;
  error?: string;
}

// In-memory ring buffer of recent logs for Operations dashboard
const MAX_LOGS = 300;
const logBuffer: LogEntry[] = [];

export class Logger {
  private service: ServiceName | 'system';

  constructor(service: ServiceName | 'system') {
    this.service = service;
  }

  public debug(message: string, correlationId?: string, context?: Record<string, any>): void {
    this.log('DEBUG', message, correlationId, context);
  }

  public info(message: string, correlationId?: string, context?: Record<string, any>): void {
    this.log('INFO', message, correlationId, context);
  }

  public warn(message: string, correlationId?: string, context?: Record<string, any>): void {
    this.log('WARN', message, correlationId, context);
  }

  public error(message: string, error?: any, correlationId?: string, context?: Record<string, any>): void {
    const errorStr = error instanceof Error ? error.stack || error.message : typeof error === 'object' ? JSON.stringify(error) : String(error);
    this.log('ERROR', message, correlationId, context, errorStr);
  }

  private log(level: LogLevel, message: string, correlationId?: string, context?: Record<string, any>, error?: string): void {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      correlationId,
      context,
      error,
    };

    logBuffer.unshift(entry);
    if (logBuffer.length > MAX_LOGS) {
      logBuffer.pop();
    }

    // Console output formatted with ANSI colors
    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
    };
    const reset = '\x1b[0m';
    const corrStr = correlationId ? ` [${correlationId}]` : '';
    const formatted = `${colors[level]}[${entry.timestamp}] [${level}] [${this.service}]${corrStr}${reset} ${message}`;
    
    if (level === 'ERROR') {
      console.error(formatted, error || '', context || '');
    } else if (level === 'WARN') {
      console.warn(formatted, context || '');
    } else {
      console.log(formatted, context || '');
    }
  }
}

export function getSystemLogs(limit = 100, service?: ServiceName, level?: LogLevel): LogEntry[] {
  let filtered = logBuffer;
  if (service) {
    filtered = filtered.filter(l => l.service === service);
  }
  if (level) {
    filtered = filtered.filter(l => l.level === level);
  }
  return filtered.slice(0, limit);
}

export function createLogger(service: ServiceName | 'system'): Logger {
  return new Logger(service);
}
