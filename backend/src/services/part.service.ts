import { prisma } from '../config/database';
import { PartRepository } from '../repositories/part.repository';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { Prisma } from '@prisma/client';

const repo = new PartRepository(prisma);

type AnyRow = Record<string, unknown>;

// Display format → Prisma enum (catalog sends display strings)
const DISPLAY_TO_ENUM: Record<string, string> = {
  'In Stock': 'InStock', 'On Order': 'OnOrder',
  'InStock': 'InStock',  'OnOrder': 'OnOrder',
  'Obsolete': 'Obsolete', 'Limited': 'Limited',
};

export async function listParts(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const searchStr    = String(query.search ?? '').toLowerCase();
  const categoryStr  = query.category    ? String(query.category)    : undefined;
  const typeStr      = query.type        ? String(query.type)        : undefined;
  const industryStr  = query.industry    ? String(query.industry)    : undefined;
  const rawStock     = query.stockStatus ? String(query.stockStatus) : undefined;
  const dbStock      = rawStock ? (DISPLAY_TO_ENUM[rawStock] ?? rawStock) : undefined;
  const fsgStr       = query.fsg         ? String(query.fsg)         : undefined;
  const conditionStr = query.condition   ? String(query.condition)   : undefined;
  const cageStr      = query.cage        ? String(query.cage)        : undefined;

  const { parts: dbParts, total: dbTotal } = await repo.findAll(page, limit, {
    search:      searchStr,
    category:    categoryStr,
    stockStatus: dbStock,
    fsg:         fsgStr,
    condition:   conditionStr,
    cage:        cageStr,
  });

  // ── Merge active Excel feed rows from ALL matching feeds ─────
  let excelRows: AnyRow[] = [];
  try {
    const feedFilter: Prisma.ExcelFeedWhereInput = { status: 'active' };
    if (typeStr)      feedFilter.type = typeStr;
    if (categoryStr)  feedFilter.categorySlug = categoryStr;
    if (industryStr)  feedFilter.industrySlug = industryStr;

    const feeds = await prisma.excelFeed.findMany({
      where: feedFilter,
      orderBy: { uploadedAt: 'desc' },
    });

    for (const feed of feeds) {
      const rows = (feed.data as AnyRow[]).filter((r) => {
        if (searchStr) {
          const hay = `${r.partNumber} ${r.description} ${r.nsn} ${r.manufacturer} ${r.cage}`.toLowerCase();
          if (!hay.includes(searchStr)) return false;
        }
        if (fsgStr       && r.fsg         !== fsgStr)        return false;
        if (conditionStr && r.condition   !== conditionStr)  return false;
        if (cageStr      && !String(r.cage ?? '').toLowerCase().includes(cageStr.toLowerCase())) return false;
        if (rawStock     && r.stockStatus !== rawStock)      return false;
        return true;
      });

      const rowsWithFeed = rows.map((r) => ({
        ...r,
        _feedId: feed.id,
        _feedCategory: feed.categorySlug ?? null,
      }));

      excelRows.push(...rowsWithFeed);
    }
  } catch (_) {
    // ExcelFeed table may not exist yet — silently skip
  }

  if (excelRows.length === 0) {
    return { success: true as const, data: dbParts, pagination: buildMeta(dbTotal, page, limit) };
  }

  // Excel rows come first, then DB rows
  const allData   = [...excelRows, ...(dbParts as unknown as AnyRow[])];
  const totalAll  = excelRows.length + dbTotal;
  const pageData  = allData.slice((page - 1) * limit, page * limit);

  return { success: true as const, data: pageData, pagination: buildMeta(totalAll, page, limit) };
}

export async function getPart(id: string) {
  const part = await repo.findById(id) ?? await repo.findByNsn(id);
  if (!part) throw Object.assign(new Error('Part not found'), { status: 404 });
  return { success: true as const, data: part };
}

export async function createPart(data: Prisma.PartCreateInput) {
  const part = await repo.create(data);
  return { success: true as const, data: part };
}

export async function updatePart(id: string, data: Prisma.PartUpdateInput) {
  const part = await repo.update(id, data);
  return { success: true as const, data: part };
}

export async function deletePart(id: string) {
  await repo.delete(id);
  return { success: true as const, message: 'Part deleted' };
}

export async function getStockSummary() {
  const counts = await repo.countByStockStatus();
  const allParts = await repo.findAll_noPage();
  const totalValue = allParts.reduce((acc, p) => acc + Number(p.unitPrice) * p.quantityAvailable, 0);
  return { success: true as const, data: { counts, totalValue } };
}
