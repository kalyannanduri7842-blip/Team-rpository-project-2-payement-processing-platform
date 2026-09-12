<<<<<<< HEAD
import { IdempotencyManager } from '../../packages/shared-utils/src/idempotency';
=======
import { IdempotencyManager } from '@payment-system/shared-utils';
>>>>>>> 6b956bfd2927a766126b9b48a4106bc277321d74

describe('IdempotencyManager', () => {
  let manager: IdempotencyManager;

  beforeEach(() => {
<<<<<<< HEAD
    manager = new IdempotencyManager(1000);
  });

  afterEach(() => {
    manager.clear();
  });

  it('should reserve a key successfully', () => {
    const res = manager.reserve('idem-key-1');
    expect(res.success).toBe(true);
    expect(res.existing).toBeUndefined();
  });

  it('should prevent duplicate key reservation', () => {
    manager.reserve('idem-key-1');
    const duplicate = manager.reserve('idem-key-1');
=======
    manager = new IdempotencyManager(5000);
  });

  test('should successfully reserve a new unique idempotency key', () => {
    const res = manager.reserve('key_test_1');
    expect(res.success).toBe(true);
    expect(manager.get('key_test_1')?.state).toBe('PENDING');
  });

  test('should reject duplicate reservation with existing record', () => {
    manager.reserve('key_test_2');
    const duplicate = manager.reserve('key_test_2');
>>>>>>> 6b956bfd2927a766126b9b48a4106bc277321d74
    expect(duplicate.success).toBe(false);
    expect(duplicate.existing?.state).toBe('PENDING');
  });

<<<<<<< HEAD
  it('should complete an idempotency record with response', () => {
    manager.reserve('idem-key-2');
    manager.complete('idem-key-2', 200, { paymentId: 'pay_123' });

    const record = manager.get('idem-key-2');
    expect(record?.state).toBe('COMPLETED');
    expect(record?.statusCode).toBe(200);
    expect(record?.response).toEqual({ paymentId: 'pay_123' });
  });

  it('should fail an idempotency record with error string', () => {
    manager.reserve('idem-key-3');
    manager.fail('idem-key-3', 'Insufficient funds');

    const record = manager.get('idem-key-3');
    expect(record?.state).toBe('FAILED');
    expect(record?.error).toBe('Insufficient funds');
  });
});

=======
  test('should store and retrieve completed response', () => {
    manager.reserve('key_test_3');
    manager.complete('key_test_3', 200, { transactionId: 'txn_999' });

    const duplicate = manager.reserve('key_test_3');
    expect(duplicate.success).toBe(false);
    expect(duplicate.existing?.state).toBe('COMPLETED');
    expect(duplicate.existing?.response).toEqual({ transactionId: 'txn_999' });
    expect(duplicate.existing?.statusCode).toBe(200);
  });
});
>>>>>>> 6b956bfd2927a766126b9b48a4106bc277321d74
