import { CircuitBreaker, CircuitState } from '../../packages/shared-utils/src/circuit-breaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeoutMs: 100,
      name: 'test-breaker',
    });
  });

  it('should initialize in CLOSED state', () => {
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should execute action successfully in CLOSED state', async () => {
    const result = await breaker.execute(async () => 'ok');
    expect(result).toBe('ok');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });

  it('should trip to OPEN state after hitting failure threshold', async () => {
    await expect(breaker.execute(async () => { throw new Error('fail 1'); })).rejects.toThrow('fail 1');
    expect(breaker.getState()).toBe(CircuitState.CLOSED);

    await expect(breaker.execute(async () => { throw new Error('fail 2'); })).rejects.toThrow('fail 2');
    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });

  it('should throw fast-fail error when state is OPEN', async () => {
    breaker.trip();
    expect(breaker.getState()).toBe(CircuitState.OPEN);

    await expect(breaker.execute(async () => 'ok')).rejects.toThrow(/Circuit is OPEN/);
  });

  it('should execute fallback if provided when OPEN', async () => {
    breaker.trip();
    const fallback = jest.fn().mockResolvedValue('fallback-value');
    const result = await breaker.execute(async () => 'ok', fallback);
    expect(result).toBe('fallback-value');
    expect(fallback).toHaveBeenCalled();
  });

  it('should reset to CLOSED state when reset() is called', () => {
    breaker.trip();
    expect(breaker.getState()).toBe(CircuitState.OPEN);
    breaker.reset();
    expect(breaker.getState()).toBe(CircuitState.CLOSED);
  });
});
