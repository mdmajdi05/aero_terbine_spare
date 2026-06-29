'use client';

import { useEffect, useState } from 'react';
import { blogService } from '@/services/blogService';
import toast from 'react-hot-toast';

export default function SitemapPage() {
  const [data, setData] = useState<{
    posts: { slug: string; updatedAt: string; publishedAt: string }[];
    categories: { slug: string; name: string }[];
    tags: { slug: string; name: string }[];
    generatedAt: string;
    totalUrls: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await blogService.sitemap();
      setData(res.data);
    } catch {
      toast.error('Failed to load sitemap data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await blogService.sitemap();
      toast.success('Sitemap data refreshed');
      await load();
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-widest mb-1">SEO</p>
            <h1 className="text-2xl font-bold text-[#0A1628]">Sitemap</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              className="border border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5] hover:text-[#4F46E5] font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              View Sitemap
            </a>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="bg-white rounded-2xl border border-[#E8EDF2] p-6">
              <div className="h-4 bg-[#E8EDF2] rounded w-1/3 mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#E8EDF2] rounded-lg" />
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8EDF2] p-6">
              <div className="h-4 bg-[#E8EDF2] rounded w-1/4 mb-4" />
              <div className="h-20 bg-[#E8EDF2] rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
                <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-1">Total URLs</p>
                <p className="text-3xl font-bold text-[#0A1628]">{data?.totalUrls ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
                <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-1">Blog Posts</p>
                <p className="text-3xl font-bold text-[#0A1628]">{data?.posts.length ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
                <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-1">Categories</p>
                <p className="text-3xl font-bold text-[#0A1628]">{data?.categories.length ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
                <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-1">Tags</p>
                <p className="text-3xl font-bold text-[#0A1628]">{data?.tags.length ?? 0}</p>
              </div>
            </div>

            {/* Blog posts table */}
            <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-[#E8EDF2] flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Blog Posts ({data?.posts.length ?? 0})</h2>
              </div>
              {data && data.posts.length > 0 ? (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#F8FAFC]">
                      <tr className="border-b border-[#E8EDF2]">
                        <th className="text-left px-5 py-2 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">URL</th>
                        <th className="text-left px-5 py-2 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EDF2]">
                      {data.posts.map((p) => (
                        <tr key={p.slug} className="hover:bg-[#F8FAFC]">
                          <td className="px-5 py-2">
                            <a href={`/blog/${p.slug}`} target="_blank" className="text-[#4F46E5] hover:underline text-xs font-mono">
                              /blog/{p.slug}
                            </a>
                          </td>
                          <td className="px-5 py-2 text-xs text-[#C0C9D5]">
                            {new Date(p.updatedAt || p.publishedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[#C0C9D5] text-sm">No published blog posts yet.</div>
              )}
            </div>

            {/* Categories & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8EDF2]">
                  <h2 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Categories ({data?.categories.length ?? 0})</h2>
                </div>
                {data && data.categories.length > 0 ? (
                  <div className="p-4 space-y-1 max-h-48 overflow-y-auto">
                    {data.categories.map((c) => (
                      <a key={c.slug} href={`/blog/category/${c.slug}`} target="_blank"
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#F8FAFC] text-sm text-[#4A4A6A] hover:text-[#4F46E5] transition-colors">
                        <span>{c.name}</span>
                        <span className="text-xs text-[#C0C9D5] font-mono">/{c.slug}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#C0C9D5] text-sm">No categories.</div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8EDF2]">
                  <h2 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Tags ({data?.tags.length ?? 0})</h2>
                </div>
                {data && data.tags.length > 0 ? (
                  <div className="p-4 flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                    {data.tags.map((t) => (
                      <a key={t.slug} href={`/blog/tag/${t.slug}`} target="_blank"
                        className="text-xs px-2.5 py-1 rounded-full bg-[#F0F4F8] text-[#4A4A6A] hover:bg-[#4F46E5] hover:text-white transition-colors">
                        #{t.name}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#C0C9D5] text-sm">No tags.</div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
              <h2 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-3">About Sitemap</h2>
              <div className="text-sm text-[#4A4A6A] space-y-2">
                <p>The sitemap is automatically generated at <code className="text-xs bg-[#F0F4F8] px-1.5 py-0.5 rounded font-mono">/sitemap.xml</code> and includes all published blog posts, categories, tags, product pages, and static pages.</p>
                <p>New blog posts, categories, and tags are included automatically when published. The sitemap is generated dynamically on each request.</p>
                <p>Priority levels: Home (1.0) &gt; Catalog &amp; Blog listing (0.9) &gt; Products &amp; Blog posts (0.8) &gt; Categories (0.5) &gt; Tags (0.4) &gt; Legal pages (0.3).</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
