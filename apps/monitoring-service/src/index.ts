import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { MonitoringController } from './controller';

const logger = createLogger('monitoring-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Monitoring Routes
app.get('/api/monitoring/services', MonitoringController.getServicesHealth);
app.get('/api/monitoring/queues', MonitoringController.getQueueMetrics);
app.get('/api/monitoring/dlq', MonitoringController.getDeadLetterQueue);
app.post('/api/monitoring/dlq/:id/replay', MonitoringController.replayDeadLetterJob);
app.get('/api/monitoring/logs', MonitoringController.getLogs);
app.get('/api/monitoring/audit-logs', MonitoringController.getAuditLogs);
app.get('/api/monitoring/chaos', MonitoringController.getChaosConfigs);
app.post('/api/monitoring/chaos', MonitoringController.setChaosConfig);
app.post('/api/monitoring/chaos/reset', MonitoringController.resetChaos);

app.get('/health', (req, res) => {
  res.json({ service: 'monitoring-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['monitoring-service'];
  app.listen(port, () => {
    logger.info(`📡 Monitoring & Operations Service running on port ${port}`);
  });
}
