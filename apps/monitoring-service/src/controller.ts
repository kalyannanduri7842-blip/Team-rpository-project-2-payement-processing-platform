import { Request, Response } from 'express';
import {
  createLogger,
  globalEventBroker,
  getSystemLogs,
  chaosEngine,
  getAllCircuitBreakers,
} from '@payment-system/shared-utils';
import { AuditLogRepository } from '@payment-system/database';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { ServiceHealthMetric, ServiceName, ServiceStatus } from '@payment-system/shared-types';

const logger = createLogger('monitoring-service');

const startTime = Date.now();

export const MonitoringController = {
  async getServicesHealth(req: Request, res: Response) {
    try {
      const services: ServiceName[] = [
        'api-gateway',
        'auth-service',
        'payment-service',
        'transaction-service',
        'merchant-service',
        'refund-service',
        'fraud-service',
        'notification-service',
        'reporting-service',
        'monitoring-service',
      ];

      const chaosConfigs = chaosEngine.getAllConfigs();
      const circuitBreakers = getAllCircuitBreakers();

      const metrics: ServiceHealthMetric[] = services.map(name => {
        const chaos = chaosConfigs.find(c => c.service === name);
        const cb = circuitBreakers.find(c => c.name === name);

        let status: ServiceStatus = 'HEALTHY';
        if (chaos?.simulateFailure || cb?.state === 'OPEN') {
          status = 'DOWN';
        } else if (chaos && chaos.injectedLatencyMs > 500) {
          status = 'DEGRADED';
        }

        const uptime = Math.floor((Date.now() - startTime) / 1000);
        // Realistic simulated memory & CPU load
        const baseMemory = 45 + (name.length * 3);
        const memoryUsageMb = Number((baseMemory + (Math.sin(Date.now() / 10000 + name.length) * 8)).toFixed(1));
        const cpuUsage = Number((1.2 + (Math.random() * 2.8)).toFixed(1));
        const latencyMs = status === 'DOWN' ? 0 : 8 + (chaos?.injectedLatencyMs || 0) + Math.floor(Math.random() * 6);

        return {
          service: name,
          instanceId: `inst-${name}-01`,
          status,
          uptimeSeconds: uptime,
          cpuUsage,
          memoryUsageMb,
          requestCount: 140 + (name.length * 25),
          errorCount: status === 'DOWN' ? 12 : 0,
          latencyMs,
          lastHeartbeat: new Date().toISOString(),
        };
      });

      return res.json({
        success: true,
        data: {
          services: metrics,
          topology: {
            totalNodes: services.length,
            healthyNodes: metrics.filter(m => m.status === 'HEALTHY').length,
            degradedNodes: metrics.filter(m => m.status === 'DEGRADED').length,
            downNodes: metrics.filter(m => m.status === 'DOWN').length,
          },
          circuitBreakers,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getQueueMetrics(req: Request, res: Response) {
    try {
      const metrics = globalEventBroker.getMetrics();
      const recentEvents = globalEventBroker.getRecentEvents(20);
      return res.json({
        success: true,
        data: {
          metrics,
          recentEvents,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getDeadLetterQueue(req: Request, res: Response) {
    try {
      const dlq = globalEventBroker.getDeadLetterQueue();
      return res.json({ success: true, data: dlq });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async replayDeadLetterJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const replayed = await globalEventBroker.replayDeadLetterJob(id);
      if (!replayed) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found in DLQ' } });
      }
      return res.json({ success: true, message: `Job ${id} re-enqueued for retry.` });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getLogs(req: Request, res: Response) {
    try {
      const { limit = '100', service, level } = req.query;
      const logs = getSystemLogs(
        parseInt(limit as string, 10),
        service as ServiceName,
        level as any
      );
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getAuditLogs(req: Request, res: Response) {
    try {
      const { actorId, resource, limit = '50', page = '1' } = req.query;
      const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
      const result = await AuditLogRepository.list({
        actorId: actorId as string,
        resource: resource as string,
        offset,
        limit: parseInt(limit as string, 10),
      });
      return res.json({ success: true, data: result.items, metadata: { total: result.total } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async getChaosConfigs(req: Request, res: Response) {
    try {
      const configs = chaosEngine.getAllConfigs();
      return res.json({ success: true, data: configs });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async setChaosConfig(req: Request, res: Response) {
    try {
      const { service, simulateFailure, injectedLatencyMs, failureRate } = req.body;
      if (!service) {
        return res.status(400).json({ success: false, error: { code: 'MISSING_SERVICE', message: 'service name required' } });
      }

      const updated = chaosEngine.setConfig(service as ServiceName, {
        simulateFailure,
        injectedLatencyMs: injectedLatencyMs !== undefined ? Number(injectedLatencyMs) : undefined,
        failureRate: failureRate !== undefined ? Number(failureRate) : undefined,
      });

      logger.warn(`Chaos configuration updated for ${service}: failure=${simulateFailure}, latency=${injectedLatencyMs}ms`);
      return res.json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  async resetChaos(req: Request, res: Response) {
    try {
      chaosEngine.resetAll();
      logger.info('All Chaos simulations reset to normal operation.');
      return res.json({ success: true, message: 'Chaos simulations cleared' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
