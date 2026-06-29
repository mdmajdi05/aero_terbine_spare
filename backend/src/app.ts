import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter';
import logger from './config/logger';
import router from './routes';

const app = express();

// ── Security & parsing ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Request timeout ───────────────────────────────────────────
app.use((_req, res, next) => {
  res.setTimeout(120000, () => {
    res.status(503).json({ success: false, error: 'Request timeout' });
  });
  next();
});

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
  logger.error(err.stack || err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;
