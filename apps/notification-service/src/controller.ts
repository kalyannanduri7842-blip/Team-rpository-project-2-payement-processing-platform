import { Request, Response } from 'express';
import { NotificationRepository, UserRepository } from '@payment-system/database';
import { createLogger, globalEventBroker, chaosEngine } from '@payment-system/shared-utils';

const logger = createLogger('notification-service');

// Initialize event listeners on startup
export function initNotificationEventListeners() {
  globalEventBroker.subscribe('PaymentSucceeded', async event => {
    const { customerUserId, merchantUserId, amount, currency } = event.payload;
    if (customerUserId) {
      await NotificationRepository.create({
        userId: customerUserId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful',
        message: `Your payment of $${amount.toFixed(2)} ${currency} was processed successfully.`,
        channel: 'IN_APP',
        isRead: false,
      });
    }
    if (merchantUserId) {
      await NotificationRepository.create({
        userId: merchantUserId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Received',
        message: `You received a new payment of $${amount.toFixed(2)} ${currency}.`,
        channel: 'IN_APP',
        isRead: false,
      });
    }
  });

  globalEventBroker.subscribe('PaymentFailed', async event => {
    const { customerUserId, amount, currency } = event.payload;
    if (customerUserId) {
      await NotificationRepository.create({
        userId: customerUserId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: `Your payment of $${amount.toFixed(2)} ${currency} could not be completed.`,
        channel: 'IN_APP',
        isRead: false,
      });
    }
  });

  globalEventBroker.subscribe('RefundCompleted', async event => {
    const { customerUserId, merchantUserId, amount, currency } = event.payload;
    if (customerUserId) {
      await NotificationRepository.create({
        userId: customerUserId,
        type: 'REFUND_COMPLETED',
        title: 'Refund Processed',
        message: `A refund of $${amount.toFixed(2)} ${currency} was issued to your account.`,
        channel: 'IN_APP',
        isRead: false,
      });
    }
  });
}

export const NotificationController = {
  async getNotifications(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('notification-service');
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_USER_ID', message: 'userId query param required' } });
      }

      const notifications = await NotificationRepository.findByUserId(userId as string);
      return res.json({ success: true, data: notifications });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await NotificationRepository.markAsRead(id);
      return res.json({ success: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_USER_ID', message: 'userId required' } });
      }
      await NotificationRepository.markAllAsRead(userId);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
