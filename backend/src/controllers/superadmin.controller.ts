import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { getCloudinary } from '../config/cloudinary';
import { UserRepository } from '../repositories/user.repository';
import { AuditLogRepository } from '../repositories/auditLog.repository';
import { parsePagination, buildMeta } from '../utils/pagination';
import * as exportService from '../services/export.service';
import type { UserRole } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const userRepo     = new UserRepository(prisma);
const auditLogRepo = new AuditLogRepository(prisma);

export async function getSuperAdminStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [totalUsers, totalRFQs, totalParts, totalOrders, pendingRFQs, auditLogs] = await Promise.all([
      prisma.user.count(),
      prisma.rFQ.count(),
      prisma.part.count(),
      prisma.order.count(),
      prisma.rFQ.count({ where: { status: 'Pending' } }),
      prisma.auditLog.count(),
    ]);
    const roleCounts = await userRepo.countByRole();
    res.json({ success: true, data: { totalUsers, totalRFQs, totalParts, totalOrders, pendingRFQs, auditLogs, roleCounts } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { users, total } = await userRepo.findAll(page, limit, req.query.search as string | undefined);
    const safe = users.map(({ passwordHash: _, ...u }) => u);
    res.json({ success: true, data: safe, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function changeUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { role } = req.body as { role: UserRole };
    const user = await userRepo.updateRole(req.params.id, role);
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { logs, total } = await auditLogRepo.findAll(page, limit, {
      action: req.query.action as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.json({ success: true, data: logs, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getSettings(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const rows = await prisma.systemSetting.findMany();
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({ success: true, data: settings });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const settings = req.body as Record<string, string>;
    const ops = Object.entries(settings).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where:  { key },
        create: { key, value, updatedBy: req.user.email },
        update: { value, updatedBy: req.user.email },
      }),
    );
    await prisma.$transaction(ops);
    res.json({ success: true, message: 'Settings saved' });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function triggerBackup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const record = await prisma.backupRecord.create({
      data: { triggeredBy: req.user.email, type: 'manual', status: 'Running' },
    });

    // Run async — don't await
    exportService.masterExport(req.user.email)
      .then(async (zipPath) => {
        const stat = await fs.promises.stat(zipPath);
        await prisma.backupRecord.update({
          where: { id: record.id },
          data:  { status: 'Complete', sizeBytes: stat.size, downloadUrl: zipPath, completedAt: new Date() },
        });
      })
      .catch(async (err) => {
        await prisma.backupRecord.update({
          where: { id: record.id },
          data:  { status: 'Failed' },
        });
        console.error('Backup failed:', err);
      });

    res.json({ success: true, data: record });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listBackups(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const backups = await prisma.backupRecord.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    res.json({ success: true, data: backups });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function downloadBackup(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const backup = await prisma.backupRecord.findUnique({ where: { id: req.params.id } });
    if (!backup || !backup.downloadUrl) { res.status(404).json({ success: false, error: 'Backup not found' }); return; }
    res.download(path.resolve(backup.downloadUrl));
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function masterExport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const zipPath = await exportService.masterExport(req.user.email);
    res.download(zipPath);
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function purgeAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const deleted = await auditLogRepo.deleteAll();
    res.json({ success: true, data: { deleted } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function testCloudinary(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const cld = await getCloudinary();
    // usage() is a lightweight call that verifies credentials without side effects
    await cld.api.usage();
    res.json({ success: true, message: 'Cloudinary connection successful' });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(400).json({ success: false, error: e.message });
  }
}
