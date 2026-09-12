# Relational Database Schema & Persistence Layer

The platform features a dual-engine architecture:
1. **Production Mode**: PostgreSQL with connection pooling and relational indexing.
2. **Local Zero-Config Mode**: High-performance JSON/SQL dual driver with automated file persistence and seed data, allowing immediate execution without external database installation.

## Entity Model

- **`users`**: Platform credentials, bcrypt password hashes, roles (`CUSTOMER`, `MERCHANT`, `ADMIN`, `OPERATIONS`).
- **`customers`**: Customer profiles, wallet balances, currency, and default billing address.
- **`merchants`**: Store names, live API keys, commission rates, account balances, total revenues, webhook endpoints, and academic risk thresholds.
- **`payment_methods`**: Tokenized cards and linked bank accounts (PCI-DSS compliant simulated tokens).
- **`payments`**: Payment state machine records, idempotency keys, fee amounts, net amounts, and risk scores.
- **`transactions`**: Immutable double-entry financial ledger entries with reference numbers and correlation IDs.
- **`refunds`**: Full and partial customer refund records with status tracking.
- **`fraud_events`**: Risk engine heuristic evaluations, scores 0-100, and admin resolution states.
- **`notifications`**: In-app push notifications with unread indicators.
- **`audit_logs`**: Tamper-evident security audit trail.
- **`settlements`**: Merchant payout batches and automated daily clearing.
