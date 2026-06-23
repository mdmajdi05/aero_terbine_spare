import type { MetadataRoute } from 'next';
import productsData from '@/data/products.json';

const BASE = 'https://aeroturbinespare.com';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];

  const productPages: MetadataRoute.Sitemap = (productsData as Array<{ id: string; updatedAt: string }>).map((p) => ({
    url: `${BASE}/catalog/${p.id}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
