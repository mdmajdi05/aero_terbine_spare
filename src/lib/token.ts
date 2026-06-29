const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const session = JSON.parse(localStorage.getItem('ats_session') ?? '{}');
    return session.token ?? null;
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('ats_refresh_token');
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  try {
    const session = JSON.parse(localStorage.getItem('ats_session') ?? '{}');
    session.token = accessToken;
    session.accessToken = accessToken;
    session.refreshToken = refreshToken;
    localStorage.setItem('ats_session', JSON.stringify(session));
    localStorage.setItem('ats_refresh_token', refreshToken);
  } catch { /* ignore */ }
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ats_session');
  localStorage.removeItem('ats_refresh_token');
}

function redirectToLogin() {
  if (typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')) {
    window.location.href = '/login';
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = _doRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function _doRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const json = await res.json();
    if (!json.success || !json.accessToken) {
      clearTokens();
      return null;
    }

    setTokens(json.accessToken, json.refreshToken ?? refreshToken);
    return json.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

export async function ensureValidToken(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = (payload as { exp?: number }).exp;
    if (exp && Date.now() < exp * 1000 - 60000) return token;
  } catch { /* ignore */ }

  return refreshAccessToken();
}

export function withTokenRefresh(url: string, init: RequestInit): Promise<Response> {
  return _fetchWithRefresh(url, init);
}

async function _fetchWithRefresh(url: string, init: RequestInit, tried = false): Promise<Response> {
  const res = await fetch(url, init);

  if (res.status === 401 && !tried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const headers: Record<string, string> = {};
      if (init.headers) {
        Object.assign(headers, init.headers);
      }
      headers.Authorization = `Bearer ${newToken}`;
      return _fetchWithRefresh(url, { ...init, headers }, true);
    }
    clearTokens();
    redirectToLogin();
  }

  return res;
}
