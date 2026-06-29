import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const isDev = env.NODE_ENV === 'development';

export const globalLimiter = rateLimit({
  windowMs: isDev ? 60_000 : env.RATE_LIMIT_WINDOW_MS,
  max:      isDev ? 10_000 : env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: () => isDev,   // completely disabled in dev
  message: { success: false, error: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  windowMs: isDev ? 60_000 : 15 * 60 * 10000,
  max:      isDev ? 1_000  : 20,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: () => isDev,
  message: { success: false, error: 'Too many auth attempts, please try again in 15 minutes.' },
});

export const rfqLimiter = rateLimit({
  windowMs: isDev ? 60_000 : env.RATE_LIMIT_WINDOW_MS,
  max:      isDev ? 1_000  : env.RFQ_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: () => isDev,
  message: { success: false, error: 'RFQ submission limit reached.' },
});

export const blogPublicLimiter = rateLimit({
  windowMs: isDev ? 60_000 : 60 * 1000,
  max:      isDev ? 10_000 : 30,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: () => isDev,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});

export const blogSearchLimiter = rateLimit({
  windowMs: isDev ? 60_000 : 60 * 1000,
  max:      isDev ? 10_000 : 60,
  standardHeaders: true,
  legacyHeaders:   false,
  skip: () => isDev,
  message: { success: false, error: 'Too many search requests.' },
});
