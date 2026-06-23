'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Package, Bookmark, TrendingUp, ArrowRight, Plus } from 'lucide-react';
import { getMyRFQs } from '@/services/rfqService';
import { getMyOrders, getSavedParts } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import type { RFQ, Order, Product } from '@/types';

/* ---- Stat card ---- */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-silver p-5 flex items-center gap-4 shadow-sm">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        {loading ? (
          <>
            <Skeleton className="h-6 w-10 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-text">{value}</div>
            <div className="text-xs text-text-muted">{label}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---- Status badge helper ---- */
function RFQStatusBadge({ status }: { status: RFQ['status'] }) {
  const map: Record<RFQ['status'], string> = {
    Pending:       'bg-yellow-50 text-yellow-700',
    'Under Review':'bg-blue-50 text-blue-700',
    Quoted:        'bg-purple-50 text-purple-700',
    Accepted:      'bg-emerald-50 text-emerald-700',
    Ordered:       'bg-green-50 text-green-700',
    Cancelled:     'bg-red-50 text-red-600',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', map[status] || 'bg-slate-100 text-slate-600')}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [rfqs,   setRfqs]   = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [saved,  setSaved]  = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyRFQs(), getMyOrders(), getSavedParts()])
      .then(([r, o, s]) => {
        setRfqs(r);
        setOrders(o);
        setSaved(s);
      })
      .catch(() => {/* errors handled silently; data stays empty */})
      .finally(() => setLoading(false));
  }, []);

  const pendingRFQs  = rfqs.filter((r) => r.status === 'Pending' || r.status === 'Under Review');
  const activeOrders = orders.filter((o) => o.status === 'Processing' || o.status === 'Confirmed' || o.status === 'In Transit');
  const recentRFQs   = [...rfqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: 'Total RFQs',    value: rfqs.length,          icon: FileText,    color: 'bg-navy' },
    { label: 'Pending RFQs',  value: pendingRFQs.length,   icon: TrendingUp,  color: 'bg-orange' },
    { label: 'Active Orders', value: activeOrders.length,  icon: Package,     color: 'bg-emerald-600' },
    { label: 'Saved Parts',   value: saved.length,         icon: Bookmark,    color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">
            Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-text-muted mt-0.5">{user?.company}</p>
        </div>
        <Link href="/rfq">
          <Button variant="orange" size="md">
            <Plus className="w-4 h-4" />
            Submit New RFQ
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-xl border border-silver shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-silver">
          <h2 className="font-semibold text-navy text-sm">Recent RFQs</h2>
          <Link href="/dashboard/rfqs" className="text-xs text-orange font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : recentRFQs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-silver flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-text-muted" />
            </div>
            <h3 className="font-semibold text-navy text-sm mb-1">No RFQs yet</h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              Submit your first Request for Quotation to get certified aerospace parts priced fast.
            </p>
            <Link href="/rfq">
              <Button variant="orange" size="sm">Submit Your First RFQ</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-silver bg-bg text-xs text-text-muted font-semibold">
                  <th className="text-left px-6 py-3">RFQ ID</th>
                  <th className="text-left px-4 py-3">Part(s)</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-silver last:border-0 hover:bg-bg transition-colors">
                    <td className="px-6 py-3">
                      <span className="part-number text-xs font-bold text-navy">{rfq.id}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs max-w-[160px] truncate">
                      {rfq.items.map((i) => i.partNumber).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                      {formatDate(rfq.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <RFQStatusBadge status={rfq.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/dashboard/rfqs">
                        <Button variant="ghost" size="sm" className="text-xs">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
