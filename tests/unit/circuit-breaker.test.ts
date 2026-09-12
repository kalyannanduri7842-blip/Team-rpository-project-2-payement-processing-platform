<<<<<<< HEAD
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

=======
import { CircuitBreaker, CircuitState } from '@payment-system/shared-utils';

describe('CircuitBreaker Pattern', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker({
      name: 'unit-test-circuit',
      failureThreshold: 2,
      resetTimeoutMs: 100,
      timeoutMs: 200,
    });
  });

  test('should start in CLOSED state and execute successful actions', async () => {
    expect(cb.getState()).toBe(CircuitState.CLOSED);

    const result = await cb.execute(async () => 'success_payload');
    expect(result).toBe('success_payload');
    expect(cb.getState()).toBe(CircuitState.CLOSED);
  });

  test('should trip to OPEN state after reaching failure threshold', async () => {
    // Failure 1
    try {
      await cb.execute(async () => {
        throw new Error('Failure 1');
      });
    } catch (e) {}
    expect(cb.getState()).toBe(CircuitState.CLOSED);

    // Failure 2 (Threshold reached)
    try {
      await cb.execute(async () => {
        throw new Error('Failure 2');
      });
    } catch (e) {}
    expect(cb.getState()).toBe(CircuitState.OPEN);

    // Subsequent calls fast-fail immediately
    await expect(cb.execute(async () => 'fast fail')).rejects.toThrow('Circuit is OPEN');
  });

  test('should execute fallback when circuit is OPEN', async () => {
    cb.trip();
    expect(cb.getState()).toBe(CircuitState.OPEN);

    const fallbackResult = await cb.execute(
      async () => 'primary',
      () => 'fallback_response'
    );
    expect(fallbackResult).toBe('fallback_response');
  });

  test('should transition from OPEN to HALF_OPEN after timeout', async () => {
    cb.trip();
    expect(cb.getState()).toBe(CircuitState.OPEN);

    await new Promise(r => setTimeout(r, 120));
    expect(cb.getState()).toBe(CircuitState.HALF_OPEN);
  });
});
>>>>>>> 6b956bfd2927a766126b9b48a4106bc277321d74
