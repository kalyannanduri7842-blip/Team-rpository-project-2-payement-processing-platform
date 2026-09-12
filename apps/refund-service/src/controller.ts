import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  RefundRepository,
  TransactionRepository,
  PaymentRepository,
  MerchantRepository,
  CustomerRepository,
  AuditLogRepository,
} from '@payment-system/database';
import { createLogger, globalEventBroker, chaosEngine } from '@payment-system/shared-utils';
import { CreateRefundDto, RefundStatus } from '@payment-system/shared-types';

const logger = createLogger('refund-service');

export const RefundController = {
  async createRefund(req: Request, res: Response) {
    const correlationId = (req.headers['x-correlation-id'] as string) || `corr_${uuidv4().substring(0, 8)}`;
    try {
      await chaosEngine.applyChaos('refund-service');
      const { transactionId, amount, reason = 'REQUESTED_BY_CUSTOMER', notes }: CreateRefundDto = req.body;

      if (!transactionId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'transactionId is required.' },
        });
      }

      const txn = await TransactionRepository.findById(transactionId);
      if (!txn) {
        return res.status(404).json({
          success: false,
          error: { code: 'TRANSACTION_NOT_FOUND', message: 'Transaction not found.' },
        });
      }

      if (txn.status !== 'SUCCESS') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TRANSACTION_STATUS', message: 'Only successful transactions can be refunded.' },
        });
      }

      const refundAmount = amount && amount > 0 ? amount : txn.amount;
      if (refundAmount > txn.amount) {
        return res.status(400).json({
          success: false,
          error: { code: 'EXCEEDS_AMOUNT', message: `Refund amount ($${refundAmount}) cannot exceed transaction amount ($${txn.amount}).` },
        });
      }

      const refund = await RefundRepository.create({
        transactionId: txn.id,
        paymentId: txn.paymentId,
        merchantId: txn.merchantId,
        customerId: txn.customerId,
        amount: refundAmount,
        currency: txn.currency,
        reason,
        status: 'COMPLETED',
        correlationId,
      });

      // Update balances
      await CustomerRepository.updateBalance(txn.customerId, refundAmount);
      await MerchantRepository.addRevenue(txn.merchantId, -refundAmount);

      // Publish RefundCompleted event
      const customer = await CustomerRepository.findById(txn.customerId);
      const merchant = await MerchantRepository.findById(txn.merchantId);

      await globalEventBroker.publish(
        'RefundCompleted',
        {
          refundId: refund.id,
          transactionId: txn.id,
          amount: refundAmount,
          currency: txn.currency,
          customerUserId: customer?.userId,
          merchantUserId: merchant?.userId,
        },
        'refund-service',
        correlationId
      );

      // Audit log
      await AuditLogRepository.create({
        actorId: txn.customerId,
        actorEmail: customer?.email || 'unknown',
        actorRole: 'CUSTOMER',
        action: 'REFUND_COMPLETED',
        resource: 'Refund',
        resourceId: refund.id,
        correlationId,
        ipAddress: req.ip,
        status: 'SUCCESS',
        details: { amount: refundAmount, transactionId: txn.id, reason },
      });

      logger.info(`Refund completed for transaction ${txn.id} ($${refundAmount})`, correlationId);
      return res.status(201).json({ success: true, data: refund });
    } catch (err: any) {
      logger.error('Refund failed', err, correlationId);
      return res.status(500).json({
        success: false,
        error: { code: 'REFUND_ERROR', message: err.message, correlationId },
      });
    }
  },

  async getRefunds(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('refund-service');
      const { merchantId, customerId, status, page = '1', limit = '20' } = req.query;

      const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const result = await RefundRepository.list({
        merchantId: merchantId as string,
        customerId: customerId as string,
        status: status as string,
        offset,
        limit: parseInt(limit as string, 10),
      });

      return res.json({
        success: true,
        data: result.items,
        metadata: {
          total: result.total,
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          totalPages: Math.ceil(result.total / parseInt(limit as string, 10)),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getRefundById(req: Request, res: Response) {
    try {
      const refund = await RefundRepository.findById(req.params.id);
      if (!refund) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Refund not found' } });
      }
      return res.json({ success: true, data: refund });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const updated = await RefundRepository.update(id, {
        status: status as RefundStatus,
        rejectionReason,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Refund not found' } });
      }

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
