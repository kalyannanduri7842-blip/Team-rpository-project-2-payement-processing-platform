import { Request, Response } from 'express';
import { TransactionRepository, CustomerRepository, MerchantRepository, PaymentRepository } from '@payment-system/database';
import { createLogger, chaosEngine } from '@payment-system/shared-utils';

const logger = createLogger('transaction-service');

export const TransactionController = {
  async getTransactions(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('transaction-service');
      const { customerId, merchantId, status, search, page = '1', limit = '20' } = req.query;

      const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const result = await TransactionRepository.list({
        customerId: customerId as string,
        merchantId: merchantId as string,
        status: status as string,
        search: search as string,
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

  async getTransactionById(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('transaction-service');
      const txn = await TransactionRepository.findById(req.params.id);
      if (!txn) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      }
      return res.json({ success: true, data: txn });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getReceipt(req: Request, res: Response) {
    try {
      const txn = await TransactionRepository.findById(req.params.id);
      if (!txn) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Transaction not found' } });
      }

      const customer = await CustomerRepository.findById(txn.customerId);
      const merchant = await MerchantRepository.findById(txn.merchantId);
      const payment = await PaymentRepository.findById(txn.paymentId);

      const receipt = {
        receiptNumber: `REC-${txn.referenceNumber}`,
        transactionId: txn.id,
        paymentId: txn.paymentId,
        referenceNumber: txn.referenceNumber,
        date: txn.createdAt,
        status: txn.status,
        currency: txn.currency,
        amount: txn.amount,
        paymentMethod: txn.paymentMethodType,
        customer: {
          name: customer?.fullName || 'Customer',
          email: customer?.email || 'N/A',
          billingAddress: customer?.billingAddress || 'N/A',
        },
        merchant: {
          businessName: merchant?.businessName || 'Merchant',
          merchantId: merchant?.id,
        },
        description: payment?.description || 'Payment Transaction',
        issuedAt: new Date().toISOString(),
      };

      return res.json({ success: true, data: receipt });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
