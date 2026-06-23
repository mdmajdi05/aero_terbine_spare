import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { InventorySubmissionRepository } from '../repositories/inventorySubmission.repository';
import { prisma } from '../config/database';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { InventoryStatus } from '@prisma/client';

const repo = new InventorySubmissionRepository(prisma);

export async function submitInventory(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user?.sub;
    const { companyName, contactEmail, fileName, partCount, notes } = req.body as {
      companyName:  string;
      contactEmail: string;
      fileName:     string;
      partCount?:   number;
      notes?:       string;
    };

    const submission = await repo.create({
      companyName,
      contactEmail,
      fileName,
      partCount,
      notes,
      ...(userId ? { user: { connect: { id: userId } } } : {}),
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listSubmissions(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit } = parsePagination(req.query as Record<string, unknown>);
    const { submissions, total } = await repo.findAll(page, limit);
    res.json({ success: true, data: submissions, pagination: buildMeta(total, page, limit) });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function updateSubmissionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, notes } = req.body as { status: InventoryStatus; notes?: string };
    const submission = await repo.updateStatus(req.params.id, status, notes);
    res.json({ success: true, data: submission });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}
