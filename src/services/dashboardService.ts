import { request } from '@/lib/api-client';
import type { Order, Product, SessionUser } from '@/types';

export async function getMyOrders(): Promise<Order[]> {
  const res = await request<{ success: boolean; data: Order[] }>('/dashboard/orders');
  return res.data;
}

export async function getSavedParts(): Promise<Product[]> {
  const res = await request<{ success: boolean; data: Product[] }>('/dashboard/saved');
  return res.data;
}

export async function savePart(productId: string): Promise<void> {
  await request('/dashboard/saved', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export async function unsavePart(productId: string): Promise<void> {
  await request(`/dashboard/saved/${productId}`, { method: 'DELETE' });
}

export async function getProfile(): Promise<SessionUser> {
  const res = await request<{ success: boolean; data: SessionUser }>('/dashboard/profile');
  return res.data;
}

export async function updateProfile(data: Partial<SessionUser>): Promise<SessionUser> {
  const res = await request<{ success: boolean; data: SessionUser }>('/dashboard/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}
