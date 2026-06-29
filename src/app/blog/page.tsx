'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/blog/PostCard';
import { useBlogPosts, useCategories, useTags } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';

export default function BlogPage() {
  return (
    <Suspense fallback={<div />}>
      <BlogPageContent />
    </Suspense>
  );
}

function BlogPageContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const page     = searchParams.get('page')     ?? '1';
  const category = searchParams.get('category') ?? '';
  const tag      = searchParams.get('tag')      ?? '';
  const search   = searchParams.get('search')   ?? '';

  const params: Record<string, string> = { page, limit: '9' };
  if (category) params.category = category;
  if (tag)      params.tag      = tag;
  if (search)   params.search   = search;

  const { data: postsRes, isLoading } = useBlogPosts(params);
  const { data: catsRes } = useCategories();
  const { data: tagsRes } = useTags();

  const posts = postsRes?.data ?? [];
  const categories = catsRes?.data ?? [];
  const tags = tagsRes?.data ?? [];
  const pagination = postsRes?.pagination ?? { total: 0, page: 1, totalPages: 1 };

  const [mobileSidebar, setMobileSidebar] = useState(false);

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  }

  const SidebarContent = () => (
    <aside className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
        <h3 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-3">Categories</h3>
        <ul className="space-y-1">
          <li>
            <button onClick={() => navigate('category', '')} className={`text-sm w-full text-left px-3 py-2 rounded-lg min-h-[36px] ${!category ? 'text-[#4F46E5] font-semibold bg-[#EEF2FF]' : 'text-[#4A4A6A] hover:text-[#4F46E5] hover:bg-[#F5F7FA]'}`}>
              All Posts
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id} className="group relative">
              <button onClick={() => navigate('category', c.slug)} className={`text-sm w-full text-left px-3 py-2 rounded-lg min-h-[36px] flex justify-between items-center ${category === c.slug ? 'text-[#4F46E5] font-semibold bg-[#EEF2FF]' : 'text-[#4A4A6A] hover:text-[#4F46E5] hover:bg-[#F5F7FA]'}`}>
                <span className="truncate">{c.name}</span>
                <span className="text-xs text-[#C0C9D5] flex-shrink-0 ml-2">{c._count?.posts ?? 0}</span>
              </button>
              {c.description && (
                <div className="absolute left-0 top-full z-10 mt-1 w-56 bg-[#0A1628] text-white text-xs rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {c.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8EDF2] p-5">
          <h3 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const maxCount = Math.max(...tags.map((x) => x._count?.posts ?? 0), 1);
              const count = t._count?.posts ?? 0;
              const weight = count / maxCount;
              const size = weight > 0.7 ? 'text-sm' : weight > 0.3 ? 'text-xs' : 'text-[11px]';
              const opacity = weight > 0.5 ? 'opacity-100' : 'opacity-70';
              return (
                <button key={t.id} onClick={() => navigate('tag', tag === t.slug ? '' : t.slug)}
                  className={`${size} ${opacity} px-2.5 py-1.5 rounded-full border transition-colors min-h-[32px] ${tag === t.slug ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5]'}`}>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0A1628] to-[#1A1A2E] py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-[#E8751A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">Knowledge Hub</p>
            <h1 className="text-white font-bold text-4xl md:text-5xl mb-4">Aerospace Industry Insights</h1>
            <p className="text-[#C0C9D5] text-lg max-w-2xl mx-auto">
              Expert articles on aviation parts, MRO best practices, and supply chain intelligence.
            </p>

            {/* Search bar */}
            <form
              onSubmit={(e) => { e.preventDefault(); navigate('search', (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value); }}
              className="mt-8 flex max-w-md mx-auto"
            >
              <input
                name="q"
                defaultValue={search}
                placeholder="Search articles…"
                className="flex-1 rounded-l-lg px-4 py-3 text-sm text-[#0A1628] focus:outline-none"
              />
              <button type="submit" className="bg-[#E8751A] hover:bg-[#d4691a] text-white px-5 py-3 rounded-r-lg font-semibold text-sm">
                Search
              </button>
            </form>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Mobile sidebar toggle */}
            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setMobileSidebar(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-[#E8EDF2] text-sm font-medium text-[#4A4A6A] hover:border-[#4F46E5] transition-colors min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                Categories & Tags
              </button>
              {(category || tag) && (
                <span className="text-xs text-[#4F46E5] font-medium px-2 py-1 bg-[#EEF2FF] rounded-full">
                  {(category ? 1 : 0) + (tag ? 1 : 0)} active
                </span>
              )}
            </div>

            {/* Mobile sidebar overlay */}
            {mobileSidebar && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
                <div className="absolute left-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-[#E8EDF2]">
                    <h2 className="font-semibold text-[#1A1A2E]">Filters</h2>
                    <button onClick={() => setMobileSidebar(false)} className="p-2 rounded-lg hover:bg-[#F5F7FA]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <SidebarContent />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop sidebar */}
            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
              <SidebarContent />
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden animate-pulse">
                      <div className="aspect-[16/9] bg-[#E8EDF2]" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-[#E8EDF2] rounded w-3/4" />
                        <div className="h-3 bg-[#E8EDF2] rounded w-full" />
                        <div className="h-3 bg-[#E8EDF2] rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[#C0C9D5] text-lg">No articles found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((p) => <PostCard key={p.id} post={p} />)}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button key={i} onClick={() => navigate('page', String(i + 1))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${Number(page) === i + 1 ? 'bg-[#4F46E5] text-white' : 'border border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5]'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
