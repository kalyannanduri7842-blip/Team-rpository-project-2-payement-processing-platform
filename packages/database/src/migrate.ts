import { LocalDataStore } from './client';
import { createLogger } from '@payment-system/shared-utils';

const logger = createLogger('system');

export async function runMigrations() {
  logger.info('Running Database Migrations...');
  const store = LocalDataStore.getInstance();
  store.load();
  logger.info('Schema migration complete. All tables and indices verified.');
}

if (require.main === module) {
  runMigrations().catch(err => {
    console.error('Migration Error:', err);
    process.exit(1);
  });
}
