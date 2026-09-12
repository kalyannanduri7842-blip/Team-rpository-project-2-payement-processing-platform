import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Customer,
  Merchant,
  PaymentMethod,
  Payment,
  Transaction,
  Refund,
  FraudAlert,
  Notification,
  AuditLog,
  Settlement,
  Dispute,
  ServiceHealthMetric,
} from '@payment-system/shared-types';
import { LocalDataStore } from './client';

const store = LocalDataStore.getInstance();

export const UserRepository = {
  async findById(id: string): Promise<User | null> {
    const user = store.data.users.find(u => u.id === id);
    return user ? { ...user } : null;
  },

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const user = store.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { passwordHash: string }): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User & { passwordHash: string } = {
      id: `usr_${uuidv4().substring(0, 8)}`,
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    store.data.users.push(newUser);
    store.save();
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  },

  async list(role?: string): Promise<User[]> {
    let users = store.data.users;
    if (role) {
      users = users.filter(u => u.role === role);
    }
    return users.map(({ passwordHash, ...u }) => ({ ...u }));
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = store.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    store.data.users[index] = {
      ...store.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    const { passwordHash, ...safeUser } = store.data.users[index];
    return safeUser;
  },
};

export const CustomerRepository = {
  async findById(id: string): Promise<Customer | null> {
    const c = store.data.customers.find(item => item.id === id);
    return c ? { ...c } : null;
  },

  async findByUserId(userId: string): Promise<Customer | null> {
    const c = store.data.customers.find(item => item.userId === userId);
    return c ? { ...c } : null;
  },

  async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cus_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.customers.push(customer);
    store.save();
    return customer;
  },

  async list(): Promise<Customer[]> {
    return [...store.data.customers];
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const index = store.data.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    store.data.customers[index] = {
      ...store.data.customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.data.customers[index];
  },

  async updateBalance(id: string, delta: number): Promise<Customer | null> {
    const index = store.data.customers.findIndex(c => c.id === id);
    if (index === -1) return null;
    store.data.customers[index].balance = Math.max(0, Number((store.data.customers[index].balance + delta).toFixed(2)));
    store.data.customers[index].updatedAt = new Date().toISOString();
    store.save();
    return store.data.customers[index];
  },
};

