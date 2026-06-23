'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import type { Product } from '@/types';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { useSavedParts } from '@/hooks/useSavedParts';
import toast from 'react-hot-toast';

interface PartCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export default function PartCard({ product, view = 'grid' }: PartCardProps) {
  const { isSaved, toggle } = useSavedParts();
  const saved = isSaved(product.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    await toggle(product.id);
    toast.success(saved ? 'Removed from saved parts' : 'Part saved to your list');
  };

  if (view === 'list') {
    return (
      <div className="bg-white border border-silver rounded-xl p-4 flex items-center gap-4 hover:border-orange/30 hover:shadow-sm transition-all">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="part-number text-xs font-bold text-navy">{product.partNumber}</span>
            <Badge label={product.stockStatus} type="stock" />
            <Badge label={product.condition} type="condition" />
          </div>
          <p className="text-sm text-text truncate">{product.shortDescription}</p>
          <p className="text-xs text-text-muted mt-0.5">NSN: <span className="part-number">{product.nsn}</span> · CAGE: <span className="part-number">{product.cage}</span> · {product.manufacturer}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            {/* <div className="text-sm font-bold text-text">{formatPrice(product.unitPrice)}</div>
            <div className="text-xs text-text-muted">per unit</div> */}
          </div>
          <button onClick={handleSave} className="p-2 rounded-lg hover:bg-silver transition-colors text-text-muted hover:text-navy" aria-label={saved ? 'Unsave' : 'Save'}>
            {saved ? <BookmarkCheck className="w-4 h-4 text-orange" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <Link href={`/catalog/${product.id}`} className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:underline">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-silver p-5 flex flex-col hover:shadow-md hover:border-orange/30 transition-all duration-200">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge label={product.stockStatus} type="stock" />
          <Badge label={product.condition} type="condition" />
        </div>
        <button
          onClick={handleSave}
          className="p-1.5 rounded-lg hover:bg-silver transition-colors text-text-muted hover:text-navy -mt-0.5 -mr-0.5"
          aria-label={saved ? 'Unsave part' : 'Save part'}
        >
          {saved ? <BookmarkCheck className="w-4 h-4 text-orange" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* Part info */}
      <div className="mb-3 flex-1">
        <div className="part-number text-sm font-bold text-navy mb-1">{product.partNumber}</div>
        <h3 className="text-sm text-text font-medium leading-snug line-clamp-2">{product.shortDescription}</h3>
        <p className="text-xs text-text-muted mt-1">{product.manufacturer}</p>
      </div>

      {/* NSN / CAGE */}
      <div className="flex gap-3 text-[11px] text-text-muted mb-4 bg-bg rounded-lg p-2">
        <div><span className="text-text-muted/60">NSN</span><br /><span className="part-number text-text font-medium">{product.nsn}</span></div>
        <div className="border-l border-silver-dark pl-3"><span className="text-text-muted/60">CAGE</span><br /><span className="part-number text-text font-medium">{product.cage}</span></div>
        <div className="border-l border-silver-dark pl-3"><span className="text-text-muted/60">Qty</span><br /><span className="text-text font-medium">{product.quantityAvailable}</span></div>
      </div>

      {/* Price + CTA */}
      <div className="flex items-center justify-between gap-2">
        <div>
          {/* <div className="text-base font-bold text-text">{formatPrice(product.unitPrice)}</div>
          <div className="text-[10px] text-text-muted">per unit / USD</div> */}
        </div>
        <Link
          href={`/catalog/${product.id}`}
          className="flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-navy-dark transition-colors"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
