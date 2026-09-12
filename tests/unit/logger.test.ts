import { createLogger, getSystemLogs } from '../../packages/shared-utils/src/logger';
import { ServiceName } from '@payment-system/shared-types';

describe('Logger', () => {
  it('should create log entries and record in system logs', () => {
    const logger = createLogger('payment-service');
    const spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    logger.info('Test log message', 'corr-123', { foo: 'bar' });

    const logs = getSystemLogs(10, 'payment-service' as ServiceName);
    expect(logs.length).toBeGreaterThan(0);
    const lastLog = logs[0];
    expect(lastLog.message).toBe('Test log message');
    expect(lastLog.correlationId).toBe('corr-123');

    spyLog.mockRestore();
  });

  it('should handle error log entries', () => {
    const logger = createLogger('payment-service');
    const spyError = jest.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Payment processing failed', new Error('Gateway timeout'), 'corr-999');

    const logs = getSystemLogs(10, 'payment-service' as ServiceName, 'ERROR');
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].message).toBe('Payment processing failed');

    spyError.mockRestore();
  });
});

