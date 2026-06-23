import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { OrderRepository } from '../repositories/order.repository';
import { RFQRepository } from '../repositories/rfq.repository';
import { parsePagination, buildMeta } from '../utils/pagination';

const orderRepo = new OrderRepository(prisma);
const rfqRepo   = new RFQRepository(prisma);

export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user.sub;

    const [savedParts, rfqCounts, orderCounts, recentOrders] = await Promise.all([
      prisma.savedPart.count({ where: { userId } }),
      rfqRepo.countByStatus(),
      prisma.order.groupBy({ by: ['status'], _count: true, where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        include: { items: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalOrders  = orderCounts.reduce((s, r) => s + r._count, 0);
    const userRFQCount = Object.values(rfqCounts).reduce((s, v) => s + v, 0);

    res.json({
      success: true,
      data: {
        savedParts,
        totalRFQs:    userRFQCount,
        totalOrders,
        recentOrders,
      },
    });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getSavedParts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const userId = req.user.sub;

    const [savedParts, total] = await Promise.all([
      prisma.savedPart.findMany({
        where: { userId },
        include: { part: true },
        skip:  (page - 1) * limit,
        take:  limit,
        orderBy: { savedAt: 'desc' },
      }),
      prisma.savedPart.count({ where: { userId } }),
    ]);

    res.json({ success: true, data: savedParts, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function savePart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { partId } = req.body as { partId: string };
    const saved = await prisma.savedPart.upsert({
      where:  { userId_partId: { userId: req.user.sub, partId } },
      create: { userId: req.user.sub, partId },
      update: {},
    });
    res.json({ success: true, data: saved });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function unsavePart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { partId } = req.params;
    await prisma.savedPart.deleteMany({ where: { userId: req.user.sub, partId } });
    res.json({ success: true, message: 'Part removed from saved list' });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { orders, total } = await orderRepo.findByUser(req.user.sub, page, limit);
    res.json({ success: true, data: orders, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}
