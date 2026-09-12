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
    try { await cb.execute(async () => { throw new Error('Failure 1'); }); } catch {}
    expect(cb.getState()).toBe(CircuitState.CLOSED);
    try { await cb.execute(async () => { throw new Error('Failure 2'); }); } catch {}
    expect(cb.getState()).toBe(CircuitState.OPEN);
    await expect(cb.execute(async () => 'fast fail')).rejects.toThrow('Circuit is OPEN');
  });

  test('should execute fallback when circuit is OPEN', async () => {
    cb.trip();
    const fallbackResult = await cb.execute(async () => 'primary', () => 'fallback_response');
    expect(fallbackResult).toBe('fallback_response');
  });

  test('should transition from OPEN to HALF_OPEN after timeout', async () => {
    cb.trip();
    await new Promise(r => setTimeout(r, 120));
    expect(cb.getState()).toBe(CircuitState.HALF_OPEN);
  });
});
