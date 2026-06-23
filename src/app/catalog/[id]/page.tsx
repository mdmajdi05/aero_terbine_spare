'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download, ExternalLink, BookmarkCheck, Bookmark,
  GitCompareArrows, FileText, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Product } from '@/types';
import { getProductById, getProducts } from '@/services/productService';
import { savePart, unsavePart } from '@/services/dashboardService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PartCard from '@/components/catalog/PartCard';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { cn, formatPrice, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Tab types ──────────────────────────────────────────────────────────────
type Tab = 'specifications' | 'crossReferences' | 'documentation';

// ─── Component ──────────────────────────────────────────────────────────────
export default function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [product, setProduct]       = useState<Product | null>(null);
  const [related, setRelated]       = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('specifications');
  const [saved, setSaved]           = useState(false);
  const [relatedPage, setRelatedPage] = useState(0);
  const RELATED_PER_PAGE = 4;

  // ── Fetch product on mount ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then((res) => {
        if (!res.success || !res.data) {
          setNotFound(true);
          return;
        }
        const prod = res.data;
        setProduct(prod);

        // Fetch related parts in same FSG
        getProducts({ fsg: prod.fsg, limit: 8 })
          .then((r) => {
            setRelated(r.data.filter((p) => p.id !== prod.id).slice(0, 8));
          })
          .catch(() => setRelated([]));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Save toggle ──────────────────────────────────────────────────────────
  const handleSaveToggle = async () => {
    if (!product) return;
    try {
      if (saved) {
        await unsavePart(product.id);
        setSaved(false);
        toast.success('Removed from saved parts');
      } else {
        await savePart(product.id);
        setSaved(true);
        toast.success('Part saved to your list');
      }
    } catch {
      toast.error('Could not update saved parts. Please try again.');
    }
  };

  // ── Spec table renderer ──────────────────────────────────────────────────
  const renderSpecValue = (value: string | string[] | undefined) => {
    if (value === undefined || value === null) return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  // ── Related carousel helpers ─────────────────────────────────────────────
  const relatedPageCount = Math.ceil(related.length / RELATED_PER_PAGE);
  const visibleRelated   = related.slice(
    relatedPage * RELATED_PER_PAGE,
    relatedPage * RELATED_PER_PAGE + RELATED_PER_PAGE
  );

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-bg">
          <div className="bg-navy py-10">
            <div className="max-w-7xl mx-auto px-4">
              <Skeleton className="h-4 w-48 mb-4 bg-white/10" />
              <Skeleton className="h-8 w-72 bg-white/10" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Skeleton className="h-80 rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3 pt-4">
                  <Skeleton className="h-11 flex-1 rounded-lg" />
                  <Skeleton className="h-11 w-32 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── 404 state ──────────────────────────────────────────────────────────────
  if (notFound || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-bg flex items-center justify-center">
          <div className="text-center py-24 px-4">
            <div className="w-24 h-24 rounded-full bg-silver flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-text-muted" />
            </div>
            <h1 className="text-3xl font-bold text-text mb-3">Part Not Found</h1>
            <p className="text-text-muted mb-8 max-w-md mx-auto">
              The part you&apos;re looking for doesn&apos;t exist or may have been removed from our catalog.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/catalog">
                <Button variant="orange">Browse Catalog</Button>
              </Link>
              <Link href="/rfq">
                <Button variant="outline">Submit RFQ</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Spec entries for tab ────────────────────────────────────────────────────
  const specEntries = Object.entries(product.specifications).filter(
    ([, v]) => v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== '')
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-bg">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="bg-navy py-10">
          <div className="max-w-7xl mx-auto px-4">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Parts Catalog', href: '/catalog' },
                { label: product.partNumber },
              ]}
              className="mb-4 [&_a]:text-silver/60 [&_a:hover]:text-orange [&_.text-text]:text-silver/90"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="part-number text-2xl sm:text-3xl font-bold text-white mb-1">{product.partNumber}</h1>
                <p className="text-silver/70 text-sm">{product.shortDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={product.stockStatus} type="stock" />
                <Badge label={product.condition} type="condition" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* ── Two-column hero ────────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: image + tags */}
            <div>
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.partNumber}
                  className="w-full h-72 object-contain rounded-xl border border-silver bg-white p-4"
                />
              ) : (
                <div className="w-full h-72 rounded-xl border border-silver bg-white flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-bg flex items-center justify-center">
                    <FileText className="w-7 h-7 text-text-muted" />
                  </div>
                  <span className="part-number text-lg font-bold text-navy">{product.partNumber}</span>
                  <span className="text-xs text-text-muted">No image available</span>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy/8 text-navy border border-navy/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: part details + pricing + actions */}
            <div className="space-y-5">
              {/* Part number + badges */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge label={product.stockStatus} type="stock" />
                  <Badge label={product.condition} type="condition" />
                </div>
                <h2 className="part-number text-2xl font-bold text-navy mb-1">{product.partNumber}</h2>
                <p className="text-text text-sm leading-relaxed">{product.description}</p>
              </div>

              {/* Meta */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-32 text-text-muted">Manufacturer</span>
                  <span className="font-semibold text-text">{product.manufacturer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-32 text-text-muted">Category</span>
                  <span className="font-semibold text-text">{product.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-32 text-text-muted">Last Updated</span>
                  <span className="font-medium text-text-muted">{formatDate(product.updatedAt)}</span>
                </div>
              </div>

              {/* Pricing card */}
              <div className="bg-bg rounded-xl border border-silver p-5">
                {product.unitPrice > 0 ? (
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-black text-text">{formatPrice(product.unitPrice, product.currency)}</div>
                      <div className="text-xs text-text-muted mt-0.5">per unit · {product.currency}</div>
                      {product.quantityAvailable > 0 && (
                        <div className="text-xs text-success font-medium mt-1">
                          {product.quantityAvailable} unit{product.quantityAvailable !== 1 ? 's' : ''} available
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Min. Order</div>
                      <div className="text-sm font-semibold text-text">1 unit</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-lg font-bold text-text">Call for Pricing</div>
                      <div className="text-xs text-text-muted mt-0.5">Contact our team for a customized quote</div>
                    </div>
                    <a href="tel:+17138425500" className="text-orange font-semibold text-sm hover:underline">
                      +1-713-842-5500
                    </a>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/rfq?partId=${product.id}&partNumber=${encodeURIComponent(product.partNumber)}`}
                  className="flex-1"
                >
                  <Button variant="orange" size="lg" className="w-full">
                    Request Quote
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleSaveToggle}
                  className="flex items-center gap-2"
                >
                  {saved ? (
                    <><BookmarkCheck className="w-4 h-4 text-orange" /> Saved</>
                  ) : (
                    <><Bookmark className="w-4 h-4" /> Save Part</>
                  )}
                </Button>
                <Button variant="ghost" size="lg" className="flex items-center gap-2">
                  <GitCompareArrows className="w-4 h-4" /> Compare
                </Button>
              </div>
            </div>
          </div>

          {/* ── Info cards row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'NSN', value: product.nsn, mono: true },
              { label: 'CAGE Code', value: product.cage, mono: true },
              { label: 'FSG / FSC', value: `${product.fsg} / ${product.fsc}`, mono: true },
              { label: 'Qty Available', value: product.quantityAvailable.toString(), mono: false },
            ].map(({ label, value, mono }) => (
              <Card key={label} padding="sm" className="text-center">
                <div className="text-xs text-text-muted mb-1 uppercase tracking-wide">{label}</div>
                <div className={cn('text-lg font-bold text-navy', mono && 'part-number')}>{value}</div>
              </Card>
            ))}
          </div>

          {/* ── Tabbed content ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-silver overflow-hidden">
            {/* Tab nav */}
            <div className="flex border-b border-silver">
              {(
                [
                  ['specifications',  'Specifications'],
                  ['crossReferences', 'Cross References'],
                  ['documentation',   'Documentation'],
                ] as [Tab, string][]
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 sm:flex-none px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 -mb-px',
                    activeTab === tab
                      ? 'text-orange border-orange bg-orange/4'
                      : 'text-text-muted border-transparent hover:text-text hover:bg-bg'
                  )}
                >
                  {label}
                  {tab === 'crossReferences' && product.crossReferences.length > 0 && (
                    <span className="ml-2 bg-silver text-text-muted text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {product.crossReferences.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div className="p-6">
              {/* ── Specifications ───────────────────────────────────────── */}
              {activeTab === 'specifications' && (
                specEntries.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {specEntries.map(([key, value], i) => (
                        <tr key={key} className={cn('border-b border-silver last:border-0', i % 2 === 0 && 'bg-bg/50')}>
                          <td className="py-2.5 px-3 font-medium text-text-muted capitalize w-1/3">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </td>
                          <td className="py-2.5 px-3 text-text font-medium">
                            {renderSpecValue(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-text-muted text-sm py-4">No specifications available for this part.</p>
                )
              )}

              {/* ── Cross References ─────────────────────────────────────── */}
              {activeTab === 'crossReferences' && (
                product.crossReferences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product.crossReferences.map((ref) => (
                      <div
                        key={ref}
                        className="flex items-center justify-between bg-bg rounded-lg border border-silver px-4 py-3"
                      >
                        <span className="part-number text-sm font-semibold text-navy">{ref}</span>
                        <Link
                          href={`/catalog?search=${encodeURIComponent(ref)}`}
                          className="text-xs text-orange hover:underline flex items-center gap-1"
                        >
                          Search <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm py-4">No cross-reference part numbers on record.</p>
                )
              )}

              {/* ── Documentation ────────────────────────────────────────── */}
              {activeTab === 'documentation' && (
                product.datasheetUrl ? (
                  <div className="flex items-center gap-4 p-4 bg-bg rounded-xl border border-silver">
                    <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text text-sm">Technical Datasheet</div>
                      <div className="text-xs text-text-muted truncate">{product.datasheetUrl}</div>
                    </div>
                    <a
                      href={product.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button variant="orange" size="sm">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-silver flex items-center justify-center">
                      <FileText className="w-6 h-6 text-text-muted" />
                    </div>
                    <p className="text-text-muted text-sm">No documentation available for this part.</p>
                    <Link href={`/rfq?partId=${product.id}&partNumber=${encodeURIComponent(product.partNumber)}`}>
                      <Button variant="outline" size="sm">Request Documentation</Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>

          {/* ── Related parts ─────────────────────────────────────────────── */}
          {related.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-1">
                    <span className="w-5 h-px bg-orange" /> Related Parts
                  </div>
                  <h2 className="text-xl font-bold text-text">
                    More from FSG {product.fsg}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRelatedPage((p) => Math.max(0, p - 1))}
                    disabled={relatedPage === 0}
                    className="w-8 h-8 rounded-full border border-silver flex items-center justify-center bg-white hover:border-orange/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous related parts"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRelatedPage((p) => Math.min(relatedPageCount - 1, p + 1))}
                    disabled={relatedPage >= relatedPageCount - 1}
                    className="w-8 h-8 rounded-full border border-silver flex items-center justify-center bg-white hover:border-orange/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next related parts"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {visibleRelated.map((p) => (
                  <PartCard key={p.id} product={p} view="grid" />
                ))}
              </div>

              <div className="text-center mt-6">
                <Link href={`/catalog?fsg=${product.fsg}`}>
                  <Button variant="outline" size="sm">View All FSG {product.fsg} Parts</Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
