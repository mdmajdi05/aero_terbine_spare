import type {
  Product, Category, Industry, Testimonial, User,
  RFQ, Order, InventorySubmission, AuditLog, SystemSettings,
  AdminStats, BackupRecord, SiteConfig,
  ApiResponse, PaginatedResponse, AuthResponse,
} from '@/types';

import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import industriesData from '@/data/industries.json';
import testimonialsData from '@/data/testimonials.json';
import usersData from '@/data/users.json';
import { generateRFQId } from '@/lib/utils';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_URL  = process.env.NEXT_PUBLIC_API_URL || '';
const DELAY    = parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY || '400', 10);

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Enum value maps (frontend display ↔ DB enum) ───────────
const STOCK_TO_DB: Record<string, string> = {
  'In Stock': 'InStock', 'On Order': 'OnOrder',
  'Obsolete': 'Obsolete', 'Limited': 'Limited',
};
const DB_TO_STOCK: Record<string, string> = {
  'InStock': 'In Stock', 'OnOrder': 'On Order',
  'Obsolete': 'Obsolete', 'Limited': 'Limited',
};

function normalizePartFromDB(p: Record<string, unknown>): Record<string, unknown> {
  if (!p) return p;
  return {
    ...p,
    stockStatus: DB_TO_STOCK[p.stockStatus as string] ?? p.stockStatus,
    unitPrice:   p.unitPrice !== undefined ? Number(p.unitPrice) : undefined,
  };
}

function partBodyToDB(body: Record<string, unknown>): Record<string, unknown> {
  const out = { ...body };
  if (out.stockStatus) out.stockStatus = STOCK_TO_DB[out.stockStatus as string] ?? out.stockStatus;
  return out;
}

