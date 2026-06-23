'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { getMyRFQs } from '@/services/rfqService';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import type { RFQ } from '@/types';

type StatusFilter = 'All' | 'Pending' | 'Under Review' | 'Quoted' | 'Ordered' | 'Cancelled';

const STATUS_TABS: StatusFilter[] = ['All', 'Pending', 'Under Review', 'Quoted', 'Ordered', 'Cancelled'];

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

function UrgencyBadge({ urgency }: { urgency: RFQ['urgency'] }) {
  return <Badge label={urgency} type="urgency" />;
}

function RFQRow({ rfq }: { rfq: RFQ }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        className="border-b border-silver hover:bg-bg transition-colors cursor-pointer"
        onClick={() => setOpen((p) => !p)}
      >
        <td className="px-5 py-3">
          <span className="part-number text-xs font-bold text-navy">{rfq.id}</span>
        </td>
        <td className="px-4 py-3 text-xs text-text-muted max-w-[160px]">
          <span className="truncate block">{rfq.items.map((i) => i.partNumber).join(', ')}</span>
        </td>
        <td className="px-4 py-3 text-xs text-text-muted">{rfq.companyName}</td>
        <td className="px-4 py-3">
          <UrgencyBadge urgency={rfq.urgency} />
        </td>
        <td className="px-4 py-3">
          <RFQStatusBadge status={rfq.status} />
        </td>
        <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
          {formatDate(rfq.createdAt)}
        </td>
        <td className="px-4 py-3 text-xs font-semibold text-text">
          {rfq.quoteAmount != null
            ? formatPrice(rfq.quoteAmount, rfq.quoteCurrency || 'USD')
            : <span className="text-text-muted">—</span>}
        </td>
        <td className="px-4 py-3 text-text-muted">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      {open && (
        <tr className="border-b border-silver bg-bg">
          <td colSpan={8} className="px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Contact */}
              <div className="space-y-1">
                <div className="font-semibold text-navy mb-1.5">Contact</div>
                <div><span className="text-text-muted">Name:</span> {rfq.contactName}</div>
                <div><span className="text-text-muted">Email:</span> {rfq.email}</div>
                <div><span className="text-text-muted">Phone:</span> {rfq.phone}</div>
              </div>
              {/* Shipping */}
              <div className="space-y-1">
                <div className="font-semibold text-navy mb-1.5">Shipping</div>
                <div><span className="text-text-muted">Address:</span> {rfq.shippingAddress}</div>
                <div><span className="text-text-muted">Country:</span> {rfq.shippingCountry}</div>
                <div><span className="text-text-muted">Incoterms:</span> {rfq.incoterms}</div>
                <div><span className="text-text-muted">Deadline:</span> {formatDate(rfq.deliveryDeadline)}</div>
              </div>
              {/* Items */}
              <div>
                <div className="font-semibold text-navy mb-1.5">Parts ({rfq.items.length})</div>
                <ul className="space-y-1">
                  {rfq.items.map((item, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="part-number text-navy font-bold">{item.partNumber}</span>
                      <span className="text-text-muted">× {item.quantity}</span>
                      {item.condition && <span className="text-text-muted">({item.condition})</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Special instructions */}
              {rfq.specialInstructions && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="font-semibold text-navy mb-1.5">Special Instructions</div>
                  <p className="text-text-muted">{rfq.specialInstructions}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RFQsPage() {
  const [rfqs,    setRfqs]    = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<StatusFilter>('All');

  useEffect(() => {
    getMyRFQs()
      .then(setRfqs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All'
    ? rfqs
    : rfqs.filter((r) => r.status === filter);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My RFQs' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-navy">My RFQs</h1>
        <Link href="/rfq">
          <Button variant="orange" size="sm">
            <Plus className="w-4 h-4" />
            New RFQ
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All' ? rfqs.length : rfqs.filter((r) => r.status === tab).length;
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
            <SkeletonTable rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-silver flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-text-muted" />
            </div>
            <h3 className="font-semibold text-navy text-sm mb-1">
              {filter === 'All' ? 'No RFQs yet' : `No ${filter} RFQs`}
            </h3>
            <p className="text-xs text-text-muted mb-4 max-w-xs">
              {filter === 'All'
                ? 'Submit your first RFQ to start sourcing aerospace parts.'
                : `You have no RFQs with status "${filter}".`}
            </p>
            {filter === 'All' && (
              <Link href="/rfq">
                <Button variant="orange" size="sm">Submit RFQ</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-silver bg-bg text-xs text-text-muted font-semibold">
                  <th className="text-left px-5 py-3">RFQ #</th>
                  <th className="text-left px-4 py-3">Part Numbers</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Urgency</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Quote</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((rfq) => (
                  <RFQRow key={rfq.id} rfq={rfq} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
