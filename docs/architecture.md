# Distributed Payment Processing System - Architecture

## System Overview

The **Distributed Payment Processing System** is designed with a decentralized, event-driven microservices architecture built with TypeScript, Node.js, Express, React, Vite, and Tailwind CSS.

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

## Microservices Breakdown

| Service | Port | Primary Responsibility |
|---|---|---|
| **API Gateway** | `4000` | Ingress routing, JWT token validation, `X-Correlation-ID` propagation, Circuit Breakers |
| **Auth Service** | `4001` | User registration, JWT access/refresh token rotation, bcrypt password hashing, RBAC |
| **Payment Service** | `4002` | State machine orchestration, atomic idempotency caching, card simulation, event publication |
| **Transaction Service** | `4003` | Immutable double-entry ledger, searchable history, receipt invoice generation |
| **Merchant Service** | `4004` | Merchant profiles, business onboarding, fee schedules, settlement clearing |
| **Refund Service** | `4005` | Partial & full refund validation, customer reversals, balance restoration |
| **Fraud & Risk Service** | `4006` | Simulated academic risk scoring (0-100), velocity detection, rule triggers |
| **Notification Service** | `4007` | Event subscriber for `PaymentSucceeded`, `PaymentFailed`, `RefundCompleted` |
| **Reporting Service** | `4008` | Revenue trend aggregation, platform commission calculations, CSV export |
| **Monitoring & SRE Service** | `4009` | Node telemetry (CPU, Memory, Latency), DLQ message inspector & replay, Chaos injection engine |
