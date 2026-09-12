# Testing & Chaos Engineering Guide

## Running Automated Tests

```bash
# Run all unit and integration test suites
npm test

# Run chaos engineering automated verification suite
npm run chaos:test
```

## Test Suites Included

1. **Unit Tests**:
   - `circuit-breaker.test.ts`: Closed -> Open -> Half-Open state transitions, fast failure, and fallback executions.
   - `idempotency.test.ts`: Atomic reservation, duplicate key detection, response caching, and replays.
   - `retry.test.ts`: Exponential backoff with jitter and max attempt exhaustion.
2. **Integration Tests**:
   - `payment-flow.test.ts`: Complete payment lifecycle, balance deduction, transaction generation, and decline simulation.
3. **Chaos & Distributed Systems Simulator**:
   - `scripts/chaos-test.ts`: Verifies real-time resilience, DLQ message routing, and idempotency protection.
