import { Router } from 'express';
import * as ctrl from '../controllers/excel.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import type { RequestHandler } from 'express';

const router = Router();
const auth  = authenticate  as RequestHandler;
const admin = requireAdmin  as RequestHandler;

router.get('/status',        auth, admin, ctrl.getStatus   as RequestHandler);
router.get('/list',          auth, admin, ctrl.list        as RequestHandler);
router.post('/connect',      auth, admin, ctrl.connect     as unknown as RequestHandler);
router.get('/rows/:id',      auth, admin, ctrl.getRows     as RequestHandler);
router.patch('/toggle/:id',  auth, admin, ctrl.toggle      as RequestHandler);
router.patch('/update/:id',  auth, admin, ctrl.updateFeed  as unknown as RequestHandler);
router.delete('/disconnect/:id', auth, admin, ctrl.disconnect as RequestHandler);
router.post('/draft',          auth, admin, ctrl.saveDraft   as unknown as RequestHandler);
router.get('/draft/:draftKey', auth, admin, ctrl.loadDraft   as unknown as RequestHandler);
router.delete('/draft/:draftKey', auth, admin, ctrl.deleteDraft as unknown as RequestHandler);

export default router;
