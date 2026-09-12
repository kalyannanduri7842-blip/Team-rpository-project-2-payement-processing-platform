import express from 'express';
import cors from 'cors';
import { config, SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger, getCircuitBreaker, getAllCircuitBreakers } from '@payment-system/shared-utils';
import { correlationIdMiddleware, AuthenticatedRequest } from './middleware';

const logger = createLogger('api-gateway');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(correlationIdMiddleware);

// Gateway Root and Health
app.get('/', (req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({
    gateway: 'HEALTHY',
    circuitBreakers: getAllCircuitBreakers(),
    timestamp: new Date().toISOString(),
  });
});

// Proxy helper with Circuit Breaker
async function proxyRequest(targetUrl: string, serviceName: string, req: AuthenticatedRequest, res: express.Response) {
  const cb = getCircuitBreaker(serviceName);
  
  try {
    const result = await cb.execute(async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Correlation-ID': req.correlationId || '',
      };

      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
      }
      if (req.headers['idempotency-key']) {
        headers['Idempotency-Key'] = req.headers['idempotency-key'] as string;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return { status: response.status, data };
      } else {
        const text = await response.text();
        return { status: response.status, data: text, isText: true, contentType };
      }
    }, () => {
      // Fallback if circuit is OPEN
      return {
        status: 503,
        data: {
          success: false,
          error: {
            code: 'CIRCUIT_OPEN',
            message: `Service [${serviceName}] circuit breaker is OPEN. Downstream service unavailable.`,
            correlationId: req.correlationId,
          },
        },
      };
    });

    if ((result as any).isText) {
      res.setHeader('Content-Type', (result as any).contentType);
      return res.status(result.status).send((result as any).data);
    }

    return res.status(result.status).json(result.data);
  } catch (err: any) {
    logger.error(`Proxy failure to ${serviceName}: ${err.message}`, err, req.correlationId);
    return res.status(502).json({
      success: false,
      error: {
        code: 'BAD_GATEWAY',
        message: `Failed to communicate with service [${serviceName}]: ${err.message}`,
        correlationId: req.correlationId,
      },
    });
  }
}

// Proxy routes mapped to internal microservices
const serviceRoutes: Record<string, { service: string; port: number }> = {
  '/api/auth': { service: 'auth-service', port: SERVICE_PORTS['auth-service'] },
  '/api/payments': { service: 'payment-service', port: SERVICE_PORTS['payment-service'] },
  '/api/transactions': { service: 'transaction-service', port: SERVICE_PORTS['transaction-service'] },
  '/api/merchants': { service: 'merchant-service', port: SERVICE_PORTS['merchant-service'] },
  '/api/refunds': { service: 'refund-service', port: SERVICE_PORTS['refund-service'] },
  '/api/fraud': { service: 'fraud-service', port: SERVICE_PORTS['fraud-service'] },
  '/api/notifications': { service: 'notification-service', port: SERVICE_PORTS['notification-service'] },
  '/api/reports': { service: 'reporting-service', port: SERVICE_PORTS['reporting-service'] },
  '/api/monitoring': { service: 'monitoring-service', port: SERVICE_PORTS['monitoring-service'] },
};

// Bind dynamic route dispatchers
Object.entries(serviceRoutes).forEach(([prefix, target]) => {
  app.use(prefix, async (req: AuthenticatedRequest, res: express.Response) => {
    const targetUrl = `http://localhost:${target.port}${req.originalUrl}`;
    await proxyRequest(targetUrl, target.service, req, res);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    },
  });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['api-gateway'];
  app.listen(port, () => {
    logger.info(`🚀 API Gateway running on port ${port}`);
  });
}
