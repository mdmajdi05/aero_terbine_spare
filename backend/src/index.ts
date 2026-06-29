import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import logger from './config/logger';

// ── Start ─────────────────────────────────────────────────────
async function start() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    logger.info(`AeroTurbineSpare API running on http://localhost:${env.PORT}`);
    logger.info(`Environment : ${env.NODE_ENV}`);
    logger.info(`Database    : ${env.DB_TYPE}`);
    logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error('Fatal startup error: ' + err);
  process.exit(1);
});
