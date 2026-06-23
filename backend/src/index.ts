import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import { globalLimiter } from './middleware/rateLimiter';
import router from './routes';

const app = express();

// ── Security & parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting ─────────────────────────────────────────────
app.use(globalLimiter);

// ── API routes ────────────────────────────────────────────────
app.use('/api/v1', router);

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────
async function start() {
  await connectDB();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀  AeroTurbineSpare API running on http://localhost:${env.PORT}`);
    console.log(`    Environment : ${env.NODE_ENV}`);
    console.log(`    Database    : ${env.DB_TYPE}`);
    console.log(`    Frontend URL: ${env.FRONTEND_URL}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down…`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
