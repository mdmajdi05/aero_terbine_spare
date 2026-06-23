import { request } from '@/lib/api-client';
import type { RFQ, RFQItem } from '@/types';

export interface RFQPayload {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  items: RFQItem[];
  urgency: 'Standard' | 'Urgent' | 'Critical';
  deliveryDeadline: string;
  shippingAddress: string;
  shippingCountry: string;
  incoterms: string;
  specialInstructions?: string;
}

export async function submitRFQ(payload: RFQPayload): Promise<{ rfqId: string; message: string }> {
  const res = await request<{ success: boolean; rfqId: string; message: string }>(
    '/rfq/submit',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return { rfqId: res.rfqId, message: res.message };
}

export async function getMyRFQs(): Promise<RFQ[]> {
  const res = await request<{ success: boolean; data: RFQ[] }>('/dashboard/rfqs');
  return res.data;
}
