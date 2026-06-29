import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

// Keys stored in the system_settings table (set by SuperAdmin UI)
const DB_KEYS = {
  cloudName: 'cloudinaryCloudName',
  apiKey:    'cloudinaryApiKey',
  apiSecret: 'cloudinaryApiSecret',
} as const;

/**
 * Return a configured Cloudinary instance.
 * Priority: DB system_settings → env vars.
 * The function re-configures the cloudinary singleton each call so that
 * SuperAdmin key changes take effect without a server restart.
 */
export async function getCloudinary() {
  let cloudName = env.CLOUDINARY_CLOUD_NAME;
  let apiKey    = env.CLOUDINARY_API_KEY;
  let apiSecret = env.CLOUDINARY_API_SECRET;

  // Try reading from DB (lazy require to avoid circular deps at module load)
  try {
    const { prisma } = await import('./database');
    const rows = await prisma.systemSetting.findMany({
      where: { key: { in: Object.values(DB_KEYS) as string[] } },
    });
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value; });
    if (map[DB_KEYS.cloudName]) cloudName = map[DB_KEYS.cloudName];
    if (map[DB_KEYS.apiKey])    apiKey    = map[DB_KEYS.apiKey];
    if (map[DB_KEYS.apiSecret]) apiSecret = map[DB_KEYS.apiSecret];
  } catch {
    // DB unavailable — fall back to env vars silently
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET ' +
      'to your .env file or the SuperAdmin → Settings page.',
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

// Legacy synchronous export still works for modules that were already using it
// (it will just use env vars only)
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || undefined,
  api_key:    env.CLOUDINARY_API_KEY    || undefined,
  api_secret: env.CLOUDINARY_API_SECRET || undefined,
  secure:     true,
});
export { cloudinary };
