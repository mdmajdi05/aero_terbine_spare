import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';

// Re-import the public JSON regenerator from nav-category controller
import { regeneratePublicJson } from './nav-category.controller';

// ── Public GET endpoints ─────────────────────────────────────────
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    if (!categoryId) {
      res.status(400).json({ success: false, error: 'query param "categoryId" is required' });
      return;
    }
    const items = await prisma.categoryItem.findMany({
      where: { navCategoryId: categoryId },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: items });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function getBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const item = await prisma.categoryItem.findUnique({ where: { slug } });
    if (!item) {
      res.status(404).json({ success: false, error: 'CategoryItem not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── Admin CRUD ───────────────────────────────────────────────────
export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { navCategoryId, title, slug, description, image, link, data, sortOrder, isActive, cardConfig } = req.body as Record<string, unknown>;
    if (!navCategoryId || !title || !slug) {
      res.status(400).json({ success: false, error: 'navCategoryId, title, and slug are required' });
      return;
    }

    const record = await prisma.categoryItem.create({
      data: {
        navCategoryId: navCategoryId as string,
        title: title as string,
        slug: slug as string,
        description: (description as string) ?? null,
        image: (image as string) ?? null,
        link: (link as string) ?? null,
        data: data ?? {},
        sortOrder: (sortOrder as number) ?? 0,
        isActive: (isActive as boolean) ?? true,
        cardConfig: cardConfig ?? {},
      },
    });

    await regeneratePublicJson();
    res.status(201).json({ success: true, data: record });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    if (msg.includes('Unique constraint')) {
      res.status(409).json({ success: false, error: 'An item with this slug already exists' });
      return;
    }
    res.status(500).json({ success: false, error: msg });
  }
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.categoryItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'CategoryItem not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.navCategoryId !== undefined) data.navCategoryId = body.navCategoryId;
    if (body.title !== undefined) data.title = body.title;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.image !== undefined) data.image = body.image || null;
    if (body.link !== undefined) data.link = body.link || null;
    if (body.data !== undefined) data.data = body.data;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.cardConfig !== undefined) data.cardConfig = body.cardConfig;

    const record = await prisma.categoryItem.update({ where: { id }, data });

    await regeneratePublicJson();
    res.json({ success: true, data: record });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    if (msg.includes('Unique constraint')) {
      res.status(409).json({ success: false, error: 'An item with this slug already exists' });
      return;
    }
    res.status(500).json({ success: false, error: msg });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.categoryItem.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'CategoryItem not found' });
      return;
    }

    await prisma.categoryItem.delete({ where: { id } });
    await regeneratePublicJson();
    res.json({ success: true, message: 'CategoryItem deleted' });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function bulkImport(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    // Support both: plain array [] or wrapped { categoryId, items: [], append: bool }
    let items: Array<Record<string, unknown>>;
    let categoryId: string | undefined;
    let append = false;

    if (Array.isArray(req.body)) {
      items = req.body;
    } else {
      items = (req.body as Record<string, unknown>).items as Array<Record<string, unknown>> || [];
      categoryId = (req.body as Record<string, unknown>).categoryId as string | undefined;
      append = (req.body as Record<string, unknown>).append === true;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Request body must contain a non-empty items array' });
      return;
    }

    // If append mode is off and a categoryId is given, delete existing items first
    if (!append && categoryId) {
      await prisma.categoryItem.deleteMany({ where: { navCategoryId: categoryId } });
    }

    const resolvedCategoryId = categoryId || '';

    // Preserve Excel column order (PostgreSQL JSONB reorders keys alphabetically)
    const columnOrder = items.length > 0
      ? Object.keys(items[0]).filter((k) => !['slug', 'Slug', 'navCategoryId'].includes(k))
      : [];

    // Build all records in one shot — no per-row DB lookups, no assumptions about columns
    const records = items.map((item, idx) => {
      // ALL columns into data as-is (except DB-internal fields)
      const data: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(item)) {
        if (!['slug', 'Slug', 'navCategoryId'].includes(key)) data[key] = val;
      }
      // _columnOrder preserves the original Excel column sequence inside JSONB
      data._columnOrder = columnOrder;

      // Generic title + unique slug — no assumption that Excel has a "title" column
      const slug = (item.slug as string) || (item.Slug as string) || `item-${crypto.randomUUID()}`;

      return {
        navCategoryId: resolvedCategoryId,
        title: `Item ${idx + 1}`,
        slug,
        description: null as string | null,
        image: null as string | null,
        link: null as string | null,
        data: data as any,
        sortOrder: 0,
        isActive: true,
        cardConfig: {},
      };
    });

    await prisma.categoryItem.createMany({ data: records, skipDuplicates: true });
    await regeneratePublicJson();

    res.json({ success: true, data: records.map((r) => ({ slug: r.slug, action: 'created' as const })) });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function bulkDelete(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, error: 'Request body must contain a non-empty ids array' });
      return;
    }

    const { count } = await prisma.categoryItem.deleteMany({ where: { id: { in: ids } } });
    await regeneratePublicJson();
    res.json({ success: true, data: { deleted: count } });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function reorder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const items = req.body as Array<{ id: string; sortOrder: number }>;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Request body must be a non-empty array of { id, sortOrder }' });
      return;
    }

    for (const { id, sortOrder } of items) {
      await prisma.categoryItem.update({ where: { id }, data: { sortOrder } });
    }

    await regeneratePublicJson();
    res.json({ success: true, message: `Reordered ${items.length} items` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}
