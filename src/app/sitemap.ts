import type { MetadataRoute } from 'next';
import productsData from '@/data/products.json';

const BASE = 'https://aeroturbinespare.com';
const API  = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/catalog`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/rfq`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/inventory`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/quality`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/industries`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/industries/aerospace`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/industries/military-defense`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/industries/automotive`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/industries/medical`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/industries/electronics`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/industries/telecom`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/terms`,              lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/blog`,               lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  ];

  // Product pages (from static product data)
  const productPages: MetadataRoute.Sitemap = (productsData as Array<{ id: string; updatedAt: string }>).map((p) => ({
    url: `${BASE}/catalog/${p.id}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Blog posts (fetched from backend at request time)
  let blogPages: MetadataRoute.Sitemap = [];
  let categoryPages: MetadataRoute.Sitemap = [];
  let tagPages: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${API}/blog/sitemap`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    if (json.success) {
      const { posts, categories, tags } = json.data;

      blogPages = (posts as Array<{ slug: string; updatedAt: string; publishedAt: string }>)
        .filter((p) => p.slug)
        .map((p) => ({
          url: `${BASE}/blog/${p.slug}`,
          lastModified: new Date(p.updatedAt || p.publishedAt),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

      categoryPages = (categories as Array<{ slug: string }>)
        .filter((c) => c.slug)
        .map((c) => ({
          url: `${BASE}/blog/category/${c.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.5,
        }));

      tagPages = (tags as Array<{ slug: string }>)
        .filter((t) => t.slug)
        .map((t) => ({
          url: `${BASE}/blog/tag/${t.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.4,
        }));
    }
  } catch {
    // Backend unavailable — skip blog sitemap entries
  }

  return [...staticPages, ...productPages, ...blogPages, ...categoryPages, ...tagPages];
}
