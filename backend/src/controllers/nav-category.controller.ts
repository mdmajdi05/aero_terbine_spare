import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_JSON_PATH = path.join(__dirname, '..', '..', '..', 'public', 'data', 'categories.json');
const SEED_DATA_PATH = path.join(__dirname, '..', '..', '..', 'src', 'data', 'categories.json');
const SEED_INDUSTRIES_PATH = path.join(__dirname, '..', '..', '..', 'src', 'data', 'industries.json');

// ── Helpers ─────────────────────────────────────────────────────
interface NavCategoryRow {
  id: string; name: string; slug: string; type: string;
  parentId: string | null; description: string | null; icon: string | null;
  manufacturer: string | null; partCount: number; sortOrder: number;
  longDescription: string | null; keyParts: string[]; clients: string[];
  fsgCode: string | null; fscCode: string | null; industryIds: string[];
  cardConfig: Record<string, unknown> | null;
  pageConfig: Record<string, unknown> | null;
}

async function getAllCategories(): Promise<NavCategoryRow[]> {
  return prisma.navCategory.findMany({ orderBy: { sortOrder: 'asc' } }) as unknown as NavCategoryRow[];
}

export async function regeneratePublicJson(): Promise<void> {
  const all = await getAllCategories();

  const fsgCategories = all
    .filter(n => n.type === 'fsg')
    .map(n => ({ id: n.id, name: n.name, fsg: n.fsgCode ?? '', fsc: n.fscCode ?? undefined, description: n.description ?? undefined, icon: n.icon ?? undefined, partCount: n.partCount }));

  const industries = all
    .filter(n => n.type === 'industry')
    .map(n => ({ id: n.id, name: n.name, slug: n.slug, icon: n.icon ?? undefined, description: n.description ?? undefined, longDescription: n.longDescription ?? undefined, partCount: n.partCount, keyParts: n.keyParts.length ? n.keyParts : undefined, clients: n.clients.length ? n.clients : undefined }));

  // Single batch query instead of N+1
  const allItems = await prisma.categoryItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  const itemsByCat = new Map<string, typeof allItems>();
  for (const item of allItems) {
    const arr = itemsByCat.get(item.navCategoryId) ?? [];
    arr.push(item);
    itemsByCat.set(item.navCategoryId, arr);
  }

  const attachItems = (list: NavCategoryRow[]) => list.map((n) => ({
    id: n.id, name: n.name, slug: n.slug, type: n.type as 'product' | 'part',
    parentId: n.parentId ?? undefined,
    industryIds: n.industryIds.length ? n.industryIds : undefined,
    manufacturer: n.manufacturer ?? undefined,
    description: n.description ?? undefined,
    icon: n.icon ?? undefined,
    partCount: n.partCount,
    sortOrder: n.sortOrder,
    cardConfig: n.cardConfig ?? undefined,
    pageConfig: n.pageConfig ?? undefined,
    items: itemsByCat.get(n.id)?.length ? itemsByCat.get(n.id) : undefined,
  }));

  const productCategories = attachItems(all.filter(n => n.type === 'product'));
  const partCategories = attachItems(all.filter(n => n.type === 'part'));

  const tree = { fsgCategories, industries, productCategories, partCategories };

  const dir = path.dirname(PUBLIC_JSON_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PUBLIC_JSON_PATH, JSON.stringify(tree, null, 2), 'utf-8');
}

