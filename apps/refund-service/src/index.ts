import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { RefundController } from './controller';

const logger = createLogger('refund-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Refund Routes
app.post('/api/refunds', RefundController.createRefund);
app.get('/api/refunds', RefundController.getRefunds);
app.get('/api/refunds/:id', RefundController.getRefundById);
app.put('/api/refunds/:id/status', RefundController.updateStatus);

app.get('/health', (req, res) => {
  res.json({ service: 'refund-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['refund-service'];
  app.listen(port, () => {
    logger.info(`💸 Refund Service running on port ${port}`);
  });
}
