import winston from 'winston';
import { env } from './env';

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.prettyPrint()
  ),
  defaultMeta: { service: 'aeroturbinespare-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${env.LOG_DIR}/error.log`, level: 'error' }),
    new winston.transports.File({ filename: `${env.LOG_DIR}/combined.log` }),
  ],
});

export default logger;
