import { Router } from 'express';
import * as ctrl from '../controllers/category-item.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import type { RequestHandler } from 'express';

const router = Router();
const auth = authenticate as RequestHandler;
const admin = requireAdmin as RequestHandler;

// Public
router.get('/category-items', ctrl.list as unknown as RequestHandler);
router.get('/category-items/:slug', ctrl.getBySlug as unknown as RequestHandler);

// Admin
router.post('/admin/category-items', auth, admin, ctrl.create as unknown as RequestHandler);
router.put('/admin/category-items/:id', auth, admin, ctrl.update as unknown as RequestHandler);
router.delete('/admin/category-items/:id', auth, admin, ctrl.remove as unknown as RequestHandler);
router.post('/admin/category-items/bulk-import', auth, admin, ctrl.bulkImport as unknown as RequestHandler);
router.post('/admin/category-items/bulk-delete', auth, admin, ctrl.bulkDelete as unknown as RequestHandler);
router.put('/admin/category-items/reorder', auth, admin, ctrl.reorder as unknown as RequestHandler);

export default router;
