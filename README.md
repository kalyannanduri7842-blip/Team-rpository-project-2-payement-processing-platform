# Distributed Payment Processing System

An enterprise-grade, distributed payment processing and financial settlement platform built for modern high-volume transactions with event-driven architecture, distributed fault-tolerance (Idempotency, Circuit Breakers, Retries with Exponential Backoff, Dead-Letter Queues), dual-mode persistence (PostgreSQL + embedded zero-config SQL driver), and a modern React + TypeScript + Vite + Tailwind CSS web application featuring dedicated role-based dashboards.

---

## 🚀 Live Demo Accounts

All demo accounts use the standard development password: **`Password123!`**  
*(You can also use the **1-Click Quick Demo Sign-in buttons** on the login page or top navigation bar).*

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Customer** | `customer@demo.com` | `Password123!` | Make payments, manage payment methods, download receipts, request refunds |
| **Merchant** | `merchant@demo.com` | `Password123!` | Live revenue telemetry, transaction feeds, payment links, settlement payouts |
| **Administrator** | `admin@demo.com` | `Password123!` | System KPIs, user directory, merchant oversight, global ledger, fraud review |
| **Operations / SRE** | `operations@demo.com` | `Password123!` | Live cluster topology map, node health (10), DLQ inspector, chaos simulator |

---

## 🌐 Quickstart (Run on Localhost)

The application has zero mandatory external dependencies and runs immediately out of the box with embedded data persistence and automated realistic seed data:

```bash
# 1. Install all dependencies
npm install

# 2. Start the complete system (10 Backend Microservices + React Web App)
npm run dev
```

- 🖥️ **Web Application UI**: [http://localhost:5173](http://localhost:5173)
- 🌐 **Central API Gateway**: [http://localhost:4000](http://localhost:4000)

---

## 🏗️ Distributed System Architecture

```
                                  [ CLIENT / REACT SPA ]
                                      (:5173 / :80)
                                            │
                                            ▼
                                   [ API GATEWAY ]
                                       (:4000)
              ┌─────────────────────────────┼─────────────────────────────┐
              ▼                             ▼                             ▼
      [ AUTH SERVICE ]              [ PAYMENT SERVICE ]           [ TRANSACTION SERVICE ]
          (:4001)                       (:4002)                       (:4003)
                                            │
                                            ▼
                               [ DISTRIBUTED EVENT BROKER ]
                                  (Worker Queue & DLQ)
              ┌─────────────────────────────┼─────────────────────────────┐
              ▼                             ▼                             ▼
      [ FRAUD / RISK ]              [ REFUND SERVICE ]            [ NOTIFICATION SVC ]
          (:4006)                       (:4005)                       (:4007)
              │                             │                             │
              └─────────────────────────────┼─────────────────────────────┘
                                            ▼
                                  [ REPORTING SERVICE ]
                                        (:4008)
                                            │
                                  [ MONITORING / OPS ]
                                        (:4009)
```

### 10 Distributed Microservices

1. **`api-gateway` (Port 4000)**: Central ingress proxy, JWT validation, correlation ID injection (`X-Correlation-ID`), rate limiting, circuit breaker protection.
2. **`auth-service` (Port 4001)**: User registration, JWT access/refresh token rotation, bcrypt hashing, RBAC.
3. **`payment-service` (Port 4002)**: Payment state machine (`CREATED` -> `PROCESSING` -> `SUCCESS`/`FAILED`), idempotency cache manager, card authorization simulation, event dispatch.
4. **`transaction-service` (Port 4003)**: Immutable double-entry ledger, receipt invoice generator, advanced search and pagination.
5. **`merchant-service` (Port 4004)**: Merchant onboarding, live API keys, commission schedules, automated settlement payouts.
6. **`refund-service` (Port 4005)**: Full & partial refund validation, balance reversal, merchant approval workflows.
7. **`fraud-service` (Port 4006)**: Simulated academic risk engine (scores 0-100), velocity detection, rule-based anomaly flagging.
8. **`notification-service` (Port 4007)**: Event subscriber for `PaymentSucceeded`, `PaymentFailed`, `RefundCompleted`, and `FraudAlert`.
9. **`reporting-service` (Port 4008)**: Financial analytics aggregation, daily revenue trends, CSV export downloads.
10. **`monitoring-service` (Port 4009)**: Microservices telemetry (CPU, Memory, Latency, Uptime), Dead-Letter Queue inspector, Chaos fault injector.

---

## 🛡️ Distributed Systems Concepts Implemented

- **Idempotency Protection**: Enforces unique `Idempotency-Key` headers to guarantee zero double-charges during client network retries.
- **Circuit Breaker Pattern**: 3-state circuit breaker (`CLOSED`, `OPEN`, `HALF_OPEN`) with fast-failure to prevent cascading service outages.
- **Event-Driven Pub/Sub**: Asynchronous event decoupling via message queues for notifications, fraud alerts, and reporting.
- **Dead-Letter Queue (DLQ)**: Poison-pill and failed consumer messages route to the DLQ with 1-click manual re-queue capability.
- **Distributed Request Tracing**: Propagation of `X-Correlation-ID` across Gateway, Services, Event Bus, and Database Logs.
- **Chaos Engineering Studio**: Live UI controls in the Operations Portal to inject synthetic latency (100ms - 3000ms), force-trip circuit breakers, and simulate 503 service crashes.

---

## 🧪 Automated Testing

```bash
# Run all unit and integration tests (Jest)
npm test

# Run distributed systems chaos verification suite
npm run chaos:test
```

---

## 🐳 Docker Compose Execution

```bash
docker compose up --build
```
Spins up PostgreSQL 16, Redis 7, RabbitMQ 3, the Microservices Cluster, and the React Web Application.

---

## 📚 Technical Documentation

- 📐 [Architecture Reference](docs/architecture.md)
- 🔌 [API Documentation](docs/api.md)
- 🗄️ [Database Schema](docs/database.md)
- ⚙️ [Distributed Systems Design](docs/distributed-system.md)
- 🧪 [Testing & Chaos Guide](docs/testing.md)
- 🚀 [Deployment & Docker Guide](docs/deployment.md)
