import { Request, Response } from 'express';
import { FraudEventRepository, AuditLogRepository } from '@payment-system/database';
import { createLogger, chaosEngine } from '@payment-system/shared-utils';
import { RiskLevel, FraudAction } from '@payment-system/shared-types';

const logger = createLogger('fraud-service');

export const FraudController = {
  async evaluate(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('fraud-service');
      const { amount, merchantRiskThreshold = 70, customerId, clientIp } = req.body;

      let score = 5; // Base normal
      const triggeredRules: string[] = [];

      if (amount > 10000) {
        score += 65;
        triggeredRules.push('TRANSACTION_AMOUNT_ABOVE_THRESHOLD');
      } else if (amount > 2500) {
        score += 25;
        triggeredRules.push('ELEVATED_TRANSACTION_VALUE');
      }

      if (clientIp && (clientIp.startsWith('10.') || clientIp.startsWith('192.168.'))) {
        score += 5;
      }

      // Check merchant risk threshold
      if (score > merchantRiskThreshold) {
        triggeredRules.push('MERCHANT_RISK_THRESHOLD_EXCEEDED');
      }

      const riskLevel: RiskLevel = score >= 70 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';
      const action: FraudAction = riskLevel === 'HIGH' ? 'FLAGGED_FOR_REVIEW' : 'APPROVED';

      return res.json({
        success: true,
        data: {
          riskScore: Math.min(score, 100),
          riskLevel,
          action,
          triggeredRules,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getAlerts(req: Request, res: Response) {
    try {
      await chaosEngine.applyChaos('fraud-service');
      const { riskLevel, status, page = '1', limit = '20' } = req.query;

      const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const result = await FraudEventRepository.list({
        riskLevel: riskLevel as string,
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

  async resolveAlert(req: Request, res: Response) {
    const correlationId = (req.headers['x-correlation-id'] as string) || '';
    try {
      const { id } = req.params;
      const { status, reviewedBy, reviewNotes } = req.body;

      const updated = await FraudEventRepository.update(id, {
        status,
        reviewedBy: reviewedBy || 'Admin',
        reviewNotes,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Fraud alert not found' } });
      }

      await AuditLogRepository.create({
        actorId: reviewedBy || 'admin',
        actorEmail: 'admin@demo.com',
        actorRole: 'ADMIN',
        action: 'FRAUD_ALERT_RESOLVED',
        resource: 'FraudAlert',
        resourceId: id,
        correlationId,
        status: 'SUCCESS',
        details: { status, reviewNotes },
      });

      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
