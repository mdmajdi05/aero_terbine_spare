import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import type { AuditStatus } from '@prisma/client';

interface AuditOptions {
  action:   string;
  resource: string;
  getResourceId?: (req: AuthenticatedRequest) => string | undefined;
  getDetails?:    (req: AuthenticatedRequest) => string | undefined;
}

export function auditLog(opts: AuditOptions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      const status: AuditStatus = res.statusCode < 400 ? 'Success' : 'Failed';

      setImmediate(async () => {
        try {
          if (req.user) {
            await prisma.auditLog.create({
              data: {
                userId:     req.user.sub,
                userEmail:  req.user.email,
                userRole:   req.user.role,
                action:     opts.action,
                resource:   opts.resource,
                resourceId: opts.getResourceId?.(req),
                details:    opts.getDetails?.(req),
                ipAddress:  req.ip,
                userAgent:  req.headers['user-agent'],
                status,
              },
            });
          }
        } catch (err) {
          console.error('Audit log write failed:', err);
        }
      });

      return originalJson(body);
    };

    next();
  };
}
