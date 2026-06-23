import { Router } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import type { Request, Response, RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types';

const router = Router();
const CONFIG_KEY = 'site_config';

const DEFAULT_CONFIG = {
  logoHeight: 40, logoWidth: 0, logoPaddingX: 16, logoPaddingY: 8,
  logoMarginX: 0, logoMarginY: 0,
  logoText: 'AeroTurbineSpare', logoSubText: 'Aerospace Parts Exchange',
  heroHeading: 'Source Aerospace Parts with Confidence',
  heroSubheading: 'Global inventory of aviation, turbine, and defense components — NSN, CAGE, and part-number searchable in seconds.',
  heroBadgeText: 'Trusted by 500+ Aviation Companies',
  heroBgType: 'gradient', heroBgValue: '#0A1628',
  heroCta1Label: 'Search Inventory', heroCta1Href: '/catalog',
  heroCta2Label: 'Request a Quote', heroCta2Href: '/rfq',
  updatedAt: new Date().toISOString(), updatedBy: 'system',
};

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: CONFIG_KEY } });
    const config = row ? JSON.parse(row.value) : DEFAULT_CONFIG;
    res.json({ success: true, data: config });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put(
  '/',
  authenticate as RequestHandler,
  requireAdmin as RequestHandler,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const r = req as AuthenticatedRequest;
      const row = await prisma.systemSetting.findUnique({ where: { key: CONFIG_KEY } });
      const current = row ? JSON.parse(row.value) : DEFAULT_CONFIG;
      const updated = {
        ...current,
        ...req.body,
        updatedAt: new Date().toISOString(),
        updatedBy: r.user.email,
      };
      await prisma.systemSetting.upsert({
        where:  { key: CONFIG_KEY },
        create: { key: CONFIG_KEY, value: JSON.stringify(updated), updatedBy: r.user.email },
        update: { value: JSON.stringify(updated), updatedBy: r.user.email },
      });
      res.json({ success: true, data: updated, message: 'Site configuration saved' });
    } catch (err: unknown) {
      const e = err as { message: string };
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

export default router;
