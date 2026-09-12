import { spawn } from 'child_process';
import path from 'path';
import { startAllServices } from './services-runner';
import { createLogger } from '@payment-system/shared-utils';

const logger = createLogger('system');

async function runDev() {
  logger.info('Starting Full-Stack Distributed Payment Processing Platform...');

  // 1. Start all 10 microservices
  await startAllServices();

  // 2. Start Vite Dev Server
  logger.info('Starting Vite React Frontend on http://localhost:5173 ...');

  const isWindows = process.platform === 'win32';
  const npmCmd = isWindows ? 'npm.cmd' : 'npm';

  const webProcess = spawn(npmCmd, ['run', 'dev'], {
    cwd: path.resolve(__dirname, '../apps/web'),
    stdio: 'inherit',
    shell: true,
  });

  webProcess.on('error', err => {
    logger.error('Failed to start Vite dev server', err);
  });

  webProcess.on('exit', code => {
    logger.info(`Vite dev server exited with code ${code}`);
    process.exit(code || 0);
  });
}

if (require.main === module) {
  runDev().catch(err => {
    logger.error('Dev runner failure', err);
    process.exit(1);
  });
}
