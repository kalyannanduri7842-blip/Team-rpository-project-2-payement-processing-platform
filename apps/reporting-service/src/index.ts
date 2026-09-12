import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { ReportingController } from './controller';

const logger = createLogger('reporting-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Reporting Routes
app.get('/api/reports/summary', ReportingController.getSummary);
app.get('/api/reports/revenue-trends', ReportingController.getRevenueTrends);
app.get('/api/reports/export/transactions', ReportingController.exportTransactionsCsv);

app.get('/health', (req, res) => {
  res.json({ service: 'reporting-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['reporting-service'];
  app.listen(port, () => {
    logger.info(`📈 Reporting Service running on port ${port}`);
  });
}
