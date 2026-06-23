import { request } from '@/lib/api-client';
import type { Product, PaginatedResponse, ApiResponse } from '@/types';

export interface ProductFilters {
  search?: string;
  category?: string;
  fsg?: string;
  cage?: string;
  condition?: string;
  stockStatus?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.search)      params.set('search', filters.search);
  if (filters.category)    params.set('category', filters.category);
  if (filters.fsg)         params.set('fsg', filters.fsg);
  if (filters.cage)        params.set('cage', filters.cage);
  if (filters.condition)   params.set('condition', filters.condition);
  if (filters.stockStatus) params.set('stockStatus', filters.stockStatus);
  params.set('page',  String(filters.page  || 1));
  params.set('limit', String(filters.limit || 20));
  const qs = params.toString();
  return request<PaginatedResponse<Product>>(`/products${qs ? '?' + qs : ''}`);
}

export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  return request<ApiResponse<Product>>(`/products/${id}`);
}

export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
  const res = await getProducts({ search: query, limit });
  return res.data;
}
