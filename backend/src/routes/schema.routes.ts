import { Router } from 'express';
import type { RequestHandler } from 'express';
import { authenticate } from '../middleware/auth';
import { requireContentManager } from '../middleware/blogRbac';
import * as schemaCtrl from '../controllers/schema.controller';

const router = Router();

router.use(authenticate as RequestHandler);
router.use(requireContentManager as RequestHandler);

router.get('/', schemaCtrl.listSchemas as unknown as RequestHandler);
router.get('/:pageKey', schemaCtrl.getSchema as unknown as RequestHandler);
router.put('/:pageKey', schemaCtrl.upsertSchema as unknown as RequestHandler);
router.delete('/:pageKey', schemaCtrl.deleteSchema as unknown as RequestHandler);

export default router;
