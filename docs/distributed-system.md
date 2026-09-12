# Distributed Systems Design & Fault-Tolerance Mechanisms

## 1. Idempotency Pattern
When network failures or client retries occur during payment processing, duplicate requests might be sent.
- The `PaymentService` enforces unique `Idempotency-Key` headers.
- **Reservation Phase**: When a key arrives, it is reserved atomically in state `PENDING`. Concurrent identical requests receive HTTP `409 Conflict`.
- **Completion Phase**: Once processed, the exact HTTP status code and response payload are stored in the idempotency cache.
- **Replay**: Any subsequent request with the same key immediately returns the cached response with zero double-charging or repeated ledger mutations.

## 2. Circuit Breaker Pattern
Downstream service calls are protected by a 3-state Circuit Breaker (`CLOSED`, `OPEN`, `HALF_OPEN`):
- **Closed**: Requests pass through normally. Consecutive errors are incremented.
- **Open**: After exceeding the `failureThreshold` (default: 5), the circuit trips to `OPEN`. Subsequent requests fast-fail with HTTP `503 Service Unavailable` without exhausting thread pools.
- **Half-Open**: After `resetTimeoutMs` (default: 10s), probe requests test downstream health before closing the breaker.

## 3. Distributed Event Bus & Dead-Letter Queue (DLQ)
- Decoupled asynchronous event broadcasting using Pub/Sub (`PaymentSucceeded`, `PaymentFailed`, `RefundCompleted`).
- Worker queue processes background notifications and financial aggregations with exponential backoff and jitter.
- Poison-pill or permanently failing messages route to the **Dead-Letter Queue (DLQ)** after 3 attempts.
- The Operations Console provides single-click **DLQ Replay** to re-enqueue messages after bug fixes.

## 4. Distributed Tracing & Correlation IDs
- `X-Correlation-ID` headers are generated at the Ingress Gateway and propagated through every downstream microservice, event payload, and structured log line.
- Enables single-query end-to-end transaction tracing in the Operations Log Stream.

## 5. Chaos Engineering Studio
- Built-in live fault injection simulator to dynamically inject latency (100ms - 3000ms), force-trip circuit breakers, or crash specific microservices to test failover behavior in real time.
