import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../types';

const router = Router();

router.post('/register', authLimiter, ctrl.register as RequestHandler);
router.post('/login',    authLimiter, ctrl.login    as RequestHandler);
router.post('/refresh',              ctrl.refresh   as RequestHandler);

router.get( '/me',              authenticate as RequestHandler, ctrl.getMe           as unknown as RequestHandler);
router.put( '/me',              authenticate as RequestHandler, ctrl.updateMe        as unknown as RequestHandler);
router.post('/me/change-password', authenticate as RequestHandler, ctrl.changePassword as unknown as RequestHandler);

export default router;
