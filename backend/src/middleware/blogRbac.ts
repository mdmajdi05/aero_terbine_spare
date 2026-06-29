import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';

// Roles that have full editorial control over blog content
const CONTENT_ROLES = new Set(['SuperAdmin', 'Admin', 'ContentManager']);

export function requireContentManager(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthenticated' });
    return;
  }
  if (!CONTENT_ROLES.has(req.user.role)) {
    res.status(403).json({ success: false, error: 'Insufficient permissions' });
    return;
  }
  next();
}

// Public read — anyone (even unauthenticated) can call this
export function publicRead(
  _req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  next();
}
