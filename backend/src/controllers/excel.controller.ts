import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import type { Prisma } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

// ── Types ─────────────────────────────────────────────────────
interface ExcelRow {
  partNumber?: string; nsn?: string; cage?: string;
  description?: string; shortDescription?: string;
  manufacturer?: string; category?: string;
  condition?: string; stockStatus?: string;
  quantityAvailable?: number | string;
  unitPrice?: number | string;
  fsg?: string; fsc?: string;
  [key: string]: unknown;
}

const STOCK_DISPLAY: Record<string, string> = {
  InStock: 'In Stock', OnOrder: 'On Order',
  Obsolete: 'Obsolete', Limited: 'Limited',
  'In Stock': 'In Stock', 'On Order': 'On Order',
};

function normalizeRow(r: ExcelRow): ExcelRow {
  const stockRaw = String(r.stockStatus || 'In Stock');
  return {
    ...r,
    stockStatus: STOCK_DISPLAY[stockRaw] ?? stockRaw,
    quantityAvailable: Number(r.quantityAvailable) || 0,
    unitPrice:         Number(r.unitPrice) || 0,
    id: `excel-${r.partNumber || r.nsn || Math.random().toString(36).slice(2)}`,
    _source: 'excel',
  };
}

function detectColumns(rows: Record<string, unknown>[]): string[] {
  const cols = new Set<string>();
  for (const row of rows) Object.keys(row).forEach(k => cols.add(k));
  return Array.from(cols).filter(k => !['id', '_source', '_feedId'].includes(k));
}

// ── GET /admin/excel/status ───────────────────────────────────
export async function getStatus(_req: Request, res: Response): Promise<void> {
  try {
    const feeds = await prisma.excelFeed.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json({ success: true, data: feeds });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── GET /admin/excel/list ─────────────────────────────────────
export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const feeds = await prisma.excelFeed.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json({ success: true, data: feeds, total: feeds.length });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── POST /admin/excel/connect ─────────────────────────────────
export async function connect(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { filename, rows, type, categorySlug, categoryName, industrySlug, columns } = req.body as {
      filename: string; rows: ExcelRow[];
      type?: string; categorySlug?: string; categoryName?: string; industrySlug?: string; columns?: string[];
    };
    if (!filename || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ success: false, error: 'filename and rows[] required' });
      return;
    }

    const autoColumns = columns ?? detectColumns(rows as Record<string, unknown>[]);
    const normalized = rows.map(normalizeRow);

    const feed = await prisma.excelFeed.create({
      data: {
        filename,
        rowCount: normalized.length,
        data: normalized as unknown as Prisma.InputJsonValue,
        status: 'active',
        type: type ?? null,
        categorySlug: categorySlug ?? null,
        categoryName: categoryName ?? null,
        industrySlug: industrySlug ?? null,
        columns: autoColumns as unknown as Prisma.InputJsonValue,
        uploadedBy: req.user.email,
      },
    });

    res.json({ success: true, data: feed, message: `${normalized.length} rows connected from "${filename}"` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── PATCH /admin/excel/toggle/:id ─────────────────────────────
export async function toggle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const feed = await prisma.excelFeed.findUnique({ where: { id } });
    if (!feed) { res.status(404).json({ success: false, error: 'Excel feed not found' }); return; }

    const newStatus = feed.status === 'active' ? 'paused' : 'active';
    const updated = await prisma.excelFeed.update({
      where: { id },
      data: { status: newStatus },
    });
    res.json({ success: true, data: updated, message: `Feed ${newStatus}` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── PATCH /admin/excel/update/:id ─────────────────────────────
export async function updateFeed(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { filename, type, categorySlug, categoryName, industrySlug, status, columns, rows } = req.body as {
      filename?: string; type?: string; categorySlug?: string;
      categoryName?: string; industrySlug?: string; status?: string; columns?: string[];
      rows?: Record<string, unknown>[];
    };

    const existing = await prisma.excelFeed.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ success: false, error: 'Excel feed not found' }); return; }

    const updateData: Record<string, unknown> = {};
    if (filename !== undefined) updateData.filename = filename;
    if (type !== undefined) updateData.type = type;
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (industrySlug !== undefined) updateData.industrySlug = industrySlug;
    if (status !== undefined) updateData.status = status;
    if (columns !== undefined) updateData.columns = columns as unknown as Prisma.InputJsonValue;
    if (rows !== undefined) {
      updateData.data = rows as unknown as Prisma.InputJsonValue;
      updateData.rowCount = rows.length;
    }

    const updated = await prisma.excelFeed.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated, message: rows ? `${rows.length} rows saved` : 'Feed updated' });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── DELETE /admin/excel/disconnect/:id ────────────────────────
export async function disconnect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const feed = await prisma.excelFeed.findUnique({ where: { id } });
    if (!feed) { res.status(404).json({ success: false, error: 'Excel feed not found' }); return; }

    await prisma.excelFeed.delete({ where: { id } });
    res.json({ success: true, message: `Feed "${feed.filename}" disconnected and data cleared` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── GET /admin/excel/rows/:id ────────────────────────────────
export async function getRows(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const feed = await prisma.excelFeed.findUnique({ where: { id } });
    if (!feed) { res.json({ success: true, data: [], total: 0 }); return; }
    const rows = feed.data as ExcelRow[];
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const limit = Math.min(500, Math.max(1, parseInt(String(req.query.limit ?? '100'), 10)));
    const start = (page - 1) * limit;
    const pageData = rows.slice(start, start + limit);
    res.json({ success: true, data: pageData, total: rows.length, status: feed.status });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── POST /admin/excel/draft ──────────────────────────────────
export async function saveDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { draftKey, rows } = req.body as { draftKey?: string; rows?: Record<string, unknown>[] };
    if (!draftKey || !Array.isArray(rows)) {
      res.status(400).json({ success: false, error: 'draftKey and rows[] required' });
      return;
    }
    const draftsDir = path.join(process.cwd(), 'data', 'drafts');
    await fs.mkdir(draftsDir, { recursive: true });
    const filePath = path.join(draftsDir, `${draftKey}.json`);
    await fs.writeFile(filePath, JSON.stringify(rows, null, 2), 'utf-8');
    res.json({ success: true, message: 'Draft saved' });
  } catch (err: unknown) {
    console.error('saveDraft error:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── GET /admin/excel/draft/:draftKey ──────────────────────────
export async function loadDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { draftKey } = req.params;
    const draftsDir = path.join(process.cwd(), 'data', 'drafts');
    const filePath = path.join(draftsDir, `${draftKey}.json`);
    try {
      await fs.access(filePath);
    } catch {
      res.json({ success: true, data: [] });
      return;
    }
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw) as Record<string, unknown>[];
    res.json({ success: true, data });
  } catch (err: unknown) {
    console.error('loadDraft error:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── DELETE /admin/excel/draft/:draftKey ───────────────────────
export async function deleteDraft(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { draftKey } = req.params;
    const draftsDir = path.join(process.cwd(), 'data', 'drafts');
    const filePath = path.join(draftsDir, `${draftKey}.json`);
    try {
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist — nothing to delete
    }
    res.json({ success: true, message: 'Draft cleared' });
  } catch (err: unknown) {
    console.error('deleteDraft error:', err);
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}
