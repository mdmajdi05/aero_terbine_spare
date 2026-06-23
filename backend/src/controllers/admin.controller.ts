import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { UserRepository } from '../repositories/user.repository';
import { PartRepository } from '../repositories/part.repository';
import { parsePagination, buildMeta } from '../utils/pagination';
import * as exportService from '../services/export.service';
import type { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const userRepo = new UserRepository(prisma);
const partRepo = new PartRepository(prisma);

export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  try {
    const [totalUsers, totalRFQs, totalParts, orders] = await Promise.all([
      prisma.user.count(),
      prisma.rFQ.count(),
      prisma.part.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);
    const monthlyRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    res.json({ success: true, data: { totalUsers, totalRFQs, totalParts, monthlyRevenue } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listUsers(req: Request, res: Response): Promise<void> {
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

export async function updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { role, isActive } = req.body as { role?: UserRole; isActive?: boolean };
    let user = await userRepo.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
    if (role)            user = await userRepo.updateRole(req.params.id, role);
    if (isActive !== undefined) user = await userRepo.setActive(req.params.id, isActive);
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function suspendUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await userRepo.setActive(req.params.id, false);
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listParts(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { parts, total } = await partRepo.findAll(page, limit, { search: req.query.search as string });
    res.json({ success: true, data: parts, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function importParts(req: Request, res: Response): Promise<void> {
  try {
    const rows = req.body as Array<{ nsn: string; partNumber: string; description: string; shortDescription: string; fsg: string; fsc: string; category: string; manufacturer: string; quantityAvailable?: number; unitPrice?: number }>;
    if (!Array.isArray(rows)) { res.status(400).json({ success: false, error: 'Body must be an array of parts' }); return; }

    let imported = 0;
    for (const row of rows) {
      await partRepo.upsert({
        nsn:              row.nsn,
        cage:             row.fsc ?? '',
        partNumber:       row.partNumber,
        description:      row.description,
        shortDescription: row.shortDescription,
        fsg:              row.fsg,
        fsc:              row.fsc,
        category:         row.category,
        manufacturer:     row.manufacturer,
        quantityAvailable: row.quantityAvailable ?? 0,
        unitPrice:         row.unitPrice ?? 0,
      });
      imported++;
    }
    res.json({ success: true, data: { imported } });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const target = req.params.target as 'users' | 'rfqs' | 'parts';
    const format = (req.query.format as 'json' | 'csv') ?? 'json';

    let result: { content: string; filename: string; mime: string };
    if (target === 'users')      result = await exportService.exportUsers(format);
    else if (target === 'rfqs')  result = await exportService.exportRFQs(format);
    else if (target === 'parts') result = await exportService.exportParts(format);
    else { res.status(400).json({ success: false, error: 'Invalid export target' }); return; }

    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Type', result.mime);
    res.send(result.content);
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}



export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user.role !== 'SuperAdmin') {
      res.status(403).json({ success: false, error: 'SuperAdmin only' }); return;
    }
    const { email, password, fullName, company, phone, role, country, cageCode } =
      req.body as { email: string; password: string; fullName: string; company: string; phone?: string; role?: UserRole; country?: string; cageCode?: string };
    const existing = await userRepo.findByEmail(email);
    if (existing) { res.status(409).json({ success: false, error: 'Email already in use' }); return; }
    const passwordHash = await bcrypt.hash(password || 'Password@2025!', 12);
    const user = await prisma.user.create({
      data: {
        email, passwordHash, fullName,
        company: company || 'AeroTurbineSpare',
        phone: phone || '',
        role: role || 'User',
        country: country || 'United States',
        cageCode,
      },
    });
    const { passwordHash: _, ...safe } = user;
    res.status(201).json({ success: true, data: safe, message: 'User created successfully' });
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { newPassword } = req.body as { newPassword: string };
    if (!newPassword) { res.status(400).json({ success: false, error: 'newPassword required' }); return; }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, data: safe, message: 'Password reset successfully' });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function changeUserEmail(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ success: false, error: 'email required' }); return; }
    const clash = await prisma.user.findUnique({ where: { email } });
    if (clash && clash.id !== req.params.id) {
      res.status(409).json({ success: false, error: 'Email already in use' }); return;
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { email } });
    const { passwordHash: _, ...safe } = user;
    res.json({ success: true, data: safe, message: 'Email updated successfully' });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}




