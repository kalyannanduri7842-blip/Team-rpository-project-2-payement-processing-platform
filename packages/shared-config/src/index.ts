import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or current working directory
dotenv.config();

export const SERVICE_PORTS = {
  'api-gateway': parseInt(process.env.PORT_GATEWAY || '4000', 10),
  'auth-service': parseInt(process.env.PORT_AUTH || '4001', 10),
  'payment-service': parseInt(process.env.PORT_PAYMENT || '4002', 10),
  'transaction-service': parseInt(process.env.PORT_TRANSACTION || '4003', 10),
  'merchant-service': parseInt(process.env.PORT_MERCHANT || '4004', 10),
  'refund-service': parseInt(process.env.PORT_REFUND || '4005', 10),
  'fraud-service': parseInt(process.env.PORT_FRAUD || '4006', 10),
  'notification-service': parseInt(process.env.PORT_NOTIFICATION || '4007', 10),
  'reporting-service': parseInt(process.env.PORT_REPORTING || '4008', 10),
  'monitoring-service': parseInt(process.env.PORT_MONITORING || '4009', 10),
} as const;

export const SERVICE_URLS = {
  'api-gateway': process.env.GATEWAY_URL || `http://localhost:${SERVICE_PORTS['api-gateway']}`,
  'auth-service': process.env.AUTH_SERVICE_URL || `http://localhost:${SERVICE_PORTS['auth-service']}`,
  'payment-service': process.env.PAYMENT_SERVICE_URL || `http://localhost:${SERVICE_PORTS['payment-service']}`,
  'transaction-service': process.env.TRANSACTION_SERVICE_URL || `http://localhost:${SERVICE_PORTS['transaction-service']}`,
  'merchant-service': process.env.MERCHANT_SERVICE_URL || `http://localhost:${SERVICE_PORTS['merchant-service']}`,
  'refund-service': process.env.REFUND_SERVICE_URL || `http://localhost:${SERVICE_PORTS['refund-service']}`,
  'fraud-service': process.env.FRAUD_SERVICE_URL || `http://localhost:${SERVICE_PORTS['fraud-service']}`,
  'notification-service': process.env.NOTIFICATION_SERVICE_URL || `http://localhost:${SERVICE_PORTS['notification-service']}`,
  'reporting-service': process.env.REPORTING_SERVICE_URL || `http://localhost:${SERVICE_PORTS['reporting-service']}`,
  'monitoring-service': process.env.MONITORING_SERVICE_URL || `http://localhost:${SERVICE_PORTS['monitoring-service']}`,
} as const;

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key-distributed-payment-system-2025',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-key-distributed-payment-system-2025',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  db: {
    type: (process.env.DB_TYPE || 'sqlite') as 'postgres' | 'sqlite',
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/payment_db',
    sqlitePath: path.resolve(process.cwd(), process.env.DB_FILE || 'payment_system.sqlite'),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  },

  circuitBreaker: {
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
    resetTimeoutMs: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || '10000', 10),
    requestTimeoutMs: 5000,
  },

  retry: {
    maxAttempts: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
    baseDelayMs: parseInt(process.env.RETRY_BASE_DELAY_MS || '500', 10),
    maxDelayMs: 5000,
  },

  ports: SERVICE_PORTS,
  urls: SERVICE_URLS,
};

export default config;
