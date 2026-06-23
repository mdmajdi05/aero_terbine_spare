import { PrismaClient } from '@prisma/client';
import { env } from './env';

// ── Singleton Prisma client ──────────────────────────────────
// For Neon (serverless), use connection pooling via DATABASE_URL (PgBouncer).
// Migrations use DIRECT_DATABASE_URL to bypass the pooler.
//
// To swap to a different database:
//   1. Change DB_TYPE in .env
//   2. Update the `provider` in prisma/schema.prisma
//   3. Re-run `prisma migrate dev`
//   No application code changes are needed.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
    datasources: {
      db: { url: env.DATABASE_URL },
    },
  });
}

// Reuse client in development to avoid exhausting connections during hot reload
export const prisma: PrismaClient =
  env.NODE_ENV === 'production'
    ? createPrismaClient()
    : (globalThis.__prisma ??= createPrismaClient());

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(`✅  Database connected [${env.DB_TYPE}]`);
  } catch (err) {
    console.error('❌  Database connection failed:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}
