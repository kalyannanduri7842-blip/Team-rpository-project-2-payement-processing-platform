import request from 'supertest';
import { app as paymentApp } from '../../apps/payment-service/src/index';
import { seedDatabase, CustomerRepository, MerchantRepository } from '@payment-system/database';

describe('Payment Service Integration Flow', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  test('POST /api/payments - should successfully process a payment and update balances', async () => {
    const merchants = await MerchantRepository.list();
    const customers = await CustomerRepository.list();

    const merchant = merchants[0];
    const customer = customers[0];
    const initialCustomerBal = customer.balance;
    const initialMerchantRev = merchant.totalRevenue;

    const payload = {
      merchantId: merchant.id,
      amount: 100.00,
      currency: 'USD',
      paymentMethodType: 'CREDIT_CARD',
      paymentMethodDetails: {
        cardNumber: '4242424242424242',
        cardExpiry: '12/28',
        cardCvc: '123',
      },
      description: 'Test Integration Payment',
    };

    const res = await request(paymentApp)
      .post('/api/payments')
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.payment.status).toBe('SUCCESS');
    expect(res.body.data.payment.amount).toBe(100.00);
    expect(res.body.data.transaction).toBeDefined();

    // Verify balances
    const updatedCustomer = await CustomerRepository.findById(customer.id);
    const updatedMerchant = await MerchantRepository.findById(merchant.id);

    expect(updatedCustomer?.balance).toBe(initialCustomerBal - 100);
    expect(updatedMerchant?.totalRevenue).toBe(initialMerchantRev + 100);
  });

  test('POST /api/payments - should decline payment when card ends in 0000', async () => {
    const merchants = await MerchantRepository.list();
    const merchant = merchants[0];

    const payload = {
      merchantId: merchant.id,
      amount: 50.00,
      currency: 'USD',
      paymentMethodType: 'CREDIT_CARD',
      paymentMethodDetails: {
        cardNumber: '4000000000000000',
      },
    };

    const res = await request(paymentApp)
      .post('/api/payments')
      .send(payload)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.data.payment.status).toBe('FAILED');
    expect(res.body.data.payment.failureReason).toContain('TEST_DECLINE_0000');
  });
});
