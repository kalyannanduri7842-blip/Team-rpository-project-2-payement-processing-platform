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

