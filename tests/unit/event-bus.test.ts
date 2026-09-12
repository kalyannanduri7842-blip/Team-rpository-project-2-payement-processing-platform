import { DistributedEventBroker } from '../../packages/shared-utils/src/event-bus';

describe('DistributedEventBroker', () => {
  let broker: DistributedEventBroker;

  beforeEach(() => {
    broker = new DistributedEventBroker(1); // Set maxRetries to 1 for quick dead letter queue test
  });

  afterEach(() => {
    broker.clear();
  });

  it('should publish and receive events', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    broker.subscribe('PAYMENT_CREATED', handler);

    const payload = { amount: 100, currency: 'USD' };
    const event = await broker.publish('PAYMENT_CREATED', payload, 'payment-service');

    expect(event.eventType).toBe('PAYMENT_CREATED');
    expect(event.payload).toEqual(payload);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should process events and update metrics', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    broker.subscribe('PAYMENT_FAILED', handler);

    await broker.publish('PAYMENT_FAILED', { orderId: '123' }, 'payment-service');

    const metrics = broker.getMetrics();
    expect(metrics.completedJobs).toBeGreaterThanOrEqual(1);
  });
});

