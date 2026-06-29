import type { BlogPost, BlogCategory, BlogTag, BlogMedia, BlogComment, BlogPostVersion, BlogRedirect, LinkIssue, LinkEquityItem } from '@/types/blog';
import { getAccessToken, refreshAccessToken, clearTokens } from '@/lib/token';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

export async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };
  const token = getAccessToken();

  if (!token) {
    throw new Error('Please log in again');
  }

  // Clear stale mock tokens from a previous mock-mode session
  if (token.startsWith('mock-jwt-')) {
    clearTokens();
    throw new Error('Session expired. Please log in again.');
  }

  headers.Authorization = `Bearer ${token}`;

  let res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, { ...init, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? 'Session expired. Please log in again.');
    }
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Request failed');
  return json as T;
}

type ListResp<T> = { success: true; data: T[]; pagination: Pagination };
type SingleResp<T> = { success: true; data: T };
type SimpleResp = { success: true; };
type Pagination = { total: number; page: number; limit: number; totalPages: number };

// ── Public ────────────────────────────────────────────────────

export const blogService = {
  posts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return req<ListResp<BlogPost>>(`/blog/posts${qs}`);
    },
    get: (slug: string) => req<SingleResp<BlogPost>>(`/blog/posts/${slug}`),
  },

  categories: {
    list: () => req<ListResp<BlogCategory>>('/blog/categories'),
  },

  tags: {
    list: () => req<ListResp<BlogTag>>('/blog/tags'),
  },

  comments: {
    submit: (postId: string, body: { content: string; guestName?: string; guestEmail?: string }) =>
      req<SimpleResp>(`/blog/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ postId, ...body }) }),
  },

  sitemap: () => req<{
    success: true;
    data: {
      posts: { slug: string; updatedAt: string; publishedAt: string }[];
      categories: { slug: string; name: string }[];
      tags: { slug: string; name: string }[];
      generatedAt: string;
      totalUrls: number;
    };
  }>('/blog/sitemap'),

  // ── Dashboard (requires ContentManager, Admin, or SuperAdmin) ──

  manage: {
    posts: {
      list: (params?: Record<string, string>) => {
        const qs = params ? `?${new URLSearchParams(params)}` : '';
        return req<ListResp<BlogPost>>(`/blog/manage/posts${qs}`);
      },
      get: (id: string) => req<SingleResp<BlogPost>>(`/blog/manage/posts/${id}`),
      search: (q: string) => req<{ success: true; data: { id: string; title: string; slug: string }[] }>(`/blog/manage/posts/search?q=${encodeURIComponent(q)}`),
      create: (body: Partial<BlogPost> & { categoryIds?: string[]; tagIds?: string[] }) =>
        req<SingleResp<BlogPost>>('/blog/manage/posts', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Partial<BlogPost> & { categoryIds?: string[]; tagIds?: string[] }) =>
        req<SingleResp<BlogPost>>(`/blog/manage/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      trash:   (id: string) => req<SimpleResp>(`/blog/manage/posts/${id}/trash`,   { method: 'PATCH' }),
      restore: (id: string) => req<SimpleResp>(`/blog/manage/posts/${id}/restore`, { method: 'PATCH' }),
      delete:  (id: string) => req<SimpleResp>(`/blog/manage/posts/${id}`,         { method: 'DELETE' }),
    },

    categories: {
      list:   () => req<ListResp<BlogCategory>>('/blog/categories'),
      create: (body: { name: string; description?: string }) =>
        req<SingleResp<BlogCategory>>('/blog/categories', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: { name?: string; description?: string }) =>
        req<SingleResp<BlogCategory>>(`/blog/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      delete: (id: string) => req<SimpleResp>(`/blog/categories/${id}`, { method: 'DELETE' }),
    },

    tags: {
      list:   () => req<ListResp<BlogTag>>('/blog/tags'),
      create: (body: { name: string }) =>
        req<SingleResp<BlogTag>>('/blog/tags', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: { name: string }) =>
        req<SingleResp<BlogTag>>(`/blog/tags/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      delete: (id: string) => req<SimpleResp>(`/blog/tags/${id}`, { method: 'DELETE' }),
    },

    media: {
      list: (params?: Record<string, string>) => {
        const qs = params ? `?${new URLSearchParams(params)}` : '';
        return req<ListResp<BlogMedia>>(`/blog/media${qs}`);
      },
      upload: async (file: File, alt = '') => {
        const form = new FormData();
        form.append('file', file);
        form.append('alt', alt);

        const headers: Record<string, string> = {};
        const token = getAccessToken();
        if (token) headers.Authorization = `Bearer ${token}`;

        let res = await fetch(`${API}/blog/media/upload`, {
          method: 'POST',
          headers,
          body: form,
        });

        if (res.status === 401 && token) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            res = await fetch(`${API}/blog/media/upload`, {
              method: 'POST',
              headers,
              body: form,
            });
          } else {
            clearTokens();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error ?? 'Session expired. Please log in again.');
          }
        }

        return res.json() as Promise<SingleResp<BlogMedia>>;
      },
      delete: (id: string) => req<SimpleResp>(`/blog/media/${id}`, { method: 'DELETE' }),
    },

    comments: {
      list: (params?: Record<string, string>) => {
        const qs = params ? `?${new URLSearchParams(params)}` : '';
        return req<ListResp<BlogComment>>(`/blog/comments${qs}`);
      },
      approve: (id: string) => req<SimpleResp>(`/blog/comments/${id}/approve`, { method: 'PATCH' }),
      delete:  (id: string) => req<SimpleResp>(`/blog/comments/${id}`, { method: 'DELETE' }),
    },

    versions: {
      list: (postId: string) => req<BlogPostVersion[]>(`/blog/manage/posts/${postId}/versions`),
      restore: (postId: string, versionId: string) =>
        req<BlogPost>(`/blog/manage/posts/${postId}/versions/${versionId}/restore`, { method: 'POST' }),
    },

    redirects: {
      list: (params?: Record<string, string>) => {
        const qs = params ? `?${new URLSearchParams(params)}` : '';
        return req<BlogRedirect[]>(`/blog/manage/redirects${qs}`);
      },
      get: (id: string) => req<BlogRedirect>(`/blog/manage/redirects/${id}`),
      create: (body: Record<string, unknown>) =>
        req<BlogRedirect>('/blog/manage/redirects', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Record<string, unknown>) =>
        req<BlogRedirect>(`/blog/manage/redirects/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      delete: (id: string) =>
        req<{ success: boolean }>(`/blog/manage/redirects/${id}`, { method: 'DELETE' }),
    },

    linkChecker: {
      analyze: () => req<{ broken: LinkIssue[]; total: number }>('/blog/manage/analyze-links', { method: 'POST' }),
    },

    seo: {
      linkEquity: () => req<LinkEquityItem[]>('/blog/manage/seo/link-equity'),
    },
  },
};
