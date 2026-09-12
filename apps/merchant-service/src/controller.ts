import { Request, Response } from 'express';
import { MerchantRepository, SettlementRepository, PaymentRepository, AuditLogRepository } from '@payment-system/database';
import { createLogger, chaosEngine } from '@payment-system/shared-utils';

const logger = createLogger('merchant-service');

export const MerchantController = {
  async getMerchants(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('merchant-service');
      const merchants = await MerchantRepository.list();
      return res.json({ success: true, data: merchants });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getMerchantById(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('merchant-service');
      let merchant = await MerchantRepository.findById(req.params.id);
      if (!merchant) {
        // Fallback check by userId
        merchant = await MerchantRepository.findByUserId(req.params.id);
      }
      if (!merchant) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
      }
      return res.json({ success: true, data: merchant });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async updateMerchant(req: Request, res: Response) {
    const correlationId = (req.headers['x-correlation-id'] as string) || '';
    try {
      await chaosEngine.applyChaos('merchant-service');
      const { id } = req.params;
      const updates = req.body;

      const updated = await MerchantRepository.update(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
      }

      await AuditLogRepository.create({
        actorId: id,
        actorEmail: 'merchant@system',
        actorRole: 'MERCHANT',
        action: 'MERCHANT_UPDATED',
        resource: 'Merchant',
        resourceId: id,
        correlationId,
        status: 'SUCCESS',
        details: updates,
      });

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getSettlements(req: Request, res: Response) {
    try {
      const { merchantId } = req.params;
      const settlements = await SettlementRepository.findByMerchantId(merchantId);
      return res.json({ success: true, data: settlements });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async triggerSettlement(req: Request, res: Response) {
    try {
      const { merchantId } = req.params;
      const merchant = await MerchantRepository.findById(merchantId);
      if (!merchant) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Merchant not found' } });
      }

      if (merchant.accountBalance <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INSUFFICIENT_BALANCE', message: 'Account balance is zero. No funds to settle.' },
        });
      }

      const amountToSettle = merchant.accountBalance;
      const fee = Number((amountToSettle * merchant.commissionRate).toFixed(2));
      const netPayout = Number((amountToSettle - fee).toFixed(2));

      const settlement = await SettlementRepository.create({
        merchantId: merchant.id,
        amount: amountToSettle,
        feeDeducted: fee,
        netPayout,
        currency: merchant.settlementCurrency,
        status: 'PROCESSED',
        payoutDate: new Date().toISOString(),
        transactionsCount: 15,
      });

      // Deduct from merchant balance
      await MerchantRepository.update(merchant.id, { accountBalance: 0 });

      return res.json({ success: true, data: settlement });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
