import { Router } from 'express';
import * as ctrl from '../controllers/superadmin.controller';
import { authenticate } from '../middleware/auth';
import { requireSuperAdmin } from '../middleware/rbac';
import { auditLog } from '../middleware/audit';
import type { RequestHandler } from 'express';

const router = Router();
const auth = authenticate     as RequestHandler;
const sa   = requireSuperAdmin as RequestHandler;

router.get('/stats',               auth, sa, ctrl.getSuperAdminStats as unknown as RequestHandler);
router.get('/users',               auth, sa, ctrl.listAllUsers       as unknown as RequestHandler);
router.put('/users/:id/role',      auth, sa,
  auditLog({ action: 'SA_CHANGE_ROLE', resource: 'User', getResourceId: (r) => r.params.id }) as unknown as RequestHandler,
  ctrl.changeUserRole as unknown as RequestHandler,
);
router.get('/audit-logs',          auth, sa, ctrl.listAuditLogs      as unknown as RequestHandler);
router.delete('/audit-logs',       auth, sa,
  auditLog({ action: 'SA_PURGE_AUDIT_LOGS', resource: 'AuditLog' }) as unknown as RequestHandler,
  ctrl.purgeAuditLogs as unknown as RequestHandler,
);
router.get('/settings',            auth, sa, ctrl.getSettings        as unknown as RequestHandler);
router.put('/settings',            auth, sa,
  auditLog({ action: 'SA_UPDATE_SETTINGS', resource: 'SystemSetting' }) as unknown as RequestHandler,
  ctrl.updateSettings as unknown as RequestHandler,
);
router.post('/backup/trigger',     auth, sa,
  auditLog({ action: 'SA_TRIGGER_BACKUP', resource: 'BackupRecord' }) as unknown as RequestHandler,
  ctrl.triggerBackup as unknown as RequestHandler,
);
router.get('/backup/list',         auth, sa, ctrl.listBackups        as unknown as RequestHandler);
router.get('/backup/:id/download', auth, sa, ctrl.downloadBackup     as unknown as RequestHandler);
router.get('/export/master',       auth, sa, ctrl.masterExport       as unknown as RequestHandler);

export default router;
