import prisma from '../lib/prisma';
import { env } from './env';
import logger from './logger';

// ── Retry configuration ──────────────────────────────────────
const MAX_CONNECT_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

export { prisma } from '../lib/prisma';

export async function connectDB(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_CONNECT_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      logger.info(`Database connected [${env.DB_TYPE}]`);
      return;
    } catch (err) {
      if (attempt === MAX_CONNECT_RETRIES) {
        logger.error(`Database connection failed after ${MAX_CONNECT_RETRIES} attempts: ${err}`);
        throw err;
      }
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.warn(`DB connect attempt ${attempt}/${MAX_CONNECT_RETRIES} failed, retrying in ${delay}ms…`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
