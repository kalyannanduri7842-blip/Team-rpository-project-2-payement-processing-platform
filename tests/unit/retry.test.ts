import { executeWithRetry } from '@payment-system/shared-utils';

describe('Exponential Backoff RetryPolicy', () => {
  test('should return immediately on successful first attempt', async () => {
    let callCount = 0;
    const result = await executeWithRetry(async attempt => {
      callCount++;
      return `attempt_${attempt}`;
    }, { maxAttempts: 3, baseDelayMs: 10 });

    expect(result).toBe('attempt_1');
    expect(callCount).toBe(1);
  });

  test('should retry until success on transient failures', async () => {
    let callCount = 0;
    const result = await executeWithRetry(async attempt => {
      callCount++;
      if (attempt < 3) throw new Error('Transient connection error');
      return 'recovered';
    }, { maxAttempts: 4, baseDelayMs: 10 });

    expect(result).toBe('recovered');
    expect(callCount).toBe(3);
  });

  test('should throw error after exhausting max retry attempts', async () => {
    let callCount = 0;
    await expect(
      executeWithRetry(async () => {
        callCount++;
        throw new Error('Persistent failure');
      }, { maxAttempts: 3, baseDelayMs: 10 })
    ).rejects.toThrow('Persistent failure');

    expect(callCount).toBe(3);
  });
});