// ─── Real API call ──────────────────────────────────────────
async function realRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET';
  const [path, qs] = endpoint.split('?');

  // ── Static data — no backend call needed ────────────────────
  if (path === '/categories' && method === 'GET')
    return { success: true, data: categoriesData } as T;
  if (path === '/industries' && method === 'GET')
    return { success: true, data: industriesData } as T;
  if (path.startsWith('/industries/') && method === 'GET') {
    const slug = path.split('/industries/')[1];
    const found = (industriesData as unknown as Industry[]).find((i) => i.slug === slug);
    if (!found) throw new Error('Industry not found');
    return { success: true, data: found } as T;
  }
  if (path === '/testimonials' && method === 'GET')
    return { success: true, data: testimonialsData } as T;
  if (path === '/auth/logout' && method === 'POST') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ats_session');
      localStorage.removeItem('ats_refresh_token');
    }
    return { success: true } as T;
  }

  // ── Translate body enums before sending ──────────────────────
  let realBody: BodyInit | null | undefined = options?.body;
  const isPart =
    (path === '/admin/parts' && (method === 'POST' || method === 'GET')) ||
    path.startsWith('/admin/parts/') ||
    path === '/trader/parts';
  if (isPart && realBody && method !== 'GET') {
    try {
      realBody = JSON.stringify(partBodyToDB(JSON.parse(realBody as string)));
    } catch { /* keep original */ }
  }

  // ── URL + method translation ─────────────────────────────────
  let realPath   = path;
  let realMethod = method;

  if      (path === '/products')                                              realPath = '/parts';
  else if (path.startsWith('/products/'))                                     realPath = path.replace('/products/', '/parts/');
  else if (path === '/rfq/submit')                                            realPath = '/rfqs';
  else if (path === '/dashboard/rfqs')                                        realPath = '/rfqs/my';
  else if (path === '/dashboard/orders')                                      realPath = '/dashboard/orders';
  else if (path === '/dashboard/saved')                                       realPath = '/dashboard/saved-parts';
  else if (path.startsWith('/dashboard/saved/'))
    realPath = path.replace('/dashboard/saved/', '/dashboard/saved-parts/');
  else if (path === '/dashboard/profile' && method === 'GET')                realPath = '/auth/me';
  else if (path === '/dashboard/profile' && method === 'PUT')                realPath = '/auth/me';
  else if (path === '/inventory/submit')                                      realPath = '/inventory';
  else if (path === '/admin/inventory')                                       realPath = '/inventory';
  else if (path === '/admin/rfqs')                                            realPath = '/rfqs';
  else if (path.startsWith('/admin/rfqs/') && method === 'PUT') {
    realPath = `/rfqs/${path.split('/admin/rfqs/')[1]}/status`;
  }
  else if (path === '/admin/parts' && method === 'GET')                      realPath = '/parts';
  else if (path === '/admin/parts' && method === 'POST')                     realPath = '/parts';
  else if (path.startsWith('/admin/parts/') && (method === 'PUT' || method === 'DELETE'))
    realPath = path.replace('/admin/parts/', '/parts/');
  else if (path === '/admin/export/users')                                    realPath = '/admin/export/users';
  else if (path === '/admin/export/rfqs')                                     realPath = '/admin/export/rfqs';
  else if (path === '/admin/export/parts')                                    realPath = '/admin/export/parts';
  else if (path === '/admin/import/parts')                                    realPath = '/admin/import/parts';
  else if (path === '/site-config')                                           realPath = '/config';
  else if (path === '/trader/parts')                                          realPath = '/parts/mine';
  else if (path === '/superadmin/users/create' && method === 'POST')         realPath = '/admin/users/create';
  else if (path === '/superadmin/users/make-admin' && method === 'POST') {
    const body = JSON.parse(options?.body as string || '{}');
    realPath   = `/superadmin/users/${body.userId}/role`;
    realMethod = 'PUT';
    realBody   = JSON.stringify({ role: body.role });
  }
  else if (path.startsWith('/admin/users/') && path.endsWith('/reset-password'))
    realPath = path; // already correct
  else if (path.startsWith('/admin/users/') && path.endsWith('/change-email'))
    realPath = path; // already correct

  const finalEndpoint = realPath + (qs ? '?' + qs : '');
  const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);

  // Guard: if stored token looks like a mock token, clear it and throw
  if (session?.token && session.token.startsWith('mock-jwt-')) {
    if (typeof window !== 'undefined') localStorage.removeItem('ats_session');
    throw new Error('Session expired. Please log in again.');
  }

  const res = await fetch(`${API_URL}${finalEndpoint}`, {
    ...options,
    method: realMethod,
    body: realBody,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    // Token expired — clear session so UI shows login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ats_session');
      localStorage.removeItem('ats_refresh_token');
      // Only redirect if not already on login/register
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.error as string) || 'Session expired. Please log in again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((err.error as string) || (err.message as string) || `API Error ${res.status}`);
  }

  const json = await res.json() as Record<string, unknown>;

  // Normalize auth: backend returns accessToken, frontend expects token
  if (json.accessToken) {
    const normalized: Record<string, unknown> = { ...json, token: json.accessToken };
    if (normalized.user) {
      lsSet('ats_session', normalized);
      if (json.refreshToken) lsSet('ats_refresh_token', json.refreshToken);
    }
    return normalized as T;
  }

  // Normalize parts: remap DB enum → display strings
  const isPartsResponse =
    finalEndpoint.startsWith('/parts') ||
    finalEndpoint.startsWith('/admin/parts') ||
    (finalEndpoint.startsWith('/config') && false); // only parts
  if (isPartsResponse && json.data) {
    if (Array.isArray(json.data)) {
      json.data = (json.data as Record<string, unknown>[]).map(normalizePartFromDB);
    } else if (typeof json.data === 'object') {
      json.data = normalizePartFromDB(json.data as Record<string, unknown>);
    }
  }

  return json as T;
}

// ─── localStorage helpers ────────────────────────────────────
function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}

function lsSet(key: string, value: unknown) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

// ─── Audit log helper ────────────────────────────────────────
function appendAuditLog(entry: Partial<AuditLog>) {
  const logs = ls<AuditLog[]>('ats_audit_logs', []);
  const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    userId: session?.user?.id || 'anonymous',
    userEmail: session?.user?.email || 'anonymous',
    userRole: (session?.user?.role as AuditLog['userRole']) || 'User',
    action: entry.action || 'UNKNOWN',
    resource: entry.resource || 'unknown',
    resourceId: entry.resourceId,
    details: entry.details,
    ipAddress: '127.0.0.1',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : '',
    status: entry.status || 'Success',
    createdAt: new Date().toISOString(),
  };
  lsSet('ats_audit_logs', [newLog, ...logs].slice(0, 500));
}

// ─── Site config defaults ────────────────────────────────────
function getDefaultSiteConfig(): SiteConfig {
  return {
    logoHeight:   40,
    logoWidth:    0,
    logoPaddingX: 16,
    logoPaddingY: 8,
    logoMarginX:  0,
    logoMarginY:  0,
    logoText:     'AeroTurbineSpare',
    logoSubText:  'Aerospace Parts Exchange',
    heroHeading:    'Source Aerospace Parts with Confidence',
    heroSubheading: 'Global inventory of aviation, turbine, and defense components — NSN, CAGE, and part-number searchable in seconds.',
    heroBadgeText:  'Trusted by 500+ Aviation Companies',
    heroBgType:     'gradient',
    heroBgValue:    '#0A1628',
    heroCta1Label:  'Search Inventory',
    heroCta1Href:   '/catalog',
    heroCta2Label:  'Request a Quote',
    heroCta2Href:   '/rfq',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  };
}

