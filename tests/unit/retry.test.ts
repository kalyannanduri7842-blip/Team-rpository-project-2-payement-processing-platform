<<<<<<< HEAD
import { executeWithRetry } from '../../packages/shared-utils/src/retry';

describe('executeWithRetry', () => {
  it('should return result if action succeeds on first attempt', async () => {
    const action = jest.fn().mockResolvedValue('success');
    const result = await executeWithRetry(action);
    expect(result).toBe('success');
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure up to maxAttempts', async () => {
    const action = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success on 3');

    const result = await executeWithRetry(action, {
      maxAttempts: 3,
      baseDelayMs: 1,
      jitter: false,
    });

    expect(result).toBe('success on 3');
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('should throw error when maxAttempts are exceeded', async () => {
    const action = jest.fn().mockRejectedValue(new Error('persistent failure'));

    await expect(
      executeWithRetry(action, {
        maxAttempts: 2,
        baseDelayMs: 1,
        jitter: false,
      })
    ).rejects.toThrow('persistent failure');

    expect(action).toHaveBeenCalledTimes(2);
  });

  it('should respect shouldRetry predicate', async () => {
    const action = jest.fn().mockRejectedValue(new Error('fatal error'));
    const shouldRetry = jest.fn().mockReturnValue(false);

    await expect(
      executeWithRetry(action, {
        maxAttempts: 3,
        baseDelayMs: 1,
        shouldRetry,
      })
    ).rejects.toThrow('fatal error');

    expect(action).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledTimes(1);
  });
});

=======
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
>>>>>>> 6b956bfd2927a766126b9b48a4106bc277321d74
