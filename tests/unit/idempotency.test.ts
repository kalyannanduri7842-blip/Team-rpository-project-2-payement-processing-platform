import { IdempotencyManager } from '@payment-system/shared-utils';

describe('IdempotencyManager', () => {
  let manager: IdempotencyManager;

  beforeEach(() => {
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
    expect(duplicate.success).toBe(false);
    expect(duplicate.existing?.state).toBe('PENDING');
  });

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
