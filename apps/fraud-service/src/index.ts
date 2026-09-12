import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { FraudController } from './controller';

const logger = createLogger('fraud-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Fraud Routes
app.post('/api/fraud/evaluate', FraudController.evaluate);
app.get('/api/fraud/alerts', FraudController.getAlerts);
app.put('/api/fraud/alerts/:id/resolve', FraudController.resolveAlert);

app.get('/health', (req, res) => {
  res.json({ service: 'fraud-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['fraud-service'];
  app.listen(port, () => {
    logger.info(`🛡️ Fraud & Risk Service running on port ${port}`);
  });
}
