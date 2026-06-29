import { Router } from 'express';
import * as ctrl from '../controllers/nav-category.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireSuperAdmin } from '../middleware/rbac';
import type { RequestHandler } from 'express';

const router = Router();
const auth = authenticate as RequestHandler;
const admin = requireAdmin as RequestHandler;
const superAdmin = requireSuperAdmin as RequestHandler;

// Public
router.get('/nav-categories', ctrl.getTree as unknown as RequestHandler);
router.get('/industries', ctrl.getIndustries as unknown as RequestHandler);
router.get('/industries/:slug', ctrl.getIndustryBySlug as unknown as RequestHandler);
router.get('/categories', ctrl.getFsgCategories as unknown as RequestHandler);

// Admin
router.post('/admin/categories', auth, admin, ctrl.create as unknown as RequestHandler);
router.put('/admin/categories/:id', auth, admin, ctrl.update as unknown as RequestHandler);

// Super Admin
router.delete('/admin/categories/:id', auth, superAdmin, ctrl.remove as unknown as RequestHandler);
router.post('/admin/categories/sync', auth, superAdmin, ctrl.syncFromJson as unknown as RequestHandler);

export default router;
