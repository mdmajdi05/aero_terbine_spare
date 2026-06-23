import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import * as partService from '../services/part.service';
import type { Prisma } from '@prisma/client';

export async function listParts(req: Request, res: Response): Promise<void> {
  try {
    const result = await partService.listParts(req.query as Record<string, unknown>);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function getPart(req: Request, res: Response): Promise<void> {
  try {
    const result = await partService.getPart(req.params.id);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function createPart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const data = { ...(req.body as Prisma.PartCreateInput), submittedById: req.user.sub };
    const result = await partService.createPart(data);
    res.status(201).json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function updatePart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await partService.updatePart(req.params.id, req.body as Prisma.PartUpdateInput);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function deletePart(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await partService.deletePart(req.params.id);
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}

export async function getMyParts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { prisma } = await import('../config/database');
    const { parsePagination, buildMeta } = await import('../utils/pagination');
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const where = { submittedById: req.user.sub };
    const [parts, total] = await Promise.all([
      prisma.part.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.part.count({ where }),
    ]);
    res.json({ success: true, data: parts, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getStockSummary(_req: Request, res: Response): Promise<void> {
  try {
    const result = await partService.getStockSummary();
    res.json(result);
  } catch (err: unknown) {
    const e = err as { message: string; status?: number };
    res.status(e.status ?? 500).json({ success: false, error: e.message });
  }
}
