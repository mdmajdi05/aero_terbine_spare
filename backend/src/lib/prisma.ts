import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

const globalForPrisma = globalThis as typeof globalThis & { __prisma?: PrismaClient };

function isTransientError(error: unknown): boolean {
  const msg = (error as { message?: string })?.message ?? '';
  const code = (error as { code?: string })?.code ?? '';
  return (
    msg.includes('terminating connection') ||
    msg.includes('E57P01') ||
    msg.includes('Connection refused') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('ECONNRESET') ||
    msg.includes('timeout') ||
    code === 'P2024' ||
    code === 'P2017'
  );
}

export const prisma = globalForPrisma.__prisma ?? new PrismaClient({
  log: (process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] as const : ['warn', 'error'] as const),
});

// ── Query-level retry middleware ─────────────────────────────
// Retries on transient database errors (Neon wake-up, network blips, etc.)
prisma.$use(async (params, next) => {
  const MAX_QUERY_RETRIES = 2;
  for (let attempt = 1; attempt <= MAX_QUERY_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error: unknown) {
      if (!isTransientError(error) || attempt === MAX_QUERY_RETRIES) throw error;
      const delay = 500 * Math.pow(2, attempt - 1);
      logger.warn(`Prisma query retry ${attempt}/${MAX_QUERY_RETRIES} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable — query retry loop exhausted');
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

export default prisma;
