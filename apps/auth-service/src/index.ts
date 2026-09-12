import express from 'express';
import cors from 'cors';
import { SERVICE_PORTS } from '@payment-system/shared-config';
import { createLogger } from '@payment-system/shared-utils';
import { AuthController } from './controller';

const logger = createLogger('auth-service');
const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Auth Endpoints
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/refresh', AuthController.refresh);
app.get('/api/auth/me', AuthController.me);

app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'UP', timestamp: new Date().toISOString() });
});

export { app };

if (require.main === module) {
  const port = SERVICE_PORTS['auth-service'];
  app.listen(port, () => {
    logger.info(`🔐 Auth Service running on port ${port}`);
  });
}
