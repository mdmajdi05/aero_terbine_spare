import type { PrismaClient, InventorySubmission, Prisma, InventoryStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class InventorySubmissionRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findById(id: string): Promise<InventorySubmission | null> {
    return this.db.inventorySubmission.findUnique({ where: { id } });
  }

  async findAll(page: number, limit: number) {
    const [submissions, total] = await Promise.all([
      this.db.inventorySubmission.findMany({
        ...buildSkipTake(page, limit),
        orderBy: { submittedAt: 'desc' },
        include: { user: { select: { id: true, email: true, fullName: true } } },
      }),
      this.db.inventorySubmission.count(),
    ]);
    return { submissions, total };
  }

  async create(data: Prisma.InventorySubmissionCreateInput): Promise<InventorySubmission> {
    return this.db.inventorySubmission.create({ data });
  }

  async updateStatus(id: string, status: InventoryStatus, notes?: string): Promise<InventorySubmission> {
    return this.db.inventorySubmission.update({
      where: { id },
      data: {
        status,
        ...(notes ? { notes } : {}),
        ...(status === 'Complete' || status === 'Rejected' ? { processedAt: new Date() } : {}),
      },
    });
  }
}
