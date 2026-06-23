import { Router } from 'express';
import authRoutes       from './auth.routes';
import partRoutes       from './part.routes';
import rfqRoutes        from './rfq.routes';
import dashboardRoutes  from './dashboard.routes';
import adminRoutes      from './admin.routes';
import superadminRoutes from './superadmin.routes';
import inventoryRoutes  from './inventory.routes';
import configRoutes     from './config.routes';

const router = Router();

router.use('/auth',       authRoutes);
router.use('/parts',      partRoutes);
router.use('/rfqs',       rfqRoutes);
router.use('/dashboard',  dashboardRoutes);
router.use('/admin',      adminRoutes);
router.use('/superadmin', superadminRoutes);
router.use('/inventory',  inventoryRoutes);
router.use('/config',     configRoutes);

router.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

export default router;
