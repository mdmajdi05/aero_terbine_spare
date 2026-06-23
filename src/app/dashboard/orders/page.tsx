'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Truck, ExternalLink } from 'lucide-react';
import { getMyOrders } from '@/services/dashboardService';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import type { Order } from '@/types';

type StatusFilter = 'All' | Order['status'];

const STATUS_TABS: StatusFilter[] = ['All', 'Processing', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'];

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const map: Record<Order['status'], string> = {
    Processing: 'bg-yellow-50 text-yellow-700',
    Confirmed:  'bg-blue-50 text-blue-700',
    'In Transit':'bg-orange/10 text-orange',
    Delivered:  'bg-green-50 text-green-700',
    Cancelled:  'bg-red-50 text-red-600',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', map[status] || 'bg-slate-100 text-slate-600')}>
      {status === 'In Transit' && <Truck className="w-3 h-3" />}
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<StatusFilter>('All');

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Orders' }]} />

      <h1 className="text-xl font-bold text-navy">My Orders</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All' ? orders.length : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filter === tab
                  ? 'bg-navy text-white'
                  : 'bg-white border border-silver text-text-muted hover:border-navy/30 hover:text-navy'
              )}
            >
              {tab}
              {!loading && (
                <span className={cn('ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]', filter === tab ? 'bg-white/20' : 'bg-silver')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-silver shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-silver flex items-center justify-center mb-3">
              <Package className="w-7 h-7 text-text-muted" />
            </div>
            <h3 className="font-semibold text-navy text-sm mb-1">
              {filter === 'All' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              {filter === 'All'
                ? 'Once your RFQs are accepted and converted to orders, they will appear here.'
                : `You have no orders with status "${filter}".`}
            </p>
            {filter === 'All' && (
              <Link href="/rfq">
                <Button variant="orange" size="sm">Submit Your First RFQ</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-silver bg-bg text-xs text-text-muted font-semibold">
                  <th className="text-left px-5 py-3">Order #</th>
                  <th className="text-left px-4 py-3">Items</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Tracking</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-silver last:border-0 hover:bg-bg transition-colors">
                    <td className="px-5 py-3">
                      <span className="part-number text-xs font-bold text-navy">{order.id}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      <div className="mt-0.5 truncate max-w-[140px] text-[10px]">
                        {order.items.map((i) => i.partNumber).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-text">
                      {formatPrice(order.totalAmount, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      {order.trackingNumber ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="part-number text-xs font-bold text-navy flex items-center gap-1">
                            {order.trackingNumber}
                            <ExternalLink className="w-3 h-3 text-text-muted" />
                          </span>
                          {order.carrier && (
                            <span className="text-[10px] text-text-muted">{order.carrier}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                      {formatDate(order.createdAt)}
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
