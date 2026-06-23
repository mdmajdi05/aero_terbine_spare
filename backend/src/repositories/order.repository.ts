import type { PrismaClient, Order, Prisma, OrderStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { buildSkipTake } from '../utils/pagination';

export class OrderRepository extends BaseRepository {
  constructor(db: PrismaClient) { super(db); }

  async findById(id: string) {
    return this.db.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { id: true, email: true, fullName: true } } },
    });
  }

  async findByUser(userId: string, page: number, limit: number) {
    const where = { userId };
    const [orders, total] = await Promise.all([
      this.db.order.findMany({ where, include: { items: true }, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.order.count({ where }),
    ]);
    return { orders, total };
  }

  async findAll(page: number, limit: number, status?: OrderStatus) {
    const where: Prisma.OrderWhereInput = status ? { status } : {};
    const [orders, total] = await Promise.all([
      this.db.order.findMany({ where, include: { items: true }, ...buildSkipTake(page, limit), orderBy: { createdAt: 'desc' } }),
      this.db.order.count({ where }),
    ]);
    return { orders, total };
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return this.db.order.create({ data, include: { items: true } } as Prisma.OrderCreateArgs) as unknown as Order;
  }

  async updateStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<Order> {
    return this.db.order.update({
      where: { id },
      data: { status, ...(trackingNumber ? { trackingNumber } : {}) },
    });
  }
}
