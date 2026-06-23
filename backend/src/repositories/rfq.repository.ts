import type { PrismaClient, RFQ, Prisma, RFQStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class RFQRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findById(id: string) {
    return this.db.rFQ.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, email: true, fullName: true, company: true } } },
    });
  }

  async findByUser(userId: string, page: number, limit: number) {
    const where = { userId };
    const [rfqs, total] = await Promise.all([
      this.db.rFQ.findMany({ where, include: { items: true }, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.rFQ.count({ where }),
    ]);
    return { rfqs, total };
  }

  async findAll(page: number, limit: number, filters: { status?: RFQStatus; search?: string } = {}) {
    const conditions: Prisma.RFQWhereInput[] = [];
    if (filters.status) conditions.push({ status: filters.status });
    if (filters.search) {
      conditions.push({
        OR: [
          { email:       { contains: filters.search, mode: 'insensitive' } },
          { companyName: { contains: filters.search, mode: 'insensitive' } },
          { contactName: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }
    const where: Prisma.RFQWhereInput = conditions.length ? { AND: conditions } : {};

    const [rfqs, total] = await Promise.all([
      this.db.rFQ.findMany({
        where,
        include: { items: true, user: { select: { id: true, email: true, fullName: true, company: true } } },
        ...buildSkipTake(page, limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.db.rFQ.count({ where }),
    ]);
    return { rfqs, total };
  }

  async create(data: Prisma.RFQCreateInput): Promise<RFQ> {
    return this.db.rFQ.create({ data });
  }

  async updateStatus(id: string, status: RFQStatus, extra?: Partial<Prisma.RFQUpdateInput>): Promise<RFQ> {
    return this.db.rFQ.update({ where: { id }, data: { status, ...extra } });
  }

  async countByStatus(): Promise<Record<RFQStatus, number>> {
    const rows = await this.db.rFQ.groupBy({ by: ['status'], _count: true });
    const result = { Pending: 0, UnderReview: 0, Quoted: 0, Accepted: 0, Ordered: 0, Cancelled: 0 } as Record<RFQStatus, number>;
    for (const r of rows) result[r.status] = r._count;
    return result;
  }

  async findAll_noPage() {
    return this.db.rFQ.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
  }
}
