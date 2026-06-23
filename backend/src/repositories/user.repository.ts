import type { PrismaClient, User, UserRole, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class UserRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findAll(page: number, limit: number, search?: string): Promise<{ users: User[]; total: number }> {
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email:    { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { company:  { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.db.user.findMany({ where, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.user.count({ where }),
    ]);
    return { users, total };
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async updateRole(id: string, role: UserRole): Promise<User> {
    return this.db.user.update({ where: { id }, data: { role } });
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    return this.db.user.update({ where: { id }, data: { isActive } });
  }

  async touchLastLogin(id: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { lastLogin: new Date() } });
  }

  async countByRole(): Promise<Record<UserRole, number>> {
    const rows = await this.db.user.groupBy({ by: ['role'], _count: true });
    const result = { SuperAdmin: 0, Admin: 0, Trader: 0, User: 0 } as Record<UserRole, number>;
    for (const row of rows) result[row.role] = row._count;
    return result;
  }
}
