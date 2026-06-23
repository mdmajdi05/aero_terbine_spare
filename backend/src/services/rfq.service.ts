import { prisma } from '../config/database';
import { RFQRepository } from '../repositories/rfq.repository';
import { parsePagination, buildMeta } from '../utils/pagination';
import type { Prisma, RFQStatus, RFQUrgency } from '@prisma/client';
import { sendRFQConfirmation } from './email.service';

const repo = new RFQRepository(prisma);

export interface SubmitRFQInput {
  userId?:             string;
  companyName:         string;
  contactName:         string;
  email:               string;
  phone:               string;
  urgency?:            string;
  deliveryDeadline:    string;
  shippingAddress:     string;
  shippingCountry:     string;
  incoterms?:          string;
  specialInstructions?: string;
  items: Array<{
    partNumber:  string;
    nsn:         string;
    description: string;
    quantity:    number;
    targetPrice?: number;
    condition?:  string;
  }>;
}

export async function submitRFQ(input: SubmitRFQInput) {
  const data: Prisma.RFQCreateInput = {
    companyName:         input.companyName,
    contactName:         input.contactName,
    email:               input.email,
    phone:               input.phone,
    urgency:             (input.urgency ?? 'Standard') as RFQUrgency,
    deliveryDeadline:    new Date(input.deliveryDeadline),
    shippingAddress:     input.shippingAddress,
    shippingCountry:     input.shippingCountry,
    incoterms:           input.incoterms ?? 'EXW',
    specialInstructions: input.specialInstructions,
    ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
    items: {
      create: input.items.map((item) => ({
        partNumber:  item.partNumber,
        nsn:         item.nsn,
        description: item.description,
        quantity:    item.quantity,
        targetPrice: item.targetPrice,
        condition:   item.condition,
      })),
    },
  };

  const rfq = await repo.create(data as unknown as Prisma.RFQCreateInput);
  await sendRFQConfirmation(input.email, rfq.id).catch(() => {});
  return { success: true as const, data: rfq };
}

export async function listUserRFQs(userId: string, query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const { rfqs, total } = await repo.findByUser(userId, page, limit);
  return { success: true as const, data: rfqs, pagination: buildMeta(total, page, limit) };
}

export async function getRFQ(id: string) {
  const rfq = await repo.findById(id);
  if (!rfq) throw Object.assign(new Error('RFQ not found'), { status: 404 });
  return { success: true as const, data: rfq };
}

export async function listAllRFQs(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const { rfqs, total } = await repo.findAll(page, limit, {
    status: query.status as RFQStatus | undefined,
    search: query.search ? String(query.search) : undefined,
  });
  return { success: true as const, data: rfqs, pagination: buildMeta(total, page, limit) };
}

export async function updateRFQStatus(
  id: string,
  status: RFQStatus,
  extra?: { quoteAmount?: number; quotedById?: string; estimatedDelivery?: string },
) {
  const rfq = await repo.updateStatus(id, status, {
    ...(extra?.quoteAmount       ? { quoteAmount: extra.quoteAmount, quotedAt: new Date(), quoteCurrency: 'USD' } : {}),
    ...(extra?.quotedById        ? { quotedById: extra.quotedById }   : {}),
    ...(extra?.estimatedDelivery ? { estimatedDelivery: new Date(extra.estimatedDelivery) } : {}),
  });
  return { success: true as const, data: rfq };
}
