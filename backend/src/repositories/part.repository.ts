import type { PrismaClient, Part, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class PartRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findById(id: string): Promise<Part | null> {
    return this.db.part.findUnique({ where: { id } });
  }

  async findByNsn(nsn: string): Promise<Part | null> {
    return this.db.part.findUnique({ where: { nsn } });
  }

  async findAll(
    page: number,
    limit: number,
    filters: { search?: string; category?: string; stockStatus?: string } = {},
  ): Promise<{ parts: Part[]; total: number }> {
    const conditions: Prisma.PartWhereInput[] = [];

    if (filters.search) {
      conditions.push({
        OR: [
          { nsn:         { contains: filters.search, mode: 'insensitive' } },
          { partNumber:  { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { manufacturer:{ contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.category)    conditions.push({ category:    filters.category });
    if (filters.stockStatus) conditions.push({ stockStatus: filters.stockStatus as Prisma.EnumStockStatusFilter });

    const where: Prisma.PartWhereInput = conditions.length ? { AND: conditions } : {};

    const [parts, total] = await Promise.all([
      this.db.part.findMany({ where, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.part.count({ where }),
    ]);
    return { parts, total };
  }

  async create(data: Prisma.PartCreateInput): Promise<Part> {
    return this.db.part.create({ data });
  }

  async upsert(data: Prisma.PartCreateInput): Promise<Part> {
    return this.db.part.upsert({
      where:  { nsn: data.nsn },
      create: data,
      update: { ...data },
    });
  }

  async update(id: string, data: Prisma.PartUpdateInput): Promise<Part> {
    return this.db.part.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.part.delete({ where: { id } });
  }

  async countByStockStatus(): Promise<Record<string, number>> {
    const rows = await this.db.part.groupBy({ by: ['stockStatus'], _count: true });
    return Object.fromEntries(rows.map((r) => [r.stockStatus, r._count]));
  }

  async findAll_noPage(): Promise<Part[]> {
    return this.db.part.findMany({ orderBy: { nsn: 'asc' } });
  }
}
