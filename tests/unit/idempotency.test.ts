import { IdempotencyManager } from '../../packages/shared-utils/src/idempotency';

describe('IdempotencyManager', () => {
  let manager: IdempotencyManager;

  beforeEach(() => {
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
    expect(duplicate.success).toBe(false);
    expect(duplicate.existing?.state).toBe('PENDING');
  });

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
