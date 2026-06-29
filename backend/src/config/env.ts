import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV:             z.enum(['development', 'production', 'test']).default('development'),
  PORT:                 z.coerce.number().default(4000),
  FRONTEND_URL:         z.string().url().default('http://localhost:3000'),

  DATABASE_URL:         z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_DATABASE_URL:  z.string().optional(),
  DB_TYPE:              z.enum(['neon', 'postgres', 'mysql', 'mongodb']).default('neon'),
  DB_POOL_MIN:          z.coerce.number().default(1),
  DB_POOL_MAX:          z.coerce.number().default(10),
  DB_CONNECT_TIMEOUT_MS:z.coerce.number().default(10000),

  JWT_SECRET:           z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET:   z.string().min(32),
  JWT_EXPIRES_IN:       z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  SMTP_HOST:            z.string().default('smtp.sendgrid.net'),
  SMTP_PORT:            z.coerce.number().default(587),
  SMTP_USER:            z.string().default('apikey'),
  SMTP_PASS:            z.string().default(''),
  EMAIL_FROM:           z.string().default('AeroTurbineSpare <noreply@aeroturbinespare.com>'),
  RFQ_NOTIFY_EMAIL:     z.string().email().default('rfq@aeroturbinespare.com'),

  RATE_LIMIT_WINDOW_MS:    z.coerce.number().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  RFQ_RATE_LIMIT_MAX:      z.coerce.number().default(10),

  UPLOAD_DIR:           z.string().default('./uploads'),
  MAX_FILE_SIZE_MB:     z.coerce.number().default(10),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY:    z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),

  BACKUP_DIR:           z.string().default('./backups'),
  BACKUP_ENCRYPTION_KEY:z.string().default(''),

  LOG_LEVEL:            z.string().default('info'),
  LOG_DIR:              z.string().default('./logs'),
});

function loadEnv() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌  Invalid environment variables:');
    parsed.error.issues.forEach((i) => console.error(`   ${i.path.join('.')}: ${i.message}`));
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
