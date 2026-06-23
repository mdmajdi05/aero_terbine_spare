import { Router } from 'express';
import * as ctrl from '../controllers/part.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import type { RequestHandler } from 'express';

const router = Router();

router.get( '/',         ctrl.listParts       as RequestHandler);
router.get( '/summary',  ctrl.getStockSummary as RequestHandler);
router.get( '/mine',     authenticate as RequestHandler, ctrl.getMyParts as unknown as RequestHandler);
router.get( '/:id',      ctrl.getPart         as RequestHandler);

router.post(  '/',    authenticate as RequestHandler, requireAdmin as RequestHandler, ctrl.createPart as unknown as RequestHandler);
router.put(   '/:id', authenticate as RequestHandler, requireAdmin as RequestHandler, ctrl.updatePart as unknown as RequestHandler);
router.delete('/:id', authenticate as RequestHandler, requireAdmin as RequestHandler, ctrl.deletePart as unknown as RequestHandler);

export default router;
