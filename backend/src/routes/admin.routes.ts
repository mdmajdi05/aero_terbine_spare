import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';
import type { RequestHandler } from 'express';

const router = Router();
const auth  = authenticate as RequestHandler;
const admin = requireAdmin as RequestHandler;

router.get('/stats',              auth, admin, ctrl.getAdminStats  as RequestHandler);
router.get('/users',              auth, admin, ctrl.listUsers      as RequestHandler);
router.post('/users/create',      auth, admin, ctrl.createUser     as unknown as RequestHandler);
router.post('/users/:id/reset-password', auth, admin, ctrl.resetUserPassword as unknown as RequestHandler);
router.put('/users/:id/change-email',    auth, admin, ctrl.changeUserEmail   as unknown as RequestHandler);
router.put('/users/:id',          auth, admin,
  auditLog({ action: 'ADMIN_UPDATE_USER', resource: 'User', getResourceId: (r) => r.params.id }) as unknown as RequestHandler,
  ctrl.updateUser as unknown as RequestHandler,
);
router.post('/users/:id/suspend', auth, admin,
  auditLog({ action: 'ADMIN_SUSPEND_USER', resource: 'User', getResourceId: (r) => r.params.id }) as unknown as RequestHandler,
  ctrl.suspendUser as unknown as RequestHandler,
);
router.get('/parts',              auth, admin, ctrl.listParts      as RequestHandler);
router.post('/import/parts',      auth, admin, ctrl.importParts    as RequestHandler);
router.get('/export/:target',     auth, admin, ctrl.exportData     as unknown as RequestHandler);

export default router;
