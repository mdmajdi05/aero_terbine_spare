'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { List, LayoutGrid, Search, X, ArrowLeft, Package, ChevronDown } from 'lucide-react';
import { request } from '@/lib/api-client';
import type { NavCategoryTree, NavCategory, CategoryItem } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ListView from '@/components/catalog/ListView';
import CardView from '@/components/catalog/CardView';
import { cn } from '@/lib/utils';

interface PartCategory extends NavCategory {}

export default function PartCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<PartCategory | null>(null);
  const [navTree, setNavTree] = useState<NavCategoryTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'card' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cardTitleField, setCardTitleField] = useState('');
  const [cardDescField, setCardDescField] = useState('');
  const [cardImageField, setCardImageField] = useState('');
  const [filterField, setFilterField] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

     request<{ success: boolean; data: NavCategoryTree }>('/nav-categories')
       .then((res) => {
         if (cancelled) return;
         setNavTree(res.data);
         const found = res.data.partCategories?.find((c) => c.slug === slug) as PartCategory | undefined;
         if (found) {
           setCategory(found);
          // Set default view from cardConfig, fallback to 'card'
          setViewMode((found.cardConfig?.template as 'list' | 'card') || 'list');
        } else {
          setError('Part category not found');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load category');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  const items = category?.items ?? [];

  const allDataKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of items) {
      if (item.data) Object.keys(item.data).forEach(k => keys.add(k));
    }
    return Array.from(keys).filter(k => k !== '_columnOrder');
  }, [items]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (filterField) {
      const val = String(item.data?.[filterField] ?? '');
      return val.toLowerCase().includes(q);
    }
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description ?? '').toLowerCase().includes(q)
    );
  });

  // Related categories from pageConfig
  const pageCfg = (category?.pageConfig ?? {}) as Record<string, unknown>;
  const relatedSlugs = (pageCfg.relatedSlugs as string[]) || [];
  const allCats = [...(navTree?.productCategories ?? []), ...(navTree?.partCategories ?? [])];
  const relatedCats = allCats.filter((c) => relatedSlugs.includes(c.slug));

  const effectiveView = viewMode ?? 'list';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-bg">
          <div className="bg-gradient-to-br from-navy via-[#1A1A3E] to-[#0F0F2E] py-16 px-4">
            <div className="max-w-7xl mx-auto animate-pulse space-y-5">
              <div className="h-3 w-40 bg-white/10 rounded" />
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-72 bg-white/10 rounded-lg" />
                  <div className="h-4 w-96 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
            <div className="h-12 w-full bg-silver/60 rounded-2xl" />
            <div className="h-64 w-full bg-silver/30 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-b from-bg to-silver/20">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center mx-auto mb-6 ring-1 ring-red-200">
              <Package className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-text mb-2">Category Not Found</h1>
            <p className="text-text-muted text-sm leading-relaxed mb-8">{error ?? 'The category you\'re looking for doesn\'t exist or may have been removed.'}</p>
            <Link href="/catalog">
              <Button variant="orange" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Browse Catalog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-navy via-[#1A1A3E] to-[#0F0F2E] text-white py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          {category.pageConfig && (category.pageConfig as any).heroImage && (
            <div className="absolute inset-0">
              <img src={(category.pageConfig as any).heroImage} alt="" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-navy/80 via-[#1A1A3E]/80 to-[#0F0F2E]/80" />
            </div>
          )}
          <div className="relative max-w-7xl mx-auto">
            <Breadcrumb
              className="mb-5 [&_a]:text-white/60 [&_a:hover]:text-orange [&_span]:text-white/40"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Parts', href: '/catalog' },
                { label: category.name },
              ]}
            />
            <div className="flex items-start gap-6">
              {category.icon && (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange/30 to-orange/10 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange/10 ring-1 ring-white/10">
                  <Package className="w-8 h-8 text-orange" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">{category.name}</h1>
                  {category.partCount !== undefined && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange/20 text-orange ring-1 ring-orange/30">
                      {category.partCount.toLocaleString()} items
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-white/70 text-base sm:text-lg mt-2 max-w-3xl leading-relaxed">{category.description}</p>
                )}
                {category.manufacturer && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-white/40">Manufacturer:</span>
                    <span className="font-semibold text-orange bg-orange/10 px-2.5 py-0.5 rounded-md">{category.manufacturer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-silver/60 shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-sm border border-silver rounded-lg bg-bg/50 text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/50 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-muted transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {allDataKeys.length > 0 && (
                  <select value={filterField} onChange={(e) => setFilterField(e.target.value)}
                    className="border border-silver rounded-lg px-2.5 py-2.5 text-xs bg-bg/50 text-text-muted focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/50 transition-all">
                    <option value="">All fields</option>
                    {allDataKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 bg-bg rounded-xl p-1 border border-silver self-start">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', effectiveView === 'list' ? 'bg-white text-navy shadow-sm ring-1 ring-silver' : 'text-text-muted hover:text-text')}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" /> List
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', effectiveView === 'card' ? 'bg-white text-navy shadow-sm ring-1 ring-silver' : 'text-text-muted hover:text-text')}
                  aria-label="Card view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Card
                </button>
              </div>

              {/* Card field mapping — visible only when card view is active */}
              {effectiveView === 'card' && allDataKeys.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-bg/80 rounded-xl px-3 py-2 border border-silver self-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/60 mr-1">Map fields</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-text-muted">Title:</span>
                    <select value={cardTitleField} onChange={(e) => setCardTitleField(e.target.value)}
                      className="border border-silver rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-orange/40">
                      <option value="">— Default —</option>
                      {allDataKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-text-muted">Desc:</span>
                    <select value={cardDescField} onChange={(e) => setCardDescField(e.target.value)}
                      className="border border-silver rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-orange/40">
                      <option value="">— Default —</option>
                      {allDataKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-text-muted">Image:</span>
                    <select value={cardImageField} onChange={(e) => setCardImageField(e.target.value)}
                      className="border border-silver rounded-md px-2 py-1 text-[11px] bg-white focus:outline-none focus:ring-1 focus:ring-orange/40">
                      <option value="">— Default —</option>
                      {allDataKeys.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-silver/50 to-silver/20 flex items-center justify-center mb-5 ring-1 ring-silver/50">
                <Package className="w-8 h-8 text-text-muted/60" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">No items found</h3>
              <p className="text-text-muted text-sm max-w-sm leading-relaxed">
                {searchQuery ? 'No items match your search. Try different keywords.' : 'This category is empty. Items will appear here once added.'}
              </p>
            </div>
          ) : (
            <>
              {effectiveView === 'list' && (
                <ListView
                  items={filteredItems.map((item) => ({
                    id: item.id,
                    data: item.data ?? {},
                    cardConfig: item.cardConfig,
                  }))}
                  cardConfig={category.cardConfig as Record<string, unknown> | undefined}
                />
              )}
              {effectiveView === 'card' && (
                <CardView
                  items={filteredItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    image: item.image,
                    data: item.data ?? {},
                    cardConfig: item.cardConfig,
                  }))}
                  cardConfig={{
                    ...(category.cardConfig as Record<string, unknown> || {}),
                    ...(cardTitleField ? { titleField: cardTitleField } : {}),
                    ...(cardDescField ? { descField: cardDescField } : {}),
                    ...(cardImageField ? { imageField: cardImageField } : {}),
                  }}
                />
              )}
            </>
          )}

          {/* Content section from pageConfig */}
          {(pageCfg.content as string) && (
            <div className="mt-10 bg-white rounded-2xl border border-silver/60 shadow-sm p-6 sm:p-8">
              <div className="prose prose-sm max-w-none text-text leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageCfg.content as string }} />
            </div>
          )}

          {/* Related categories */}
          {relatedCats.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold text-navy mb-4">Related Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCats.map((rc) => {
                  const rcItems = (rc.items ?? []).slice(0, 4);
                  return (
                    <Link key={rc.id} href={`/parts/${rc.slug}`}
                      className="bg-white border border-silver/70 rounded-xl p-4 hover:shadow-md hover:border-orange/30 transition-all group">
                      <h4 className="font-semibold text-navy group-hover:text-orange transition-colors mb-2">{rc.name}</h4>
                      {rc.description && <p className="text-xs text-text-muted line-clamp-2 mb-3">{rc.description}</p>}
                      {rcItems.length > 0 && (
                        <div className="text-[10px] text-text-muted/60 border-t border-silver/30 pt-2 mt-auto">
                          {rcItems.length} item{rcItems.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
