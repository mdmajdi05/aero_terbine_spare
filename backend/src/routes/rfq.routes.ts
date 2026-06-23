import { Router } from 'express';
import * as ctrl from '../controllers/rfq.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { rfqLimiter } from '../middleware/rateLimiter';
import { auditLog } from '../middleware/audit';
import type { RequestHandler } from 'express';

const router = Router();

router.post('/', rfqLimiter, ctrl.submitRFQ as RequestHandler);

router.get(
  '/my',
  authenticate as RequestHandler,
  ctrl.getMyRFQs as unknown as RequestHandler,
);

router.get(
  '/:id',
  authenticate as RequestHandler,
  ctrl.getRFQ as unknown as RequestHandler,
);

router.get(
  '/',
  authenticate as RequestHandler,
  requireAdmin as RequestHandler,
  ctrl.listAllRFQs as RequestHandler,
);

router.put(
  '/:id/status',
  authenticate as RequestHandler,
  requireAdmin as RequestHandler,
  auditLog({ action: 'UPDATE_RFQ_STATUS', resource: 'RFQ', getResourceId: (r) => r.params.id }) as unknown as RequestHandler,
  ctrl.updateRFQStatus as unknown as RequestHandler,
);

export default router;
