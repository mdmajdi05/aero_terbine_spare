import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';
import type { UserRole } from '@prisma/client';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  User:       1,
  Trader:     2,
  Admin:      3,
  SuperAdmin: 4,
};

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated' });
      return;
    }
    const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const allowed   = roles.some((r) => userLevel >= ROLE_HIERARCHY[r]);
    if (!allowed) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}

export const requireAdmin      = requireRole('Admin');
export const requireSuperAdmin = requireRole('SuperAdmin');
export const requireTrader     = requireRole('Trader');
