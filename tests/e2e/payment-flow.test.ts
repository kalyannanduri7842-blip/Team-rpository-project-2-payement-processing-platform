import { CircuitBreaker } from '../../packages/shared-utils/src/circuit-breaker';
import { DistributedEventBroker } from '../../packages/shared-utils/src/event-bus';
import { IdempotencyManager } from '../../packages/shared-utils/src/idempotency';

describe('Payment Processing System E2E Workflow', () => {
  let circuitBreaker: CircuitBreaker;
  let eventBroker: DistributedEventBroker;
  let idempotencyManager: IdempotencyManager;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({ name: 'payment-gateway' });
    eventBroker = new DistributedEventBroker();
    idempotencyManager = new IdempotencyManager();
  });

  afterEach(() => {
    eventBroker.clear();
    idempotencyManager.clear();
  });

  it('should process payment end-to-end with idempotency and event distribution', async () => {
    const idempotencyKey = 'idem-pay-1001';
    const reserveResult = idempotencyManager.reserve(idempotencyKey);
    expect(reserveResult.success).toBe(true);

    const paymentProcessedHandler = jest.fn();
    eventBroker.subscribe('PAYMENT_COMPLETED', paymentProcessedHandler);

    const paymentResult = await circuitBreaker.execute(async () => {
      const transactionId = 'txn_888999';
      await eventBroker.publish(
        'PAYMENT_COMPLETED',
        { transactionId, amount: 25000, currency: 'USD' },
        'payment-service'
      );
      return { status: 'SUCCESS', transactionId };
    });

    expect(paymentResult.status).toBe('SUCCESS');
    expect(paymentProcessedHandler).toHaveBeenCalled();

    idempotencyManager.complete(idempotencyKey, 200, paymentResult);
    const finalRecord = idempotencyManager.get(idempotencyKey);
    expect(finalRecord?.state).toBe('COMPLETED');
  });
});
