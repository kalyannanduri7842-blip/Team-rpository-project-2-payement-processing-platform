import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '@payment-system/shared-config';
import {
  PaymentRepository,
  CustomerRepository,
  MerchantRepository,
  TransactionRepository,
  PaymentMethodRepository,
  AuditLogRepository,
  FraudEventRepository,
} from '@payment-system/database';
import {
  createLogger,
  globalIdempotencyManager,
  globalEventBroker,
  chaosEngine,
  getCircuitBreaker,
} from '@payment-system/shared-utils';
import { CreatePaymentDto, PaymentStatus, RiskLevel } from '@payment-system/shared-types';

const logger = createLogger('payment-service');

function extractUser(req: Request) {
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      return jwt.verify(auth.split(' ')[1], config.jwt.secret) as any;
    }
  } catch (e) {}
  return null;
}

export const PaymentController = {
  async createPayment(req: Request, res: Response) {
    const correlationId = (req.headers['x-correlation-id'] as string) || `corr_${uuidv4().substring(0, 8)}`;
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey || `idemp_${uuidv4()}`;

    try {
      // 1. Chaos & Fault Injection Check
      await chaosEngine.applyChaos('payment-service');

      // 2. Idempotency Check
      const idempResult = globalIdempotencyManager.reserve(idempotencyKey);
      if (!idempResult.success && idempResult.existing) {
        if (idempResult.existing.state === 'COMPLETED') {
          logger.info(`Idempotent replay for key: ${idempotencyKey}`, correlationId);
          return res.status(idempResult.existing.statusCode || 200).json(idempResult.existing.response);
        } else if (idempResult.existing.state === 'PENDING') {
          return res.status(409).json({
            success: false,
            error: {
              code: 'IDEMPOTENCY_IN_PROGRESS',
              message: 'A payment request with this Idempotency-Key is currently processing. Please wait.',
              correlationId,
            },
          });
        }
      }

      const user = extractUser(req);
      const {
        merchantId,
        amount,
        currency = 'USD',
        paymentMethodType = 'CREDIT_CARD',
        paymentMethodDetails,
        savePaymentMethod,
        description,
      }: CreatePaymentDto = req.body;

      if (!merchantId || !amount || amount <= 0) {
        globalIdempotencyManager.fail(idempotencyKey, 'Invalid payment payload');
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PAYLOAD', message: 'Valid merchantId and positive amount are required.', correlationId },
        });
      }

      // 3. Resolve Customer & Merchant
      let customer = user ? await CustomerRepository.findByUserId(user.id) : null;
      if (!customer) {
        const allCustomers = await CustomerRepository.list();
        customer = allCustomers[0];
      }
      if (!customer) {
        return res.status(400).json({ success: false, error: { code: 'CUSTOMER_NOT_FOUND', message: 'No customer profile found.' } });
      }

      const merchant = await MerchantRepository.findById(merchantId);
      if (!merchant || merchant.status !== 'ACTIVE') {
        globalIdempotencyManager.fail(idempotencyKey, 'Merchant not found or inactive');
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_MERCHANT', message: 'Merchant is invalid or inactive.', correlationId },
        });
      }

      // 4. Save Payment Method if requested
      let paymentMethodId: string | undefined;
      if (paymentMethodDetails?.cardNumber) {
        const last4 = paymentMethodDetails.cardNumber.slice(-4);
        const pm = await PaymentMethodRepository.create({
          customerId: customer.id,
          type: paymentMethodType,
          provider: paymentMethodDetails.cardNumber.startsWith('4') ? 'Visa' : 'MasterCard',
          last4,
          expiryMonth: 12,
          expiryYear: 2028,
          isDefault: !!savePaymentMethod,
        });
        paymentMethodId = pm.id;
      }

      // 5. Academic Fraud / Risk Evaluation Simulation
      let riskScore = Math.floor(Math.random() * 20); // base normal
      let riskLevel: RiskLevel = 'LOW';
      const triggeredRules: string[] = [];

      if (amount >= 10000) {
        riskScore += 65;
        triggeredRules.push('TRANSACTION_AMOUNT_ABOVE_THRESHOLD');
      } else if (amount >= 2500) {
        riskScore += 25;
        triggeredRules.push('ELEVATED_TRANSACTION_VALUE');
      }

      if (riskScore >= 70) {
        riskLevel = 'HIGH';
      } else if (riskScore >= 35) {
        riskLevel = 'MEDIUM';
      }

      // 6. Fee Calculation
      const feeAmount = Number((amount * merchant.commissionRate).toFixed(2));
      const netAmount = Number((amount - feeAmount).toFixed(2));

      // 7. Payment State Machine Execution
      let paymentStatus: PaymentStatus = 'SUCCESS';
      let failureReason: string | undefined;

      // Simulated intentional card failure (e.g. card ending in 0000 or specific simulated flag)
      if (paymentMethodDetails?.cardNumber?.endsWith('0000')) {
        paymentStatus = 'FAILED';
        failureReason = 'Card declined by simulated issuing bank (TEST_DECLINE_0000)';
      }

      const payment = await PaymentRepository.create({
        customerId: customer.id,
        merchantId: merchant.id,
        paymentMethodId,
        amount,
        feeAmount,
        netAmount,
        currency,
        status: paymentStatus,
        idempotencyKey,
        description: description || `Payment to ${merchant.businessName}`,
        clientIp: req.ip || '127.0.0.1',
        failureReason,
        retryCount: 0,
        riskScore,
        riskLevel,
      });

      // 8. Financial Ledger & Balance updates
      let transaction: any = null;
      if (paymentStatus === 'SUCCESS') {
        await MerchantRepository.addRevenue(merchant.id, amount, merchant.commissionRate);
        await CustomerRepository.updateBalance(customer.id, -amount);

        const refNum = `REF-${Date.now().toString().slice(-8)}`;
        transaction = await TransactionRepository.create({
          paymentId: payment.id,
          customerId: customer.id,
          merchantId: merchant.id,
          amount,
          currency,
          status: 'SUCCESS',
          paymentMethodType,
          referenceNumber: refNum,
          correlationId,
          metadata: { feeAmount, netAmount, description: payment.description },
        });
      } else {
        const refNum = `FAIL-${Date.now().toString().slice(-8)}`;
        transaction = await TransactionRepository.create({
          paymentId: payment.id,
          customerId: customer.id,
          merchantId: merchant.id,
          amount,
          currency,
          status: 'FAILED',
          paymentMethodType,
          referenceNumber: refNum,
          correlationId,
          failureReason,
        });
      }

      // 9. Record Fraud Event if flagged
      if (riskLevel === 'HIGH' || triggeredRules.length > 0) {
        await FraudEventRepository.create({
          paymentId: payment.id,
          transactionId: transaction.id,
          customerId: customer.id,
          merchantId: merchant.id,
          riskScore,
          riskLevel,
          triggeredRules,
          action: riskLevel === 'HIGH' ? 'FLAGGED_FOR_REVIEW' : 'APPROVED',
          status: riskLevel === 'HIGH' ? 'PENDING_REVIEW' : 'RESOLVED_APPROVED',
        });
      }

      // 10. Publish Distributed Events to Event Broker
      await globalEventBroker.publish(
        paymentStatus === 'SUCCESS' ? 'PaymentSucceeded' : 'PaymentFailed',
        {
          paymentId: payment.id,
          transactionId: transaction?.id,
          customerId: customer.id,
          customerUserId: customer.userId,
          merchantId: merchant.id,
          merchantUserId: merchant.userId,
          amount,
          currency,
          status: paymentStatus,
          riskScore,
          riskLevel,
        },
        'payment-service',
        correlationId
      );

      // 11. Audit Logging
      await AuditLogRepository.create({
        actorId: user?.id || customer.id,
        actorEmail: user?.email || customer.email,
        actorRole: (user?.role as any) || 'CUSTOMER',
        action: paymentStatus === 'SUCCESS' ? 'PAYMENT_PROCESSED' : 'PAYMENT_FAILED',
        resource: 'Payment',
        resourceId: payment.id,
        correlationId,
        ipAddress: req.ip,
        status: paymentStatus === 'SUCCESS' ? 'SUCCESS' : 'FAILURE',
        details: { amount, currency, merchantId: merchant.id, failureReason },
      });

      const responsePayload = {
        success: paymentStatus === 'SUCCESS',
        data: {
          payment,
          transaction,
          riskAssessment: { score: riskScore, level: riskLevel, triggeredRules },
        },
      };

      globalIdempotencyManager.complete(idempotencyKey, paymentStatus === 'SUCCESS' ? 200 : 400, responsePayload);

      return res.status(paymentStatus === 'SUCCESS' ? 200 : 400).json(responsePayload);
    } catch (err: any) {
      logger.error('Payment processing exception', err, correlationId);
      globalIdempotencyManager.fail(idempotencyKey, err.message);
      return res.status(500).json({
        success: false,
        error: { code: 'PAYMENT_PROCESSING_ERROR', message: err.message, correlationId },
      });
    }
  },

  async getPayments(req: Request, res: Response) {
    try {
      const { customerId, merchantId, status, page = '1', limit = '20' } = req.query;
      const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const result = await PaymentRepository.list({
        customerId: customerId as string,
        merchantId: merchantId as string,
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

  async getPaymentById(req: Request, res: Response) {
    try {
      const payment = await PaymentRepository.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } });
      }
      return res.json({ success: true, data: payment });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const { merchantId } = req.query;
      const stats = await PaymentRepository.getStats(merchantId as string);
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getPaymentMethods(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const methods = await PaymentMethodRepository.findByCustomerId(customerId);
      return res.json({ success: true, data: methods });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