// ─── Mock router ────────────────────────────────────────────
function mockRouter<T>(endpoint: string, options?: RequestInit): T {
  const method = options?.method?.toUpperCase() || 'GET';
  const [path, qs] = endpoint.split('?');
  const params = new URLSearchParams(qs || '');

  // ── AUTH ──────────────────────────────────────────────────
  if (path === '/auth/login' && method === 'POST') {
    const body = JSON.parse(options?.body as string || '{}');
    const user = (usersData as unknown as User[]).find(
      (u) => u.email === body.email && u.password === body.password
    );
    if (!user) throw new Error('Invalid email or password');
    if (user.isActive === false) throw new Error('Account is suspended. Contact support.');
    const { password: _, ...safeUser } = user;
    const resp: AuthResponse = { success: true, token: 'mock-jwt-' + user.id, user: safeUser as AuthResponse['user'] };
    lsSet('ats_session', resp);
    appendAuditLog({ action: 'LOGIN', resource: 'auth', resourceId: user.id, details: `User ${user.email} logged in` });
    return resp as T;
  }

  if (path === '/auth/register' && method === 'POST') {
    const body = JSON.parse(options?.body as string || '{}');
    const existing = (usersData as unknown as User[]).find((u) => u.email === body.email);
    if (existing) throw new Error('An account with this email already exists');
    const newUser = {
      id: 'user-' + Date.now(),
      ...body,
      role: 'User',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const session: AuthResponse = { success: true, token: 'mock-jwt-' + newUser.id, user: newUser };
    lsSet('ats_session', session);
    appendAuditLog({ action: 'REGISTER', resource: 'auth', resourceId: newUser.id, details: `New user registered: ${newUser.email}` });
    return { success: true, message: 'Registration successful' } as T;
  }

  if (path === '/auth/logout' && method === 'POST') {
    appendAuditLog({ action: 'LOGOUT', resource: 'auth' });
    if (typeof window !== 'undefined') localStorage.removeItem('ats_session');
    return { success: true } as T;
  }

  // ── PRODUCTS ──────────────────────────────────────────────
  if (path === '/products' && method === 'GET') {
    const customParts0 = ls<Product[]>('ats_custom_parts', []);
    let results = [...customParts0, ...(productsData as unknown as Product[])];
    const q     = params.get('search')?.toLowerCase();
    const cat   = params.get('category');
    const fsg   = params.get('fsg');
    const cage  = params.get('cage');
    const cond  = params.get('condition');
    const stock = params.get('stockStatus');
    const page  = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '20', 10);

    if (q)     results = results.filter((p) =>
      p.partNumber.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.nsn.includes(q) ||
      p.cage.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
    if (cat)   results = results.filter((p) => p.category === cat);
    if (fsg)   results = results.filter((p) => p.fsg === fsg);
    if (cage)  results = results.filter((p) => p.cage.toLowerCase() === cage.toLowerCase());
    if (cond)  results = results.filter((p) => p.condition === cond);
    if (stock) results = results.filter((p) => p.stockStatus === stock);

    const total = results.length;
    const data  = results.slice((page - 1) * limit, page * limit);
    const resp: PaginatedResponse<Product> = {
      success: true, data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
    return resp as T;
  }

  if (path.startsWith('/products/') && method === 'GET') {
    const id = path.split('/products/')[1];
    const allProds = [...ls<Product[]>('ats_custom_parts', []), ...(productsData as unknown as Product[])];
    const product = allProds.find((p) => p.id === id || p.partNumber === id);
    if (!product) throw new Error('Product not found');
    return { success: true, data: product } as T;
  }

  // ── CATEGORIES ────────────────────────────────────────────
  if (path === '/categories') {
    return { success: true, data: categoriesData as unknown as Category[] } as T;
  }

  // ── INDUSTRIES ────────────────────────────────────────────
  if (path === '/industries') {
    return { success: true, data: industriesData as unknown as Industry[] } as T;
  }

  if (path.startsWith('/industries/') && method === 'GET') {
    const slug = path.split('/industries/')[1];
    const industry = (industriesData as unknown as Industry[]).find((i) => i.slug === slug);
    if (!industry) throw new Error('Industry not found');
    return { success: true, data: industry } as T;
  }

  // ── TESTIMONIALS ──────────────────────────────────────────
  if (path === '/testimonials') {
    return { success: true, data: testimonialsData as unknown as Testimonial[] } as T;
  }

  // ── RFQ ───────────────────────────────────────────────────
  if (path === '/rfq/submit' && method === 'POST') {
    const body = JSON.parse(options?.body as string || '{}');
    const rfq: RFQ = {
      id: generateRFQId(),
      ...body,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const existing = ls<RFQ[]>('ats_rfqs', []);
    lsSet('ats_rfqs', [rfq, ...existing]);
    appendAuditLog({ action: 'SUBMIT_RFQ', resource: 'rfq', resourceId: rfq.id, details: `RFQ submitted: ${rfq.id}` });
    return { success: true, rfqId: rfq.id, message: 'RFQ submitted. Our team will respond within 24 hours.' } as T;
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  if (path === '/dashboard/rfqs' && method === 'GET') {
    const rfqs = ls<RFQ[]>('ats_rfqs', []);
    return { success: true, data: rfqs } as T;
  }

  if (path === '/dashboard/orders' && method === 'GET') {
    const orders = ls<Order[]>('ats_orders', []);
    return { success: true, data: orders } as T;
  }

  if (path === '/dashboard/saved' && method === 'GET') {
    const saved = ls<string[]>('ats_saved', []);
    const products = (productsData as unknown as Product[]).filter((p) => saved.includes(p.id));
    return { success: true, data: products } as T;
  }

  if (path === '/dashboard/saved' && method === 'POST') {
    const { productId } = JSON.parse(options?.body as string || '{}');
    const saved = ls<string[]>('ats_saved', []);
    if (!saved.includes(productId)) lsSet('ats_saved', [...saved, productId]);
    return { success: true } as T;
  }

  if (path.startsWith('/dashboard/saved/') && method === 'DELETE') {
    const productId = path.split('/dashboard/saved/')[1];
    const saved = ls<string[]>('ats_saved', []).filter((id) => id !== productId);
    lsSet('ats_saved', saved);
    return { success: true } as T;
  }

  if (path === '/dashboard/profile' && method === 'GET') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    if (!session) throw new Error('Not authenticated');
    return { success: true, data: session.user } as T;
  }

  if (path === '/dashboard/profile' && method === 'PUT') {
    const body = JSON.parse(options?.body as string || '{}');
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    if (!session) throw new Error('Not authenticated');
    const updated = { ...session.user, ...body };
    lsSet('ats_session', { ...session, user: updated });
    appendAuditLog({ action: 'UPDATE_PROFILE', resource: 'user', resourceId: session.user.id });
    return { success: true, data: updated } as T;
  }

  // ── INVENTORY ─────────────────────────────────────────────
  if (path === '/inventory/submit' && method === 'POST') {
    const sub: InventorySubmission = {
      id: 'INV-' + Date.now(),
      ...JSON.parse(options?.body as string || '{}'),
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };
    const existing = ls<InventorySubmission[]>('ats_inventory', []);
    lsSet('ats_inventory', [sub, ...existing]);
    appendAuditLog({ action: 'SUBMIT_INVENTORY', resource: 'inventory', resourceId: sub.id });
    return { success: true, submissionId: sub.id, status: 'Processing' } as T;
  }

  // ═══════════════════════════════════════════════════════════
  // ── ADMIN ENDPOINTS ────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════

  if (path === '/admin/stats' && method === 'GET') {
    const allRFQs = ls<RFQ[]>('ats_rfqs', []);
    const stats: AdminStats = {
      totalUsers: (usersData as unknown as User[]).length,
      activeUsers: (usersData as unknown as User[]).filter((u) => u.isActive !== false).length,
      totalRFQs: allRFQs.length,
      pendingRFQs: allRFQs.filter((r) => r.status === 'Pending' || r.status === 'Under Review').length,
      totalParts: (productsData as unknown as Product[]).length + ls<Product[]>('ats_custom_parts', []).length,
      totalOrders: ls<Order[]>('ats_orders', []).length,
      revenueThisMonth: 284750,
      newUsersThisMonth: 12,
    };
    return { success: true, data: stats } as T;
  }

  if (path === '/admin/users' && method === 'GET') {
    const page   = parseInt(params.get('page') || '1', 10);
    const limit  = parseInt(params.get('limit') || '20', 10);
    const search = params.get('search')?.toLowerCase();
    // Merge seed users + custom users created via SA
    const seedUsers    = (usersData as unknown as User[]).map(({ password: _, ...u }) => u);
    const customUsers  = ls<User[]>('ats_custom_users', []).map(({ password: _, ...u }) => u);
    // Merge suspended/role overrides stored in ats_user_overrides
    const overrides    = ls<Record<string, Partial<User>>>('ats_user_overrides', {});
    let users = [...customUsers, ...seedUsers].map((u) =>
      overrides[u.id] ? { ...u, ...overrides[u.id] } : u
    );
    if (search) users = users.filter((u) =>
      u.fullName.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      u.company.toLowerCase().includes(search)
    );
    const total = users.length;
    const data  = users.slice((page - 1) * limit, page * limit);
    return { success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } as T;
  }

  if (path.startsWith('/admin/users/') && !path.includes('/reset-password') && !path.includes('/change-email') && !path.includes('/suspend') && method === 'PUT') {
    const userId = path.split('/admin/users/')[1];
    const body = JSON.parse(options?.body as string || '{}');
    // Persist role/active change into overrides store
    const overrides = ls<Record<string, Partial<User>>>('ats_user_overrides', {});
    overrides[userId] = { ...(overrides[userId] || {}), ...body };
    lsSet('ats_user_overrides', overrides);
    // Also update session if the current user changed their own profile
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    if (session?.user?.id === userId) {
      lsSet('ats_session', { ...session, user: { ...session.user, ...body } });
    }
    appendAuditLog({ action: 'UPDATE_USER', resource: 'user', resourceId: userId, details: JSON.stringify(body) });
    return { success: true, message: 'User updated successfully' } as T;
  }

  if (path.startsWith('/admin/users/') && path.endsWith('/suspend') && method === 'POST') {
    const userId = path.split('/admin/users/')[1].replace('/suspend', '');
    const overrides = ls<Record<string, Partial<User>>>('ats_user_overrides', {});
    const current = overrides[userId]?.isActive !== false;
    overrides[userId] = { ...(overrides[userId] || {}), isActive: current ? false : true };
    lsSet('ats_user_overrides', overrides);
    appendAuditLog({ action: current ? 'SUSPEND_USER' : 'REACTIVATE_USER', resource: 'user', resourceId: userId, status: 'Warning' });
    return { success: true, message: current ? 'User suspended' : 'User reactivated' } as T;
  }

  if (path === '/admin/rfqs' && method === 'GET') {
    const page  = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '20', 10);
    const status = params.get('status');
    let rfqs = ls<RFQ[]>('ats_rfqs', []);
    if (status) rfqs = rfqs.filter((r) => r.status === status);
    const total = rfqs.length;
    const data  = rfqs.slice((page - 1) * limit, page * limit);
    return { success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } as T;
  }

  if (path.startsWith('/admin/rfqs/') && method === 'PUT') {
    const rfqId = path.split('/admin/rfqs/')[1];
    const body = JSON.parse(options?.body as string || '{}');
    const rfqs = ls<RFQ[]>('ats_rfqs', []).map((r) =>
      r.id === rfqId ? { ...r, ...body, updatedAt: new Date().toISOString() } : r
    );
    lsSet('ats_rfqs', rfqs);
    appendAuditLog({ action: 'UPDATE_RFQ', resource: 'rfq', resourceId: rfqId, details: JSON.stringify(body) });
    return { success: true, message: 'RFQ updated' } as T;
  }

  if (path === '/admin/parts' && method === 'GET') {
    const page  = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '20', 10);
    const q     = params.get('search')?.toLowerCase();
    const customParts1 = ls<Product[]>('ats_custom_parts', []);
    let parts = [...customParts1, ...(productsData as unknown as Product[])];
    if (q) parts = parts.filter((p) =>
      p.partNumber.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.nsn.includes(q) ||
      p.manufacturer.toLowerCase().includes(q)
    );
    const total = parts.length;
    const data  = parts.slice((page - 1) * limit, page * limit);
    return { success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } as T;
  }

  if (path === '/admin/inventory' && method === 'GET') {
    const subs = ls<InventorySubmission[]>('ats_inventory', []);
    return { success: true, data: subs } as T;
  }

  // Admin export
  if (path === '/admin/export/users' && method === 'GET') {
    const users = (usersData as unknown as User[]).map(({ password: _, ...u }) => u);
    return { success: true, data: users, format: params.get('format') || 'json' } as T;
  }

  if (path === '/admin/export/rfqs' && method === 'GET') {
    const rfqs = ls<RFQ[]>('ats_rfqs', []);
    return { success: true, data: rfqs, format: params.get('format') || 'json' } as T;
  }

  if (path === '/admin/export/parts' && method === 'GET') {
    const parts = productsData as unknown as Product[];
    return { success: true, data: parts, format: params.get('format') || 'json' } as T;
  }

  // Admin import
  if (path === '/admin/import/parts' && method === 'POST') {
    appendAuditLog({ action: 'IMPORT_PARTS', resource: 'part', details: 'Bulk parts import triggered' });
    return { success: true, message: 'Import processed successfully', imported: 0, errors: 0 } as T;
  }

  // ═══════════════════════════════════════════════════════════
  // ── SUPERADMIN ENDPOINTS ────────────────────────────────────
  // ═══════════════════════════════════════════════════════════

  if (path === '/superadmin/stats' && method === 'GET') {
    const allRFQs = ls<RFQ[]>('ats_rfqs', []);
    const stats: AdminStats = {
      totalUsers: (usersData as unknown as User[]).length,
      activeUsers: (usersData as unknown as User[]).filter((u) => u.isActive !== false).length,
      totalRFQs: allRFQs.length,
      pendingRFQs: allRFQs.filter((r) => r.status === 'Pending').length,
      totalParts: (productsData as unknown as Product[]).length + ls<Product[]>('ats_custom_parts', []).length,
      totalOrders: ls<Order[]>('ats_orders', []).length,
      revenueThisMonth: 284750,
      newUsersThisMonth: 12,
    };
    return { success: true, data: stats } as T;
  }

  if (path === '/superadmin/audit-logs' && method === 'GET') {
    const page  = parseInt(params.get('page') || '1', 10);
    const limit = parseInt(params.get('limit') || '50', 10);
    const action = params.get('action');
    let logs = ls<AuditLog[]>('ats_audit_logs', getMockAuditLogs());
    if (action) logs = logs.filter((l) => l.action === action);
    const total = logs.length;
    const data  = logs.slice((page - 1) * limit, page * limit);
    return { success: true, data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } } as T;
  }

  if (path === '/superadmin/settings' && method === 'GET') {
    const settings = ls<SystemSettings>('ats_system_settings', getDefaultSettings());
    return { success: true, data: settings } as T;
  }

  if (path === '/superadmin/settings' && method === 'PUT') {
    const body = JSON.parse(options?.body as string || '{}');
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const updated: SystemSettings = {
      ...getDefaultSettings(),
      ...ls<SystemSettings>('ats_system_settings', getDefaultSettings()),
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: session?.user?.email || 'superadmin',
    };
    lsSet('ats_system_settings', updated);
    appendAuditLog({ action: 'UPDATE_SETTINGS', resource: 'system', details: JSON.stringify(body) });
    return { success: true, data: updated, message: 'Settings saved' } as T;
  }

  if (path === '/superadmin/backup/trigger' && method === 'POST') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const backup: BackupRecord = {
      id: 'backup-' + Date.now(),
      triggeredBy: session?.user?.email || 'superadmin',
      type: 'manual',
      status: 'Complete',
      sizeBytes: 4_200_000 + Math.floor(Math.random() * 500_000),
      downloadUrl: '#',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    const backups = ls<BackupRecord[]>('ats_backups', []);
    lsSet('ats_backups', [backup, ...backups]);
    appendAuditLog({ action: 'TRIGGER_BACKUP', resource: 'system', resourceId: backup.id, details: 'Manual backup triggered' });
    return { success: true, data: backup, message: 'Backup completed successfully' } as T;
  }

  if (path === '/superadmin/backup/list' && method === 'GET') {
    const backups = ls<BackupRecord[]>('ats_backups', getMockBackups());
    return { success: true, data: backups } as T;
  }

  if (path === '/superadmin/export/master' && method === 'GET') {
    const allData = {
      exportedAt: new Date().toISOString(),
      users: (usersData as unknown as User[]).map(({ password: _, ...u }) => u),
      parts: productsData,
      rfqs: ls<RFQ[]>('ats_rfqs', []),
      orders: ls<Order[]>('ats_orders', []),
      inventory: ls<InventorySubmission[]>('ats_inventory', []),
      auditLogs: ls<AuditLog[]>('ats_audit_logs', []),
    };
    appendAuditLog({ action: 'MASTER_EXPORT', resource: 'system', details: 'Full system data exported' });
    return { success: true, data: allData } as T;
  }

  if (path === '/superadmin/users/make-admin' && method === 'POST') {
    const { userId, role } = JSON.parse(options?.body as string || '{}');
    const overrides = ls<Record<string, Partial<User>>>('ats_user_overrides', {});
    overrides[userId] = { ...(overrides[userId] || {}), role };
    lsSet('ats_user_overrides', overrides);
    appendAuditLog({ action: 'CHANGE_ROLE', resource: 'user', resourceId: userId, details: `Role changed to ${role}` });
    return { success: true, message: `User role updated to ${role}` } as T;
  }

  // ── SUPERADMIN: create new user ──────────────────────────────
  if (path === '/superadmin/users/create' && method === 'POST') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const body = JSON.parse(options?.body as string || '{}');
    const existing = ls<User[]>('ats_custom_users', []);
    if (existing.find((u) => u.email === body.email)) throw new Error('Email already in use');
    const newUser: User = {
      id: 'user-custom-' + Date.now(),
      email: body.email,
      password: body.password,
      fullName: body.fullName,
      company: body.company || 'AeroTurbineSpare',
      cageCode: body.cageCode,
      phone: body.phone || '',
      role: body.role || 'User',
      country: body.country || 'United States',
      address: body.address,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    lsSet('ats_custom_users', [newUser, ...existing]);
    appendAuditLog({ action: 'CREATE_USER', resource: 'user', resourceId: newUser.id, details: `Created ${newUser.email} as ${newUser.role}`, userId: session?.user?.id });
    return { success: true, data: newUser, message: 'User created successfully' } as T;
  }

  // ── ADMIN: reset any user's password ────────────────────────
  if (path.match(/\/admin\/users\/[^/]+\/reset-password/) && method === 'POST') {
    const userId = path.split('/admin/users/')[1].replace('/reset-password', '');
    const body = JSON.parse(options?.body as string || '{}');
    appendAuditLog({ action: 'RESET_PASSWORD', resource: 'user', resourceId: userId, details: `Password reset by admin` });
    return { success: true, message: `Password reset successfully for user ${userId}` } as T;
  }

  // ── ADMIN: change user email ─────────────────────────────────
  if (path.match(/\/admin\/users\/[^/]+\/change-email/) && method === 'PUT') {
    const userId = path.split('/admin/users/')[1].replace('/change-email', '');
    const { email } = JSON.parse(options?.body as string || '{}');
    appendAuditLog({ action: 'CHANGE_EMAIL', resource: 'user', resourceId: userId, details: `Email changed to ${email}` });
    return { success: true, message: `Email updated to ${email}` } as T;
  }

  // ── SITE CONFIG (public read) ────────────────────────────────
  if (path === '/site-config' && method === 'GET') {
    const config = ls<SiteConfig>('ats_site_config', getDefaultSiteConfig());
    return { success: true, data: config } as T;
  }

  // ── SITE CONFIG (admin/superadmin write) ────────────────────
  if (path === '/site-config' && method === 'PUT') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const body = JSON.parse(options?.body as string || '{}');
    const updated: SiteConfig = {
      ...getDefaultSiteConfig(),
      ...ls<SiteConfig>('ats_site_config', getDefaultSiteConfig()),
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: session?.user?.email || 'admin',
    };
    lsSet('ats_site_config', updated);
    appendAuditLog({ action: 'UPDATE_SITE_CONFIG', resource: 'branding', details: 'Site config updated' });
    return { success: true, data: updated, message: 'Site configuration saved' } as T;
  }

  // ── ADMIN PARTS CRUD ─────────────────────────────────────────
  if (path === '/admin/parts' && method === 'POST') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const body = JSON.parse(options?.body as string || '{}');
    const custom = ls<Product[]>('ats_custom_parts', []);
    const newPart: Product = {
      id: 'part-custom-' + Date.now(),
      nsn: body.nsn || '',
      cage: body.cage || '',
      partNumber: body.partNumber || '',
      description: body.description || '',
      shortDescription: body.shortDescription || body.description || '',
      fsg: body.fsg || '',
      fsc: body.fsc || '',
      category: body.category || 'General',
      manufacturer: body.manufacturer || '',
      condition: body.condition || 'New',
      stockStatus: body.stockStatus || 'In Stock',
      quantityAvailable: Number(body.quantityAvailable) || 0,
      unitPrice: Number(body.unitPrice) || 0,
      currency: 'USD',
      crossReferences: [],
      specifications: {},
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session?.user?.id,
      createdByRole: session?.user?.role,
    } as Product & { createdBy?: string; createdByRole?: string };
    lsSet('ats_custom_parts', [newPart, ...custom]);
    appendAuditLog({ action: 'CREATE_PART', resource: 'part', resourceId: newPart.id, details: `Part ${newPart.partNumber} created` });
    return { success: true, data: newPart, message: 'Part created' } as T;
  }

  if (path.startsWith('/admin/parts/') && method === 'PUT') {
    const partId = path.split('/admin/parts/')[1];
    const body = JSON.parse(options?.body as string || '{}');
    const custom = ls<(Product & { createdBy?: string })[]>('ats_custom_parts', []);
    const updated = custom.map((p) => p.id === partId ? { ...p, ...body, updatedAt: new Date().toISOString() } : p);
    lsSet('ats_custom_parts', updated);
    appendAuditLog({ action: 'UPDATE_PART', resource: 'part', resourceId: partId, details: `Part updated` });
    return { success: true, message: 'Part updated' } as T;
  }

  if (path.startsWith('/admin/parts/') && method === 'DELETE') {
    const partId = path.split('/admin/parts/')[1];
    const custom = ls<Product[]>('ats_custom_parts', []).filter((p) => p.id !== partId);
    lsSet('ats_custom_parts', custom);
    appendAuditLog({ action: 'DELETE_PART', resource: 'part', resourceId: partId, details: `Part deleted` });
    return { success: true, message: 'Part deleted' } as T;
  }

  // ── TRADER PARTS (trader's own listings only) ────────────────
  if (path === '/trader/parts' && method === 'GET') {
    const session = ls<AuthResponse>('ats_session', null as unknown as AuthResponse);
    const custom = ls<(Product & { createdBy?: string })[]>('ats_custom_parts', []);
    const myParts = custom.filter((p) => p.createdBy === session?.user?.id);
    return { success: true, data: myParts, pagination: { total: myParts.length, page: 1, limit: 50, totalPages: 1 } } as T;
  }

  return { success: true, data: [] } as T;
}

