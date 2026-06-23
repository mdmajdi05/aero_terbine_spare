import { prisma } from '../config/database';
import { PartRepository } from '../repositories/part.repository';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { Prisma } from '@prisma/client';

const repo = new PartRepository(prisma);

export async function listParts(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const { parts, total } = await repo.findAll(page, limit, {
    search:      String(query.search ?? ''),
    category:    query.category ? String(query.category) : undefined,
    stockStatus: query.stockStatus ? String(query.stockStatus) : undefined,
  });
  return { success: true as const, data: parts, pagination: buildMeta(total, page, limit) };
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
