import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { MerchantController } from './controller';

const logger = createLogger('merchant-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Merchant Routes
app.get('/api/merchants', MerchantController.getMerchants);
app.get('/api/merchants/:id', MerchantController.getMerchantById);
app.put('/api/merchants/:id', MerchantController.updateMerchant);
app.get('/api/merchants/:merchantId/settlements', MerchantController.getSettlements);
app.post('/api/merchants/:merchantId/settlements/trigger', MerchantController.triggerSettlement);

app.get('/health', (req, res) => {
  res.json({ service: 'merchant-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['merchant-service'];
  app.listen(port, () => {
    logger.info(`🏪 Merchant Service running on port ${port}`);
  });
}
