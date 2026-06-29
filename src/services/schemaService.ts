import { req } from './blogService';

export interface PageSchema {
  pageKey: string;
  label: string;
  schemaJson: Record<string, unknown> | null;
  faqItems: { question: string; answer: string }[] | null;
  updatedAt: string;
  updatedBy: string;
}

type ListResp = { success: true; data: PageSchema[] };
type SingleResp = { success: true; data: PageSchema };
type DeleteResp = { success: true; data: null };

export const schemaService = {
  list: () => req<ListResp>('/schemas'),
  get: (pageKey: string) => req<SingleResp>(`/schemas/${encodeURIComponent(pageKey)}`),
  upsert: (pageKey: string, body: { label: string; schemaJson?: unknown; faqItems?: unknown }) =>
    req<SingleResp>(`/schemas/${encodeURIComponent(pageKey)}`, { method: 'PUT', body: JSON.stringify({ pageKey, ...body }) }),
  delete: (pageKey: string) => req<DeleteResp>(`/schemas/${encodeURIComponent(pageKey)}`, { method: 'DELETE' }),
};
