import { request } from '@/lib/api-client';

export interface InventoryPayload {
  companyName: string;
  contactEmail: string;
  fileName: string;
  partCount?: number;
  notes?: string;
}

export async function submitInventory(
  payload: InventoryPayload
): Promise<{ submissionId: string; status: string }> {
  const res = await request<{ success: boolean; submissionId: string; status: string }>(
    '/inventory/submit',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return { submissionId: res.submissionId, status: res.status };
}
