import { Router } from 'express';
import authRoutes       from './auth.routes';
import partRoutes       from './part.routes';
import rfqRoutes        from './rfq.routes';
import dashboardRoutes  from './dashboard.routes';
import adminRoutes      from './admin.routes';
import superadminRoutes from './superadmin.routes';
import inventoryRoutes  from './inventory.routes';
import configRoutes     from './config.routes';
import excelRoutes      from './excel.routes';
import blogRoutes       from './blog.routes';
import schemaRoutes     from './schema.routes';
import navCategoryRoutes from './nav-category.routes';
import categoryItemRoutes from './category-item.routes';

const router = Router();

router.use('/',            navCategoryRoutes);
router.use('/',            categoryItemRoutes);
router.use('/auth',        authRoutes);
router.use('/parts',       partRoutes);
router.use('/rfqs',        rfqRoutes);
router.use('/dashboard',   dashboardRoutes);
router.use('/admin/excel', excelRoutes);   // ← must be before /admin
router.use('/admin',       adminRoutes);
router.use('/superadmin',  superadminRoutes);
router.use('/inventory',   inventoryRoutes);
router.use('/config',      configRoutes);
router.use('/blog',        blogRoutes);
router.use('/schemas',     schemaRoutes);

router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

export default router;
