import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { PaymentController } from './controller';

const logger = createLogger('payment-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Payment Routes
app.post('/api/payments', PaymentController.createPayment);
app.get('/api/payments', PaymentController.getPayments);
app.get('/api/payments/stats', PaymentController.getStats);
app.get('/api/payments/methods/:customerId', PaymentController.getPaymentMethods);
app.get('/api/payments/:id', PaymentController.getPaymentById);

app.get('/health', (req, res) => {
  res.json({ service: 'payment-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['payment-service'];
  app.listen(port, () => {
    logger.info(`💳 Payment Service running on port ${port}`);
  });
}
