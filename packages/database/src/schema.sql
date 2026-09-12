-- ==========================================
-- Distributed Payment Processing System Schema
-- ==========================================

-- Enable UUID extension if using PostgreSQL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL, -- CUSTOMER, MERCHANT, ADMIN, OPERATIONS
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(64),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    billing_address TEXT,
    balance NUMERIC(12, 2) DEFAULT 10000.00,
    currency VARCHAR(8) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    api_key VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE', -- ACTIVE, PENDING, SUSPENDED
    settlement_currency VARCHAR(8) DEFAULT 'USD',
    commission_rate NUMERIC(5, 4) DEFAULT 0.0250, -- 2.5%
    account_balance NUMERIC(14, 2) DEFAULT 0.00,
    total_revenue NUMERIC(14, 2) DEFAULT 0.00,
    webhook_url TEXT,
    risk_threshold NUMERIC(5, 2) DEFAULT 70.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_merchants_api_key ON merchants(api_key);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL, -- CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, DIGITAL_WALLET
    provider VARCHAR(64) NOT NULL, -- Visa, MasterCard, Chase, PayPal, etc.
    last4 VARCHAR(8) NOT NULL,
    expiry_month INT,
    expiry_year INT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON payment_methods(customer_id);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE SET NULL,
    payment_method_id VARCHAR(64) REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    fee_amount NUMERIC(12, 2) DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL, -- CREATED, PROCESSING, SUCCESS, FAILED, TIMEOUT
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    client_ip VARCHAR(64),
    failure_reason TEXT,
    retry_count INT DEFAULT 0,
    risk_score NUMERIC(5, 2) DEFAULT 0.00,
    risk_level VARCHAR(16) DEFAULT 'LOW', -- LOW, MEDIUM, HIGH
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Transactions Table (Immutable Financial Ledger)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    status VARCHAR(32) NOT NULL,
    payment_method_type VARCHAR(32) NOT NULL,
    reference_number VARCHAR(128) UNIQUE NOT NULL,
    correlation_id VARCHAR(128) NOT NULL,
    metadata JSONB,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_correlation ON transactions(correlation_id);

-- Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    reason VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL, -- REQUESTED, PROCESSING, COMPLETED, FAILED, REJECTED
    rejection_reason TEXT,
    correlation_id VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refunds_transaction ON refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_merchant ON refunds(merchant_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Fraud Events Table
CREATE TABLE IF NOT EXISTS fraud_events (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE SET NULL,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE SET NULL,
    risk_score NUMERIC(5, 2) NOT NULL,
    risk_level VARCHAR(16) NOT NULL, -- LOW, MEDIUM, HIGH
    triggered_rules JSONB NOT NULL,
    action VARCHAR(32) NOT NULL, -- APPROVED, FLAGGED_FOR_REVIEW, BLOCKED
    status VARCHAR(32) DEFAULT 'PENDING_REVIEW', -- PENDING_REVIEW, RESOLVED_APPROVED, RESOLVED_REJECTED
    reviewed_by VARCHAR(64),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fraud_payment ON fraud_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_fraud_risk_level ON fraud_events(risk_level);
CREATE INDEX IF NOT EXISTS idx_fraud_status ON fraud_events(status);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(32) DEFAULT 'IN_APP', -- IN_APP, EMAIL, SMS, WEBHOOK
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    resource_id VARCHAR(64),
    correlation_id VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64),
    status VARCHAR(32) NOT NULL, -- SUCCESS, FAILURE
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);

-- Settlements Table
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    fee_deducted NUMERIC(12, 2) DEFAULT 0.00,
    net_payout NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    status VARCHAR(32) DEFAULT 'PENDING', -- PENDING, PROCESSED, FAILED
    payout_date TIMESTAMP WITH TIME ZONE,
    transactions_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlements_merchant ON settlements(merchant_id);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
    merchant_id VARCHAR(64) REFERENCES merchants(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) DEFAULT 'USD',
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'OPEN', -- OPEN, UNDER_REVIEW, WON, LOST
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON disputes(transaction_id);
