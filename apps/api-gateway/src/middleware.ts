import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { config } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { UserRole } from '@payment-system/shared-types';

const logger = createLogger('api-gateway');

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  correlationId?: string;
  startTime?: number;
}

export function correlationIdMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || `corr_${uuidv4().substring(0, 8)}`;
  req.correlationId = correlationId;
  req.startTime = Date.now();
  res.setHeader('X-Correlation-ID', correlationId);

  res.on('finish', () => {
    const elapsed = Date.now() - (req.startTime || Date.now());
    logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${elapsed}ms`, correlationId);
  });

  next();
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header with Bearer token',
        correlationId: req.correlationId,
      },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired access token',
        correlationId: req.correlationId,
      },
    });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required', correlationId: req.correlationId },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
          correlationId: req.correlationId,
        },
      });
    }

    next();
  };
}
