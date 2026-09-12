import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { TransactionController } from './controller';

const logger = createLogger('transaction-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Transaction Routes
app.get('/api/transactions', TransactionController.getTransactions);
app.get('/api/transactions/:id', TransactionController.getTransactionById);
app.get('/api/transactions/:id/receipt', TransactionController.getReceipt);

app.get('/health', (req, res) => {
  res.json({ service: 'transaction-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['transaction-service'];
  app.listen(port, () => {
    logger.info(`📊 Transaction Service running on port ${port}`);
  });
}
