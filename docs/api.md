# Distributed Payment Processing Platform - API Reference

Base URL: `http://localhost:4000`

All protected requests require header: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
All payment mutations support header: `Idempotency-Key: <UUID_STRING>`

## Authentication Endpoints (`/api/auth`)

- `POST /api/auth/register` - Create customer or merchant account.
- `POST /api/auth/login` - Authenticate with email & password, returns JWT tokens and profile.
- `POST /api/auth/refresh` - Rotate access token with refresh token.
- `GET /api/auth/me` - Retrieve authenticated user context.

## Payment Endpoints (`/api/payments`)

- `POST /api/payments` - Process new payment with Idempotency Key and risk evaluation.
- `GET /api/payments` - List payments with customer/merchant filtering.
- `GET /api/payments/:id` - Fetch single payment detail.
- `GET /api/payments/stats` - Fetch overall success, pending, failed counts and volume.
- `GET /api/payments/methods/:customerId` - Retrieve saved payment methods.

## Transaction Endpoints (`/api/transactions`)

- `GET /api/transactions` - Filter and search immutable ledger entries.
- `GET /api/transactions/:id` - Single transaction detail.
- `GET /api/transactions/:id/receipt` - Official receipt invoice payload.

## Merchant Endpoints (`/api/merchants`)

- `GET /api/merchants` - List active merchants.
- `GET /api/merchants/:id` - Merchant profile, balance, and revenue.
- `PUT /api/merchants/:id` - Update webhook URL or risk threshold.
- `GET /api/merchants/:merchantId/settlements` - List settlement payouts.
- `POST /api/merchants/:merchantId/settlements/trigger` - Request instant settlement payout.

## Refund Endpoints (`/api/refunds`)

- `POST /api/refunds` - Initiate partial or full refund on successful transaction.
- `GET /api/refunds` - List refund records.
- `PUT /api/refunds/:id/status` - Approve or reject refund.

## Fraud & Risk Endpoints (`/api/fraud`)

- `POST /api/fraud/evaluate` - Academic risk scoring (0-100).
- `GET /api/fraud/alerts` - List pending and resolved fraud alerts.
- `PUT /api/fraud/alerts/:id/resolve` - Admin resolution (Approve or Block).

## Monitoring & SRE Endpoints (`/api/monitoring`)

- `GET /api/monitoring/services` - Telemetry for all 10 microservices (latency, CPU, memory).
- `GET /api/monitoring/queues` - Event bus queue rates and active jobs.
- `GET /api/monitoring/dlq` - Dead-letter queue message inspection.
- `POST /api/monitoring/dlq/:id/replay` - Re-enqueue dead-lettered job.
- `GET /api/monitoring/logs` - Live log stream.
- `GET /api/monitoring/chaos` - Active fault injection configurations.
- `POST /api/monitoring/chaos` - Inject latency or simulate service crash.
- `POST /api/monitoring/chaos/reset` - Clear all chaos simulations.
