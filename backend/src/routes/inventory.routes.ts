import { Router } from 'express';
import * as ctrl from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import type { RequestHandler } from 'express';

const router = Router();

router.post('/',      ctrl.submitInventory  as RequestHandler);
router.get('/',       authenticate as RequestHandler, requireAdmin as RequestHandler, ctrl.listSubmissions       as RequestHandler);
router.put('/:id',    authenticate as RequestHandler, requireAdmin as RequestHandler, ctrl.updateSubmissionStatus as unknown as RequestHandler);

export default router;
