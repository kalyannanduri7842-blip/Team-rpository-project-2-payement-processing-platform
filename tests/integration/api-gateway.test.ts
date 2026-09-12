import { correlationIdMiddleware, requireRole, AuthenticatedRequest } from '../../apps/api-gateway/src/middleware';
import { Response } from 'express';

describe('API Gateway Middleware Integration', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
      originalUrl: '/test',
    };
    res = {
      setHeader: jest.fn(),
      on: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should set X-Correlation-ID header if not present', () => {
    correlationIdMiddleware(req as AuthenticatedRequest, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', expect.stringMatching(/^corr_/));
    expect(next).toHaveBeenCalled();
  });

  it('should preserve provided X-Correlation-ID header', () => {
    req.headers = { 'x-correlation-id': 'custom-corr-id' };
    correlationIdMiddleware(req as AuthenticatedRequest, res as Response, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Correlation-ID', 'custom-corr-id');
    expect(next).toHaveBeenCalled();
  });

  it('should forbid access if user role is not allowed', () => {
    req.user = { id: 'u1', email: 'user@example.com', role: 'OPERATOR' as any };
    const middleware = requireRole('ADMIN' as any);
    middleware(req as AuthenticatedRequest, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: 'FORBIDDEN' }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
