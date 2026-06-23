'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Trash2 } from 'lucide-react';
import { getSavedParts, unsavePart } from '@/services/dashboardService';
import PartCard from '@/components/catalog/PartCard';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function SavedPartsPage() {
  const [parts,   setParts]   = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    getSavedParts()
      .then(setParts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    setRemoving(productId);
    try {
      await unsavePart(productId);
      setParts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Part removed from saved list');
    } catch {
      toast.error('Failed to remove part. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Saved Parts' }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-navy">Saved Parts</h1>
        {!loading && parts.length > 0 && (
          <span className="text-sm text-text-muted">{parts.length} saved</span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <div className="bg-white rounded-xl border border-silver shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-silver flex items-center justify-center mb-3">
            <Bookmark className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="font-semibold text-navy text-sm mb-1">No saved parts yet</h3>
          <p className="text-xs text-text-muted mb-5 max-w-xs">
            Bookmark parts from the catalog to keep them here for quick reference or to add to future RFQs.
          </p>
          <Link href="/catalog">
            <Button variant="orange" size="sm">Browse Parts Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((product) => (
            <div key={product.id} className="relative group">
              <PartCard product={product} view="grid" />
              {/* Remove overlay button */}
              <button
                onClick={() => handleRemove(product.id)}
                disabled={removing === product.id}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white border border-silver shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:border-red-300 hover:text-red-600 text-text-muted disabled:opacity-50"
                aria-label="Remove from saved"
                title="Remove from saved"
              >
                {removing === product.id ? (
                  <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
