import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { LocalDataStore } from './client';
import { createLogger } from '@payment-system/shared-utils';

const logger = createLogger('system');

export async function seedDatabase() {
  logger.info('Starting Database Seeding...');
  const store = LocalDataStore.getInstance();
  store.clear();

  const passwordHash = await bcrypt.hash('PayFlow2025!', 10);
  const legacyPasswordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  // 1. Create Primary Demo Users (with new clean credentials)
  const customerUser = {
    id: 'usr_demo_customer',
    email: 'customer@payflow.com',
    passwordHash,
    role: 'CUSTOMER' as const,
    fullName: 'Alex Reynolds (Customer)',
    phoneNumber: '+1-555-0192',
    isActive: true,
    createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const merchantUser = {
    id: 'usr_demo_merchant',
    email: 'merchant@payflow.com',
    passwordHash,
    role: 'MERCHANT' as const,
    fullName: 'Sarah Chen (Apex Retailers)',
    phoneNumber: '+1-555-0143',
    isActive: true,
    createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const adminUser = {
    id: 'usr_demo_admin',
    email: 'admin@payflow.com',
    passwordHash,
    role: 'ADMIN' as const,
    fullName: 'Marcus Vance (Platform Admin)',
    phoneNumber: '+1-555-0100',
    isActive: true,
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const operationsUser = {
    id: 'usr_demo_ops',
    email: 'ops@payflow.com',
    passwordHash,
    role: 'OPERATIONS' as const,
    fullName: 'Elena Rostova (Lead SRE)',
    phoneNumber: '+1-555-0177',
    isActive: true,
    createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Backwards compatible aliases so both @demo.com and @payflow.com work with both passwords
  const legacyCustomer = {
    id: 'usr_legacy_customer',
    email: 'customer@demo.com',
    passwordHash: legacyPasswordHash,
    role: 'CUSTOMER' as const,
    fullName: 'Alex Reynolds (Customer)',
    phoneNumber: '+1-555-0192',
    isActive: true,
    createdAt: customerUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const legacyMerchant = {
    id: 'usr_legacy_merchant',
    email: 'merchant@demo.com',
    passwordHash: legacyPasswordHash,
    role: 'MERCHANT' as const,
    fullName: 'Sarah Chen (Apex Retailers)',
    phoneNumber: '+1-555-0143',
    isActive: true,
    createdAt: merchantUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const legacyAdmin = {
    id: 'usr_legacy_admin',
    email: 'admin@demo.com',
    passwordHash: legacyPasswordHash,
    role: 'ADMIN' as const,
    fullName: 'Marcus Vance (Admin)',
    phoneNumber: '+1-555-0100',
    isActive: true,
    createdAt: adminUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const legacyOps = {
    id: 'usr_legacy_ops',
    email: 'operations@demo.com',
    passwordHash: legacyPasswordHash,
    role: 'OPERATIONS' as const,
    fullName: 'Elena Rostova (SRE)',
    phoneNumber: '+1-555-0177',
    isActive: true,
    createdAt: operationsUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  store.data.users.push(
    customerUser,
    merchantUser,
    adminUser,
    operationsUser,
    legacyCustomer,
    legacyMerchant,
    legacyAdmin,
    legacyOps
  );

  // 2. Create Customer Profiles
  const customer1 = {
    id: 'cus_demo_1',
    userId: customerUser.id,
    email: customerUser.email,
    fullName: customerUser.fullName,
    billingAddress: '742 Evergreen Terrace, Springfield, OR',
    balance: 9450.00,
    currency: 'USD' as const,
    createdAt: customerUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const customerLegacy = {
    id: 'cus_legacy_1',
    userId: legacyCustomer.id,
    email: legacyCustomer.email,
    fullName: legacyCustomer.fullName,
    billingAddress: '742 Evergreen Terrace, Springfield, OR',
    balance: 9450.00,
    currency: 'USD' as const,
    createdAt: legacyCustomer.createdAt,
    updatedAt: new Date().toISOString(),
  };

  store.data.customers.push(customer1, customerLegacy);

  // 3. Create Merchant Profiles
  const merchant1 = {
    id: 'mch_demo_1',
    userId: merchantUser.id,
    businessName: 'Apex Retailers Inc.',
    apiKey: process.env.DEMO_API_KEY || "demo-key-not-secret",
    status: 'ACTIVE' as const,
    settlementCurrency: 'USD' as const,
    commissionRate: 0.025, // 2.5%
    accountBalance: 32450.00,
    totalRevenue: 184920.00,
    webhookUrl: 'https://api.apexretailers.com/webhooks/payments',
    riskThreshold: 70.0,
    createdAt: merchantUser.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const merchantLegacy = {
    id: 'mch_legacy_1',
    userId: legacyMerchant.id,
    businessName: 'Apex Retailers Inc.',
    apiKey: process.env.DEMO_API_KEY || "demo-key-not-secret",
    status: 'ACTIVE' as const,
    settlementCurrency: 'USD' as const,
    commissionRate: 0.025,
    accountBalance: 32450.00,
    totalRevenue: 184920.00,
    webhookUrl: 'https://api.apexretailers.com/webhooks/payments',
    riskThreshold: 70.0,
    createdAt: legacyMerchant.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const merchant2 = {
    id: 'mch_demo_2',
    userId: 'usr_merchant_cloud',
    businessName: 'Verdant Forest Goods',
    apiKey: process.env.DEMO_API_KEY || "demo-key-not-secret",
    status: 'ACTIVE' as const,
    settlementCurrency: 'USD' as const,
    commissionRate: 0.020,
    accountBalance: 16800.00,
    totalRevenue: 94200.00,
    webhookUrl: 'https://verdantgoods.io/api/v1/payments/hook',
    riskThreshold: 65.0,
    createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.data.merchants.push(merchant1, merchantLegacy, merchant2);

  // 4. Create Payment Methods
  const pm1 = {
    id: 'pm_demo_card_1',
    customerId: customer1.id,
    type: 'CREDIT_CARD' as const,
    provider: 'Visa Emerald',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2028,
    isDefault: true,
    createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
  };

  const pm2 = {
    id: 'pm_demo_card_2',
    customerId: customer1.id,
    type: 'CREDIT_CARD' as const,
    provider: 'MasterCard Forest',
    last4: '8888',
    expiryMonth: 8,
    expiryYear: 2027,
    isDefault: false,
    createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
  };

  const pm3 = {
    id: 'pm_demo_bank_1',
    customerId: customer1.id,
    type: 'BANK_TRANSFER' as const,
    provider: 'Evergreen National Bank',
    last4: '9012',
    isDefault: false,
    createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
  };

  store.data.payment_methods.push(pm1, pm2, pm3);

  // 5. Create Realistic Payments & Transactions
  const amounts = [120.50, 45.00, 899.99, 15.00, 249.00, 1250.00, 64.99, 310.00, 89.00, 14500.00, 32.50, 500.00];

  amounts.forEach((amount, i) => {
    const daysAgo = (amounts.length - i) * 2;
    const itemDate = new Date(now.getTime() - daysAgo * 86400000 - (i * 3600000)).toISOString();
    const isFailed = i === 4;
    const isHighRisk = i === 9;
    const isPending = i === 11;

    let status: any = 'SUCCESS';
    if (isFailed) status = 'FAILED';
    if (isPending) status = 'PROCESSING';

    const fee = Number((amount * 0.025).toFixed(2));
    const net = Number((amount - fee).toFixed(2));
    const paymentId = `pay_seed_${1000 + i}`;
    const txnId = `txn_seed_${2000 + i}`;
    const riskScore = isHighRisk ? 88.5 : isFailed ? 45.0 : Math.round(Math.random() * 20);
    const riskLevel = riskScore > 70 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';

    const payment = {
      id: paymentId,
      customerId: customer1.id,
      merchantId: i % 2 === 0 ? merchant1.id : merchant2.id,
      paymentMethodId: pm1.id,
      amount,
      feeAmount: fee,
      netAmount: net,
      currency: 'USD' as const,
      status,
      idempotencyKey: `idemp_seed_${uuidv4().substring(0, 12)}`,
      description: `Purchase order #${8000 + i} - ${i % 2 === 0 ? 'Apex Retail Goods' : 'Verdant Forest Supply'}`,
      clientIp: '192.168.1.105',
      failureReason: isFailed ? 'Card declined by simulated issuing bank (TEST_DECLINE_0000)' : undefined,
      retryCount: isFailed ? 2 : 0,
      riskScore,
      riskLevel,
      createdAt: itemDate,
      updatedAt: itemDate,
    };

    store.data.payments.push(payment);

    if (status !== 'PROCESSING') {
      const txn = {
        id: txnId,
        paymentId,
        customerId: customer1.id,
        merchantId: payment.merchantId,
        amount,
        currency: 'USD' as const,
        status,
        paymentMethodType: 'CREDIT_CARD' as const,
        referenceNumber: `REF-${20250000 + i}`,
        correlationId: `corr_seed_${uuidv4().substring(0, 8)}`,
        failureReason: payment.failureReason,
        createdAt: itemDate,
        updatedAt: itemDate,
      };
      store.data.transactions.push(txn);

      if (isHighRisk) {
        store.data.fraud_events.push({
          id: `frd_alert_${i}`,
          paymentId,
          transactionId: txnId,
          customerId: customer1.id,
          merchantId: payment.merchantId,
          riskScore,
          riskLevel: 'HIGH' as const,
          triggeredRules: ['TRANSACTION_AMOUNT_ABOVE_THRESHOLD', 'VELOCITY_SPIKE_DETECTED'],
          action: 'FLAGGED_FOR_REVIEW' as const,
          status: 'PENDING_REVIEW' as const,
          createdAt: itemDate,
          updatedAt: itemDate,
        });
      }
    }
  });

  // 6. Create Seed Refunds
  const refundTxn = store.data.transactions[2];
  if (refundTxn) {
    store.data.refunds.push({
      id: 'ref_seed_3001',
      transactionId: refundTxn.id,
      paymentId: refundTxn.paymentId,
      merchantId: refundTxn.merchantId,
      customerId: refundTxn.customerId,
      amount: refundTxn.amount,
      currency: 'USD' as const,
      reason: 'REQUESTED_BY_CUSTOMER' as const,
      status: 'COMPLETED' as const,
      correlationId: `corr_ref_${uuidv4().substring(0, 8)}`,
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    });
  }

  // 7. Create Seed Notifications
  store.data.notifications.push(
    {
      id: 'notif_seed_1',
      userId: customerUser.id,
      type: 'PAYMENT_SUCCESS' as const,
      title: 'Payment Confirmed',
      message: 'Your payment of $120.50 to Apex Retailers Inc. was completed successfully.',
      channel: 'IN_APP' as const,
      isRead: false,
      createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    },
    {
      id: 'notif_seed_2',
      userId: customerUser.id,
      type: 'REFUND_COMPLETED' as const,
      title: 'Refund Processed',
      message: 'A refund of $899.99 has been credited back to your balance.',
      channel: 'IN_APP' as const,
      isRead: true,
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: 'notif_seed_3',
      userId: merchantUser.id,
      type: 'PAYMENT_SUCCESS' as const,
      title: 'New Customer Payment Received',
      message: 'Received $1,250.00 from Alex Reynolds (Ref: REF-20250005).',
      channel: 'IN_APP' as const,
      isRead: false,
      createdAt: new Date(now.getTime() - 12 * 3600000).toISOString(),
    },
    {
      id: 'notif_seed_4',
      userId: adminUser.id,
      type: 'FRAUD_ALERT' as const,
      title: 'High Risk Transaction Flagged',
      message: 'Payment #pay_seed_1009 ($14,500.00) scored 88.5 risk rating. Review required.',
      channel: 'IN_APP' as const,
      isRead: false,
      createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    }
  );

  // 8. Create Seed Audit Logs
  store.data.audit_logs.push(
    {
      id: 'aud_seed_1',
      actorId: customerUser.id,
      actorEmail: customerUser.email,
      actorRole: 'CUSTOMER' as const,
      action: 'PAYMENT_CREATE',
      resource: 'Payment',
      resourceId: 'pay_seed_1000',
      correlationId: `corr_aud_1`,
      ipAddress: '192.168.1.105',
      status: 'SUCCESS' as const,
      createdAt: new Date(now.getTime() - 24 * 86400000).toISOString(),
    },
    {
      id: 'aud_seed_2',
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: 'ADMIN' as const,
      action: 'MERCHANT_STATUS_UPDATE',
      resource: 'Merchant',
      resourceId: merchant1.id,
      correlationId: `corr_aud_2`,
      ipAddress: '10.0.0.1',
      status: 'SUCCESS' as const,
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    }
  );

  // 9. Create Seed Settlements
  store.data.settlements.push(
    {
      id: 'stl_seed_1',
      merchantId: merchant1.id,
      amount: 45000.00,
      feeDeducted: 1125.00,
      netPayout: 43875.00,
      currency: 'USD' as const,
      status: 'PROCESSED' as const,
      payoutDate: new Date(now.getTime() - 7 * 86400000).toISOString(),
      transactionsCount: 38,
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: 'stl_seed_2',
      merchantId: merchant1.id,
      amount: 28400.00,
      feeDeducted: 710.00,
      netPayout: 27690.00,
      currency: 'USD' as const,
      status: 'PENDING' as const,
      payoutDate: new Date(now.getTime() + 3 * 86400000).toISOString(),
      transactionsCount: 22,
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    }
  );

  store.save();
  logger.info('Database seeded successfully with updated PayFlow demo accounts.');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
  });
}
