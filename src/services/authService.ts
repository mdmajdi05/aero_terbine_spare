import { request } from '@/lib/api-client';
import type { AuthResponse } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  company: string;
  phone: string;
  country: string;
  cageCode?: string;
}

// Store role in a cookie so Next.js middleware can read it server-side
function setRoleCookie(role: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `ats_role=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

function clearRoleCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'ats_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.user?.role) setRoleCookie(res.user.role);
  return res;
}

export async function register(payload: RegisterPayload): Promise<{ success: boolean; message: string }> {
  const res = await request<{ success: boolean; message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setRoleCookie('User');
  return res;
}

export async function logout(): Promise<void> {
  await request('/auth/logout', { method: 'POST' });
  clearRoleCookie();
}