// ── Public GET endpoints ─────────────────────────────────────────
export async function getFsgCategories(_req: Request, res: Response): Promise<void> {
  try {
    const all = await getAllCategories();
    const data = all.filter(n => n.type === 'fsg').map(n => ({
      id: n.id, name: n.name, fsg: n.fsgCode ?? '', fsc: n.fscCode ?? undefined,
      description: n.description ?? undefined, icon: n.icon ?? undefined, partCount: n.partCount,
    }));
    res.json({ success: true, data });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function getIndustries(_req: Request, res: Response): Promise<void> {
  try {
    const all = await getAllCategories();
    const data = all.filter(n => n.type === 'industry').map(n => ({
      id: n.id, name: n.name, slug: n.slug, icon: n.icon ?? undefined,
      description: n.description ?? undefined, longDescription: n.longDescription ?? undefined,
      partCount: n.partCount, keyParts: n.keyParts.length ? n.keyParts : undefined,
      clients: n.clients.length ? n.clients : undefined,
    }));
    res.json({ success: true, data });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function getIndustryBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const all = await getAllCategories();
    const found = all.find(n => n.type === 'industry' && n.slug === slug);
    if (!found) {
      res.status(404).json({ success: false, error: 'Industry not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: found.id, name: found.name, slug: found.slug, icon: found.icon ?? undefined,
        description: found.description ?? undefined, longDescription: found.longDescription ?? undefined,
        partCount: found.partCount, keyParts: found.keyParts.length ? found.keyParts : undefined,
        clients: found.clients.length ? found.clients : undefined,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function getTree(_req: Request, res: Response): Promise<void> {
  try {
    const all = await getAllCategories();

    const fsgCategories = all.filter(n => n.type === 'fsg').map(n => ({
      id: n.id, name: n.name, fsg: n.fsgCode ?? '', fsc: n.fscCode ?? undefined,
      description: n.description ?? undefined, icon: n.icon ?? undefined, partCount: n.partCount,
    }));

    const industries = all.filter(n => n.type === 'industry').map(n => ({
      id: n.id, name: n.name, slug: n.slug, icon: n.icon ?? undefined,
      description: n.description ?? undefined, longDescription: n.longDescription ?? undefined,
      partCount: n.partCount, keyParts: n.keyParts.length ? n.keyParts : undefined,
      clients: n.clients.length ? n.clients : undefined,
    }));

    // Single batch query instead of N+1
    const allItems = await prisma.categoryItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const itemsByCat = new Map<string, typeof allItems>();
    for (const item of allItems) {
      const arr = itemsByCat.get(item.navCategoryId) ?? [];
      arr.push(item);
      itemsByCat.set(item.navCategoryId, arr);
    }

    const attachItems = (list: NavCategoryRow[]) => list.map((n) => ({
      id: n.id, name: n.name, slug: n.slug, type: n.type as 'product' | 'part',
      parentId: n.parentId ?? undefined,
      industryIds: n.industryIds.length ? n.industryIds : undefined,
      manufacturer: n.manufacturer ?? undefined,
      description: n.description ?? undefined,
      icon: n.icon ?? undefined,
      partCount: n.partCount,
      sortOrder: n.sortOrder,
      cardConfig: n.cardConfig ?? undefined,
      pageConfig: n.pageConfig ?? undefined,
      items: itemsByCat.get(n.id)?.length ? itemsByCat.get(n.id) : undefined,
    }));

    const productCategories = attachItems(all.filter(n => n.type === 'product'));
    const partCategories = attachItems(all.filter(n => n.type === 'part'));

    res.json({ success: true, data: { fsgCategories, industries, productCategories, partCategories } });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── Admin CRUD ───────────────────────────────────────────────────
export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, slug, type, parentId, description, icon, manufacturer, sortOrder, fsgCode, fscCode, longDescription, keyParts, clients, industryIds, cardConfig, pageConfig } = req.body as Record<string, unknown>;
    if (!name || !slug || !type) {
      res.status(400).json({ success: false, error: 'name, slug, and type are required' });
      return;
    }

    const record = await prisma.navCategory.create({
      data: {
        name: name as string, slug: slug as string, type: type as string,
        parentId: (parentId as string) ?? null, description: (description as string) ?? null,
        icon: (icon as string) ?? null, manufacturer: (manufacturer as string) ?? null,
        sortOrder: (sortOrder as number) ?? 0,
        fsgCode: (fsgCode as string) ?? null, fscCode: (fscCode as string) ?? null,
        longDescription: (longDescription as string) ?? null,
        keyParts: Array.isArray(keyParts) ? keyParts : [],
        clients: Array.isArray(clients) ? clients : [],
        industryIds: Array.isArray(industryIds) ? industryIds : [],
        cardConfig: cardConfig ?? {},
        pageConfig: pageConfig ?? {},
      },
    });

    await regeneratePublicJson();
    res.status(201).json({ success: true, data: record });
  } catch (err: unknown) {
    const msg = (err as Error).message;
    if (msg.includes('Unique constraint')) {
      res.status(409).json({ success: false, error: 'A category with this slug already exists' });
      return;
    }
    res.status(500).json({ success: false, error: msg });
  }
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.navCategory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'NavCategory not found' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.type !== undefined) data.type = body.type;
    if (body.parentId !== undefined) data.parentId = body.parentId || null;
    if (body.description !== undefined) data.description = body.description || null;
    if (body.icon !== undefined) data.icon = body.icon || null;
    if (body.manufacturer !== undefined) data.manufacturer = body.manufacturer || null;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    if (body.fsgCode !== undefined) data.fsgCode = body.fsgCode || null;
    if (body.fscCode !== undefined) data.fscCode = body.fscCode || null;
    if (body.longDescription !== undefined) data.longDescription = body.longDescription || null;
    if (body.keyParts !== undefined) data.keyParts = Array.isArray(body.keyParts) ? body.keyParts : [];
    if (body.clients !== undefined) data.clients = Array.isArray(body.clients) ? body.clients : [];
    if (body.industryIds !== undefined) data.industryIds = Array.isArray(body.industryIds) ? body.industryIds : [];
    if (body.cardConfig !== undefined) data.cardConfig = body.cardConfig;
    if (body.pageConfig !== undefined) data.pageConfig = body.pageConfig;

    const record = await prisma.navCategory.update({ where: { id }, data });

    await regeneratePublicJson();
    res.json({ success: true, data: record });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.navCategory.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, error: 'NavCategory not found' });
      return;
    }

    await prisma.navCategory.delete({ where: { id } });
    await regeneratePublicJson();
    res.json({ success: true, message: 'NavCategory deleted' });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

// ── Sync: seed DB from JSON files & regenerate public JSON ──────
export async function syncFromJson(_req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    let seed: { fsgCategories?: unknown[]; industries?: unknown[]; productCategories?: unknown[]; partCategories?: unknown[] } = {};
    if (fs.existsSync(SEED_DATA_PATH)) {
      seed = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));
    }

    let industriesSeed: Record<string, unknown>[] = [];
    if (fs.existsSync(SEED_INDUSTRIES_PATH)) {
      industriesSeed = JSON.parse(fs.readFileSync(SEED_INDUSTRIES_PATH, 'utf-8')) as Record<string, unknown>[];
    }

    const entries: Array<Record<string, unknown>> = [];
    let sortIdx = 0;

    // Map fsgCategories
    for (const c of (seed.fsgCategories ?? [])) {
      const cat = c as Record<string, unknown>;
      entries.push({
        name: cat.name, slug: `fsg-${cat.fsg}`, type: 'fsg',
        fsgCode: cat.fsg, fscCode: cat.fsc ?? null,
        description: cat.description ?? null, icon: cat.icon ?? null,
        partCount: cat.partCount ?? 0, sortOrder: sortIdx++,
        longDescription: null, keyParts: [], clients: [], industryIds: [],
        manufacturer: null, parentId: null,
      });
    }

    // Map industries
    for (const ind of (seed.industries ?? [])) {
      const i = ind as Record<string, unknown>;
      // Check industries.json for enriched data
      const enriched = industriesSeed.find(x => (x as Record<string, unknown>).slug === i.slug) as Record<string, unknown> | undefined;
      entries.push({
        name: i.name, slug: i.slug, type: 'industry',
        description: i.description ?? null,
        longDescription: enriched?.longDescription ?? i.longDescription ?? null,
        icon: i.icon ?? null, partCount: i.partCount ?? 0, sortOrder: sortIdx++,
        keyParts: enriched?.keyParts ?? (i.keyParts ?? []),
        clients: enriched?.clients ?? (i.clients ?? []),
        fsgCode: null, fscCode: null, industryIds: [], manufacturer: null,
        parentId: null,
      });
    }

    // Map productCategories
    for (const c of (seed.productCategories ?? [])) {
      const cat = c as Record<string, unknown>;
      entries.push({
        name: cat.name, slug: cat.slug, type: 'product',
        description: cat.description ?? null, icon: cat.icon ?? null,
        manufacturer: cat.manufacturer ?? null,
        parentId: (cat.parentId as string) ?? null,
        industryIds: Array.isArray(cat.industryIds) ? cat.industryIds : [],
        partCount: cat.partCount ?? 0, sortOrder: sortIdx++,
        fsgCode: null, fscCode: null,
        longDescription: null, keyParts: [], clients: [],
      });
    }

    // Map partCategories
    for (const c of (seed.partCategories ?? [])) {
      const cat = c as Record<string, unknown>;
      entries.push({
        name: cat.name, slug: cat.slug, type: 'part',
        description: cat.description ?? null, icon: cat.icon ?? null,
        manufacturer: cat.manufacturer ?? null,
        parentId: (cat.parentId as string) ?? null,
        industryIds: Array.isArray(cat.industryIds) ? cat.industryIds : [],
        partCount: cat.partCount ?? 0, sortOrder: sortIdx++,
        fsgCode: null, fscCode: null,
        longDescription: null, keyParts: [], clients: [],
      });
    }

    // Clear & re-insert
    await prisma.navCategory.deleteMany();
    for (const entry of entries) {
      await prisma.navCategory.create({ data: entry as never });
    }

    await regeneratePublicJson();
    res.json({ success: true, message: `Synced ${entries.length} categories to database` });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}
