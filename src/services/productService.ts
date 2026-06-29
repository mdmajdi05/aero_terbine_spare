import { request } from '@/lib/api-client';
import type { Product, PaginatedResponse, ApiResponse } from '@/types';

export interface ProductFilters {
  search?: string;
  category?: string;
  type?: string;
  industry?: string;
  fsg?: string;
  cage?: string;
  condition?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
}

// ── Local Excel-feed fallback (works when backend is offline) ──
interface ExcelFeedFile {
  status: 'active' | 'paused' | null;
  filename: string | null;
  rowCount: number;
  rows: Record<string, unknown>[];
}

function matchesFilters(row: Record<string, unknown>, filters: ProductFilters): boolean {
  const s = filters.search?.toLowerCase();
  if (s) {
    const hay = `${row.partNumber} ${row.description} ${row.nsn} ${row.manufacturer} ${row.cage}`.toLowerCase();
    if (!hay.includes(s)) return false;
  }
  if (filters.fsg       && row.fsg       !== filters.fsg)       return false;
  if (filters.cage      && !String(row.cage ?? '').toLowerCase().includes(filters.cage.toLowerCase())) return false;
  if (filters.condition && row.condition !== filters.condition) return false;
  if (filters.stockStatus && row.stockStatus !== filters.stockStatus) return false;
  if (filters.category  && row.category  !== filters.category)  return false;
  if (filters.type      && row.type      !== filters.type)      return false;
  if (filters.industry  && row.industry  !== filters.industry)  return false;
  return true;
}

async function getProductsFromLocalFeed(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
  const empty: PaginatedResponse<Product> = {
    success: true, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
  try {
    const res = await fetch('/data/excel-feed.json', { cache: 'no-store' });
    if (!res.ok) return empty;
    const feed = await res.json() as ExcelFeedFile;
    if (feed.status !== 'active' || !feed.rows?.length) return empty;

    const filtered = feed.rows.filter((r) => matchesFilters(r, filters));
    const page  = filters.page  || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const data  = filtered.slice(start, start + limit) as unknown as Product[];

    return {
      success: true,
      data,
      pagination: {
        page, limit,
        total:      filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  } catch {
    return empty;
  }
}

// ── Public API ─────────────────────────────────────────────────
export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.search)      params.set('search',      filters.search);
  if (filters.category)    params.set('category',    filters.category);
  if (filters.type)        params.set('type',        filters.type);
  if (filters.industry)    params.set('industry',    filters.industry);
  if (filters.fsg)         params.set('fsg',         filters.fsg);
  if (filters.cage)        params.set('cage',        filters.cage);
  if (filters.condition)   params.set('condition',   filters.condition);
  if (filters.stockStatus) params.set('stockStatus', filters.stockStatus);
  params.set('page',  String(filters.page  || 1));
  params.set('limit', String(filters.limit || 20));

  try {
    const qs = params.toString();
    return await request<PaginatedResponse<Product>>(`/products${qs ? '?' + qs : ''}`);
  } catch (err) {
    // If backend is offline (TypeError = network error), fall back to local Excel feed
    const isNetworkError = err instanceof TypeError || (err as Error).message?.includes('fetch');
    if (isNetworkError) {
      console.warn('[Catalog] Backend offline — loading from local Excel feed');
      return getProductsFromLocalFeed(filters);
    }
    throw err;
  }
}

export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  return request<ApiResponse<Product>>(`/products/${id}`);
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const res = await getProducts({ search: query, limit });
  return res.data;
}
