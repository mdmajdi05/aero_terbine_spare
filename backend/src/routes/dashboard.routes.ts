import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';
import type { RequestHandler } from 'express';

const router = Router();

const auth = authenticate as RequestHandler;

router.get('/stats',          auth, ctrl.getDashboardStats as unknown as RequestHandler);
router.get('/saved-parts',    auth, ctrl.getSavedParts     as unknown as RequestHandler);
router.post('/saved-parts',   auth, ctrl.savePart          as unknown as RequestHandler);
router.delete('/saved-parts/:partId', auth, ctrl.unsavePart as unknown as RequestHandler);
router.get('/orders',         auth, ctrl.getOrders         as unknown as RequestHandler);

export default router;
