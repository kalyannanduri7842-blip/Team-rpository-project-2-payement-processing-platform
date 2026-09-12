import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { NotificationController, initNotificationEventListeners } from './controller';

const logger = createLogger('notification-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Initialize event listeners
initNotificationEventListeners();

// Notification Routes
app.get('/api/notifications', NotificationController.getNotifications);
app.put('/api/notifications/:id/read', NotificationController.markAsRead);
app.put('/api/notifications/read-all', NotificationController.markAllAsRead);

app.get('/health', (req, res) => {
  res.json({ service: 'notification-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['notification-service'];
  app.listen(port, () => {
    logger.info(`🔔 Notification Service running on port ${port}`);
  });
}