export const MerchantRepository = {
  async findById(id: string): Promise<Merchant | null> {
    const m = store.data.merchants.find(item => item.id === id);
    return m ? { ...m } : null;
  },

  async findByUserId(userId: string): Promise<Merchant | null> {
    const m = store.data.merchants.find(item => item.userId === userId);
    return m ? { ...m } : null;
  },

  async findByApiKey(apiKey: string): Promise<Merchant | null> {
    const m = store.data.merchants.find(item => item.apiKey === apiKey);
    return m ? { ...m } : null;
  },

  async create(data: Omit<Merchant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Merchant> {
    const now = new Date().toISOString();
    const merchant: Merchant = {
      id: `mch_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.merchants.push(merchant);
    store.save();
    return merchant;
  },

  async list(): Promise<Merchant[]> {
    return [...store.data.merchants];
  },

  async update(id: string, updates: Partial<Merchant>): Promise<Merchant | null> {
    const index = store.data.merchants.findIndex(m => m.id === id);
    if (index === -1) return null;
    store.data.merchants[index] = {
      ...store.data.merchants[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.data.merchants[index];
  },

  async addRevenue(id: string, amount: number, commissionRate = 0.025): Promise<Merchant | null> {
    const index = store.data.merchants.findIndex(m => m.id === id);
    if (index === -1) return null;
    const fee = amount * commissionRate;
    const net = amount - fee;
    store.data.merchants[index].totalRevenue = Number((store.data.merchants[index].totalRevenue + amount).toFixed(2));
    store.data.merchants[index].accountBalance = Number((store.data.merchants[index].accountBalance + net).toFixed(2));
    store.data.merchants[index].updatedAt = new Date().toISOString();
    store.save();
    return store.data.merchants[index];
  },
};

export const PaymentMethodRepository = {
  async create(data: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: `pm_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    if (paymentMethod.isDefault) {
      store.data.payment_methods.forEach(pm => {
        if (pm.customerId === data.customerId) pm.isDefault = false;
      });
    }
    store.data.payment_methods.push(paymentMethod);
    store.save();
    return paymentMethod;
  },

  async findByCustomerId(customerId: string): Promise<PaymentMethod[]> {
    return store.data.payment_methods.filter(pm => pm.customerId === customerId);
  },

  async delete(id: string): Promise<boolean> {
    const index = store.data.payment_methods.findIndex(pm => pm.id === id);
    if (index === -1) return false;
    store.data.payment_methods.splice(index, 1);
    store.save();
    return true;
  },
};

export const PaymentRepository = {
  async create(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const now = new Date().toISOString();
    const payment: Payment = {
      id: `pay_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.payments.unshift(payment);
    store.save();
    return payment;
  },

  async findById(id: string): Promise<Payment | null> {
    const p = store.data.payments.find(item => item.id === id);
    return p ? { ...p } : null;
  },

  async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const p = store.data.payments.find(item => item.idempotencyKey === key);
    return p ? { ...p } : null;
  },

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const index = store.data.payments.findIndex(p => p.id === id);
    if (index === -1) return null;
    store.data.payments[index] = {
      ...store.data.payments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.data.payments[index];
  },

  async list(filters: { customerId?: string; merchantId?: string; status?: string; limit?: number; offset?: number } = {}): Promise<{ items: Payment[]; total: number }> {
    let list = store.data.payments;
    if (filters.customerId) list = list.filter(p => p.customerId === filters.customerId);
    if (filters.merchantId) list = list.filter(p => p.merchantId === filters.merchantId);
    if (filters.status) list = list.filter(p => p.status === filters.status);

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const items = list.slice(offset, offset + limit);
    return { items, total };
  },

  async getStats(merchantId?: string) {
    let list = store.data.payments;
    if (merchantId) list = list.filter(p => p.merchantId === merchantId);

    const total = list.length;
    const success = list.filter(p => p.status === 'SUCCESS').length;
    const failed = list.filter(p => p.status === 'FAILED').length;
    const pending = list.filter(p => p.status === 'PROCESSING' || p.status === 'CREATED').length;
    const totalAmount = list.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);

    return { total, success, failed, pending, totalAmount: Number(totalAmount.toFixed(2)) };
  },
};

export const TransactionRepository = {
  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: `txn_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.transactions.unshift(transaction);
    store.save();
    return transaction;
  },

  async findById(id: string): Promise<Transaction | null> {
    const t = store.data.transactions.find(item => item.id === id);
    return t ? { ...t } : null;
  },

  async findByPaymentId(paymentId: string): Promise<Transaction | null> {
    const t = store.data.transactions.find(item => item.paymentId === paymentId);
    return t ? { ...t } : null;
  },

  async list(filters: { customerId?: string; merchantId?: string; status?: string; search?: string; limit?: number; offset?: number } = {}): Promise<{ items: Transaction[]; total: number }> {
    let list = store.data.transactions;
    if (filters.customerId) list = list.filter(t => t.customerId === filters.customerId);
    if (filters.merchantId) list = list.filter(t => t.merchantId === filters.merchantId);
    if (filters.status) list = list.filter(t => t.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.referenceNumber.toLowerCase().includes(q) || 
        t.paymentId.toLowerCase().includes(q)
      );
    }

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    const items = list.slice(offset, offset + limit);
    return { items, total };
  },
};

export const RefundRepository = {
  async create(data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>): Promise<Refund> {
    const now = new Date().toISOString();
    const refund: Refund = {
      id: `ref_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.refunds.unshift(refund);
    store.save();
    return refund;
  },

  async findById(id: string): Promise<Refund | null> {
    const r = store.data.refunds.find(item => item.id === id);
    return r ? { ...r } : null;
  },

  async update(id: string, updates: Partial<Refund>): Promise<Refund | null> {
    const index = store.data.refunds.findIndex(r => r.id === id);
    if (index === -1) return null;
    store.data.refunds[index] = {
      ...store.data.refunds[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.data.refunds[index];
  },

  async list(filters: { merchantId?: string; customerId?: string; status?: string; limit?: number; offset?: number } = {}): Promise<{ items: Refund[]; total: number }> {
    let list = store.data.refunds;
    if (filters.merchantId) list = list.filter(r => r.merchantId === filters.merchantId);
    if (filters.customerId) list = list.filter(r => r.customerId === filters.customerId);
    if (filters.status) list = list.filter(r => r.status === filters.status);

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return { items: list.slice(offset, offset + limit), total };
  },
};

export const FraudEventRepository = {
  async create(data: Omit<FraudAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<FraudAlert> {
    const now = new Date().toISOString();
    const alert: FraudAlert = {
      id: `frd_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.fraud_events.unshift(alert);
    store.save();
    return alert;
  },

  async findById(id: string): Promise<FraudAlert | null> {
    const f = store.data.fraud_events.find(item => item.id === id);
    return f ? { ...f } : null;
  },

  async update(id: string, updates: Partial<FraudAlert>): Promise<FraudAlert | null> {
    const index = store.data.fraud_events.findIndex(f => f.id === id);
    if (index === -1) return null;
    store.data.fraud_events[index] = {
      ...store.data.fraud_events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.save();
    return store.data.fraud_events[index];
  },

  async list(filters: { riskLevel?: string; status?: string; limit?: number; offset?: number } = {}): Promise<{ items: FraudAlert[]; total: number }> {
    let list = store.data.fraud_events;
    if (filters.riskLevel) list = list.filter(f => f.riskLevel === filters.riskLevel);
    if (filters.status) list = list.filter(f => f.status === filters.status);

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return { items: list.slice(offset, offset + limit), total };
  },
};

export const NotificationRepository = {
  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.data.notifications.unshift(notification);
    store.save();
    return notification;
  },

  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    return store.data.notifications.filter(n => n.userId === userId).slice(0, limit);
  },

  async markAsRead(id: string): Promise<boolean> {
    const n = store.data.notifications.find(item => item.id === id);
    if (!n) return false;
    n.isRead = true;
    store.save();
    return true;
  },

  async markAllAsRead(userId: string): Promise<void> {
    store.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    store.save();
  },
};

export const AuditLogRepository = {
  async create(data: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const log: AuditLog = {
      id: `aud_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.data.audit_logs.unshift(log);
    store.save();
    return log;
  },

  async list(filters: { actorId?: string; resource?: string; limit?: number; offset?: number } = {}): Promise<{ items: AuditLog[]; total: number }> {
    let list = store.data.audit_logs;
    if (filters.actorId) list = list.filter(l => l.actorId === filters.actorId);
    if (filters.resource) list = list.filter(l => l.resource === filters.resource);

    const total = list.length;
    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return { items: list.slice(offset, offset + limit), total };
  },
};

export const SettlementRepository = {
  async create(data: Omit<Settlement, 'id' | 'createdAt'>): Promise<Settlement> {
    const s: Settlement = {
      id: `stl_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.data.settlements.unshift(s);
    store.save();
    return s;
  },

  async findByMerchantId(merchantId: string): Promise<Settlement[]> {
    return store.data.settlements.filter(s => s.merchantId === merchantId);
  },

  async list(): Promise<Settlement[]> {
    return [...store.data.settlements];
  },
};

export const DisputeRepository = {
  async create(data: Omit<Dispute, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dispute> {
    const now = new Date().toISOString();
    const dispute: Dispute = {
      id: `dsp_${uuidv4().substring(0, 8)}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.data.disputes.unshift(dispute);
    store.save();
    return dispute;
  },

  async list(filters: { merchantId?: string; customerId?: string } = {}): Promise<Dispute[]> {
    let list = store.data.disputes;
    if (filters.merchantId) list = list.filter(d => d.merchantId === filters.merchantId);
    if (filters.customerId) list = list.filter(d => d.customerId === filters.customerId);
    return list;
  },
};
