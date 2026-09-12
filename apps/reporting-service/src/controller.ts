import { Request, Response } from 'express';
import { PaymentRepository, TransactionRepository, RefundRepository, MerchantRepository } from '@payment-system/database';
import { createLogger, chaosEngine } from '@payment-system/shared-utils';

const logger = createLogger('reporting-service');

export const ReportingController = {
  async getSummary(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('reporting-service');
      const { merchantId } = req.query;

      const paymentsRes = await PaymentRepository.list({ merchantId: merchantId as string, limit: 1000 });
      const refundsRes = await RefundRepository.list({ merchantId: merchantId as string, limit: 1000 });

      const payments = paymentsRes.items;
      const refunds = refundsRes.items;

      const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);
      const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
      const failedPayments = payments.filter(p => p.status === 'FAILED');
      const successfulVolume = successfulPayments.reduce((acc, p) => acc + p.amount, 0);
      const totalFees = payments.reduce((acc, p) => acc + p.feeAmount, 0);
      const totalRefunded = refunds.reduce((acc, r) => acc + r.amount, 0);
      const successRate = payments.length > 0 ? Number(((successfulPayments.length / payments.length) * 100).toFixed(1)) : 100;

      // Group by payment method
      const methodBreakdown: Record<string, number> = {};
      payments.forEach(p => {
        const pm = (p as any).paymentMethodType || 'CREDIT_CARD';
        methodBreakdown[pm] = (methodBreakdown[pm] || 0) + 1;
      });

      return res.json({
        success: true,
        data: {
          totalVolume: Number(totalVolume.toFixed(2)),
          successfulVolume: Number(successfulVolume.toFixed(2)),
          totalFees: Number(totalFees.toFixed(2)),
          totalRefunded: Number(totalRefunded.toFixed(2)),
          totalPaymentsCount: payments.length,
          successfulCount: successfulPayments.length,
          failedCount: failedPayments.length,
          refundsCount: refunds.length,
          successRate,
          methodBreakdown,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getRevenueTrends(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('reporting-service');
      const { merchantId } = req.query;

      const paymentsRes = await PaymentRepository.list({ merchantId: merchantId as string, limit: 1000 });
      const successfulPayments = paymentsRes.items.filter(p => p.status === 'SUCCESS');

      // Group payments by date
      const dailyMap = new Map<string, { date: string; volume: number; count: number; fees: number }>();

      // Populate last 7 days defaults
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, { date: dateStr, volume: 0, count: 0, fees: 0 });
      }

      successfulPayments.forEach(p => {
        const dateStr = p.createdAt.split('T')[0];
        const entry = dailyMap.get(dateStr) || { date: dateStr, volume: 0, count: 0, fees: 0 };
        entry.volume = Number((entry.volume + p.amount).toFixed(2));
        entry.fees = Number((entry.fees + p.feeAmount).toFixed(2));
        entry.count += 1;
        dailyMap.set(dateStr, entry);
      });

      const trends = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      return res.json({ success: true, data: trends });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async exportTransactionsCsv(req: Request, res: Response) {
    try {
      const { merchantId, customerId } = req.query;
      const result = await TransactionRepository.list({
        merchantId: merchantId as string,
        customerId: customerId as string,
        limit: 500,
      });

      const header = 'Transaction ID,Payment ID,Reference,Amount,Currency,Status,Payment Method,Date\n';
      const rows = result.items.map(t =>
        `"${t.id}","${t.paymentId}","${t.referenceNumber}",${t.amount},"${t.currency}","${t.status}","${t.paymentMethodType}","${t.createdAt}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions_report.csv"');
      return res.send(header + rows);
    } catch (err: any) {
      return res.status(500).send(`Error exporting CSV: ${err.message}`);
    }
  },
};