// ─── Mock seed data helpers ──────────────────────────────────
function getDefaultSettings(): SystemSettings {
  return {
    siteName: 'AeroTurbineSpare',
    siteUrl: 'https://aeroturbinespare.com',
    maintenanceMode: false,
    allowRegistration: true,
    rfqEmailRecipient: 'rfq@aeroturbinespare.com',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    maxRFQsPerDay: 50,
    sessionTimeoutMinutes: 60,
    enableAuditLogging: true,
    backupSchedule: 'daily',
    dataRetentionDays: 365,
    updatedAt: '2026-06-01T00:00:00Z',
    updatedBy: 'superadmin@aeroturbinespare.com',
  };
}

function getMockAuditLogs(): AuditLog[] {
  const actions = [
    { action: 'LOGIN', resource: 'auth', status: 'Success' as const },
    { action: 'SUBMIT_RFQ', resource: 'rfq', status: 'Success' as const },
    { action: 'UPDATE_PROFILE', resource: 'user', status: 'Success' as const },
    { action: 'UPDATE_USER', resource: 'user', status: 'Success' as const },
    { action: 'SUSPEND_USER', resource: 'user', status: 'Warning' as const },
    { action: 'LOGIN', resource: 'auth', status: 'Failed' as const },
    { action: 'MASTER_EXPORT', resource: 'system', status: 'Success' as const },
    { action: 'UPDATE_SETTINGS', resource: 'system', status: 'Success' as const },
  ];
  const users = ['admin@aeroturbinespare.com', 'superadmin@aeroturbinespare.com', 'demo@aeroturbinespare.com'];
  return Array.from({ length: 40 }, (_, i) => {
    const a = actions[i % actions.length];
    const u = users[i % users.length];
    return {
      id: `log-seed-${i + 1}`,
      userId: `user-00${(i % 3) + 1}`,
      userEmail: u,
      userRole: u.includes('super') ? 'SuperAdmin' : u.includes('admin') ? 'Admin' : 'User',
      action: a.action,
      resource: a.resource,
      resourceId: `res-${i}`,
      details: `Mock audit entry ${i + 1}`,
      ipAddress: `192.168.1.${(i % 50) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      status: a.status,
      createdAt: new Date(Date.now() - i * 3_600_000).toISOString(),
    } as AuditLog;
  });
}

function getMockBackups(): BackupRecord[] {
  return [
    {
      id: 'backup-seed-1',
      triggeredBy: 'system',
      type: 'scheduled',
      status: 'Complete',
      sizeBytes: 4_234_567,
      downloadUrl: '#',
      createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      completedAt: new Date(Date.now() - 86_390_000).toISOString(),
    },
    {
      id: 'backup-seed-2',
      triggeredBy: 'superadmin@aeroturbinespare.com',
      type: 'manual',
      status: 'Complete',
      sizeBytes: 4_100_000,
      downloadUrl: '#',
      createdAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 86_400_000 + 10_000).toISOString(),
    },
  ];
}

// ─── Public request function ─────────────────────────────────
export async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  if (USE_MOCK) {
    await delay(DELAY);
    return mockRouter<T>(endpoint, options);
  }
  return realRequest<T>(endpoint, options);
}
