import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';

export async function listSchemas(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schemas = await prisma.pageSchema.findMany({ orderBy: { pageKey: 'asc' } });
    res.json({ success: true, data: schemas });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getSchema(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schema = await prisma.pageSchema.findUnique({ where: { pageKey: req.params.pageKey } });
    if (!schema) {
      res.status(404).json({ success: false, error: 'Schema not found' });
      return;
    }
    res.json({ success: true, data: schema });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function upsertSchema(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { pageKey, label, schemaJson, faqItems } = req.body;
    if (!pageKey || !label) {
      res.status(400).json({ success: false, error: 'pageKey and label are required' });
      return;
    }
    const data = await prisma.pageSchema.upsert({
      where: { pageKey },
      create: { pageKey, label, schemaJson: schemaJson ?? null, faqItems: faqItems ?? null, updatedBy: req.user.sub },
      update: { label, schemaJson: schemaJson ?? null, faqItems: faqItems ?? null, updatedBy: req.user.sub },
    });
    res.json({ success: true, data });
  } catch (err: unknown) {
    const e = err as { message: string };
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deleteSchema(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await prisma.pageSchema.delete({ where: { pageKey: req.params.pageKey } });
    res.json({ success: true, data: null });
  } catch (err: unknown) {
    const e = err as { message: string };
    if ((err as { code?: string }).code === 'P2025') {
      res.status(404).json({ success: false, error: 'Schema not found' });
      return;
    }
    res.status(500).json({ success: false, error: e.message });
  }
}
