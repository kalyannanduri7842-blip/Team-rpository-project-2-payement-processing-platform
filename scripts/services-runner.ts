import { seedDatabase } from '@payment-system/database';
import { createLogger } from '@payment-system/shared-utils';
import { SERVICE_PORTS } from '@payment-system/shared-config';

// Import all service express apps
import { app as gatewayApp } from '../apps/api-gateway/src/index';
import { app as authApp } from '../apps/auth-service/src/index';
import { app as paymentApp } from '../apps/payment-service/src/index';
import { app as transactionApp } from '../apps/transaction-service/src/index';
import { app as merchantApp } from '../apps/merchant-service/src/index';
import { app as refundApp } from '../apps/refund-service/src/index';
import { app as fraudApp } from '../apps/fraud-service/src/index';
import { app as notificationApp } from '../apps/notification-service/src/index';
import { app as reportingApp } from '../apps/reporting-service/src/index';
import { app as monitoringApp } from '../apps/monitoring-service/src/index';

const logger = createLogger('system');

export async function startAllServices() {
  logger.info('=====================================================');
  logger.info('   DISTRIBUTED PAYMENT PROCESSING SYSTEM - STARTUP   ');
  logger.info('=====================================================');

  // 1. Ensure initial seed data exists
  await seedDatabase();

  // 2. Start all 10 microservices on their designated ports
  const services = [
    { name: 'API Gateway', app: gatewayApp, port: SERVICE_PORTS['api-gateway'] },
    { name: 'Auth Service', app: authApp, port: SERVICE_PORTS['auth-service'] },
    { name: 'Payment Service', app: paymentApp, port: SERVICE_PORTS['payment-service'] },
    { name: 'Transaction Service', app: transactionApp, port: SERVICE_PORTS['transaction-service'] },
    { name: 'Merchant Service', app: merchantApp, port: SERVICE_PORTS['merchant-service'] },
    { name: 'Refund Service', app: refundApp, port: SERVICE_PORTS['refund-service'] },
    { name: 'Fraud & Risk Service', app: fraudApp, port: SERVICE_PORTS['fraud-service'] },
    { name: 'Notification Service', app: notificationApp, port: SERVICE_PORTS['notification-service'] },
    { name: 'Reporting Service', app: reportingApp, port: SERVICE_PORTS['reporting-service'] },
    { name: 'Monitoring & Ops Service', app: monitoringApp, port: SERVICE_PORTS['monitoring-service'] },
  ];

  for (const s of services) {
    s.app.listen(s.port, () => {
      logger.info(`✓ [${s.name}] online on http://localhost:${s.port}`);
    });
  }

  logger.info('=====================================================');
  logger.info(`✨ All 10 Microservices successfully running!`);
  logger.info(`🌐 Central API Gateway: http://localhost:${SERVICE_PORTS['api-gateway']}`);
  logger.info('=====================================================');
}

if (require.main === module) {
  startAllServices().catch(err => {
    logger.error('Failed to start services', err);
    process.exit(1);
  });
}
