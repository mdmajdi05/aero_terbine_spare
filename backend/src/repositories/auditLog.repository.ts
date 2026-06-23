import type { PrismaClient, AuditLog, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class AuditLogRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findAll(
    page: number,
    limit: number,
    filters: { action?: string; status?: string; userId?: string } = {},
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: Prisma.AuditLogWhereInput[] = [];
    if (filters.action) conditions.push({ action:  { contains: filters.action, mode: 'insensitive' } });
    if (filters.status) conditions.push({ status:  filters.status as Prisma.EnumAuditStatusFilter });
    if (filters.userId) conditions.push({ userId:  filters.userId });

    const where: Prisma.AuditLogWhereInput = conditions.length ? { AND: conditions } : {};

    const [logs, total] = await Promise.all([
      this.db.auditLog.findMany({ where, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.auditLog.count({ where }),
    ]);
    return { logs, total };
  }

  async findAll_noPage(): Promise<AuditLog[]> {
    return this.db.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async deleteAll(): Promise<number> {
    const { count } = await this.db.auditLog.deleteMany();
    return count;
  }
}
