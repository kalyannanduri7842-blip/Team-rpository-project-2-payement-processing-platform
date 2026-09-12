// Role Definitions
export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'OPERATIONS';

// Payment Enums
export type PaymentStatus = 'CREATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY';

// Refund Enums
export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
export type RefundReason = 'DUPLICATE' | 'FRAUDULENT' | 'REQUESTED_BY_CUSTOMER' | 'PRODUCT_NOT_RECEIVED' | 'OTHER';

// Fraud / Risk Enums
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type FraudAction = 'APPROVED' | 'FLAGGED_FOR_REVIEW' | 'BLOCKED';

// Notification Enums
export type NotificationType = 
  | 'PAYMENT_SUCCESS' 
  | 'PAYMENT_FAILED' 
  | 'PAYMENT_PENDING' 
  | 'REFUND_REQUESTED'
  | 'REFUND_COMPLETED' 
  | 'REFUND_FAILED' 
  | 'FRAUD_ALERT' 
  | 'SETTLEMENT_PROCESSED'
  | 'SYSTEM_ALERT';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WEBHOOK';

// Microservice Identifiers
export type ServiceName = 
  | 'api-gateway' 
  | 'auth-service' 
  | 'payment-service' 
  | 'transaction-service' 
  | 'merchant-service' 
  | 'refund-service' 
  | 'fraud-service' 
  | 'notification-service' 
  | 'reporting-service' 
  | 'monitoring-service';

export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';

// Domain Entities
export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  billingAddress?: string;
  balance: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  apiKey: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  settlementCurrency: Currency;
  commissionRate: number; // e.g. 0.025 (2.5%)
  accountBalance: number;
  totalRevenue: number;
  webhookUrl?: string;
  riskThreshold: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;
  provider: string; // Visa, MasterCard, Chase, PayPal, etc.
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  merchantId: string;
  paymentMethodId?: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: Currency;
  status: PaymentStatus;
  idempotencyKey: string;
  description?: string;
  clientIp?: string;
  failureReason?: string;
  retryCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  paymentId: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethodType: PaymentMethodType;
  referenceNumber: string;
  correlationId: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Refund {
  id: string;
  transactionId: string;
  paymentId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: Currency;
  reason: RefundReason;
  status: RefundStatus;
  rejectionReason?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FraudAlert {
  id: string;
  paymentId: string;
  transactionId?: string;
  customerId: string;
  merchantId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  triggeredRules: string[];
  action: FraudAction;
  status: 'PENDING_REVIEW' | 'RESOLVED_APPROVED' | 'RESOLVED_REJECTED';
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  resourceId?: string;
  correlationId: string;
  ipAddress?: string;
  status: 'SUCCESS' | 'FAILURE';
  details?: Record<string, any>;
  createdAt: string;
}

export interface Settlement {
  id: string;
  merchantId: string;
  amount: number;
  feeDeducted: number;
  netPayout: number;
  currency: Currency;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  payoutDate: string;
  transactionsCount: number;
  createdAt: string;
}

export interface Dispute {
  id: string;
  transactionId: string;
  customerId: string;
  merchantId: string;
  amount: number;
  currency: Currency;
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'WON' | 'LOST';
  createdAt: string;
  updatedAt: string;
}

export interface ServiceHealthMetric {
  service: ServiceName;
  instanceId: string;
  status: ServiceStatus;
  uptimeSeconds: number;
  cpuUsage: number; // percentage
  memoryUsageMb: number;
  requestCount: number;
  errorCount: number;
  latencyMs: number;
  lastHeartbeat: string;
}

export interface QueueMetrics {
  activeJobs: number;
  waitingJobs: number;
  completedJobs: number;
  failedJobs: number;
  delayedJobs: number;
  deadLetterQueueCount: number;
  eventProcessingRatePerMin: number;
}

// Distributed Event Payload Definitions
export interface DistributedEvent<T = any> {
  eventId: string;
  eventType: string;
  correlationId: string;
  timestamp: string;
  sourceService: ServiceName;
  payload: T;
  retryCount?: number;
}

// API Payloads and DTOs
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    correlationId?: string;
  };
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    correlationId?: string;
    timestamp: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthUserResponse {
  user: User;
  tokens: AuthTokens;
  profile?: Customer | Merchant | null;
}

export interface CreatePaymentDto {
  merchantId: string;
  amount: number;
  currency: Currency;
  paymentMethodType: PaymentMethodType;
  paymentMethodDetails?: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvc?: string;
    cardHolderName?: string;
    bankAccountNumber?: string;
    bankRoutingNumber?: string;
    walletProvider?: string;
  };
  savePaymentMethod?: boolean;
  description?: string;
  idempotencyKey?: string;
}

export interface CreateRefundDto {
  transactionId: string;
  amount?: number; // Optional if full refund
  reason: RefundReason;
  notes?: string;
}

export interface UpdateMerchantDto {
  businessName?: string;
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  commissionRate?: number;
  webhookUrl?: string;
  riskThreshold?: number;
}

export interface ChaosConfig {
  service: ServiceName;
  simulateFailure: boolean;
  injectedLatencyMs: number;
  failureRate: number; // 0.0 - 1.0
  circuitBreakerTripped?: boolean;
}
