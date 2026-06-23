'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { request } from '@/lib/api-client';
import type { RFQ } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: RFQ['status'][] = ['Pending', 'Under Review', 'Quoted', 'Accepted', 'Ordered', 'Cancelled'];

const STATUS_COLORS: Record<string, string> = {
  Pending:      'bg-yellow-100 text-yellow-800',
  'Under Review':'bg-blue-100 text-blue-800',
  Quoted:       'bg-purple-100 text-purple-800',
  Accepted:     'bg-emerald-100 text-emerald-800',
  Ordered:      'bg-green-100 text-green-800',
  Cancelled:    'bg-red-100 text-red-800',
};

const URGENCY_COLORS: Record<string, string> = {
  Standard: 'bg-gray-100 text-gray-600',
  Urgent:   'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

function RFQDetailModal({ rfq, onClose, onUpdate }: { rfq: RFQ; onClose: () => void; onUpdate: (id: string, data: Partial<RFQ>) => Promise<void> }) {
  const [status, setStatus]         = useState<RFQ['status']>(rfq.status);
  const [quoteAmount, setQuoteAmount] = useState(rfq.quoteAmount?.toString() || '');
  const [saving, setSaving]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(rfq.id, {
      status,
      quoteAmount: quoteAmount ? parseFloat(quoteAmount) : undefined,
      quotedAt: status === 'Quoted' ? new Date().toISOString() : rfq.quotedAt,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF2]">
          <div>
            <h2 className="font-bold text-[#1A1A2E]">RFQ Detail</h2>
            <p className="text-xs font-mono text-[#E8751A]">{rfq.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F5F7FA]"><XCircle className="w-5 h-5 text-[#4A4A6A]" /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Company</span><p className="mt-1 font-medium">{rfq.companyName}</p></div>
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Contact</span><p className="mt-1 font-medium">{rfq.contactName}</p></div>
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Email</span><p className="mt-1">{rfq.email}</p></div>
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Phone</span><p className="mt-1">{rfq.phone}</p></div>
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Urgency</span>
              <p className="mt-1"><span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', URGENCY_COLORS[rfq.urgency])}>{rfq.urgency}</span></p>
            </div>
            <div><span className="text-[#4A4A6A] text-xs font-bold uppercase">Deadline</span><p className="mt-1">{rfq.deliveryDeadline}</p></div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-2">Requested Parts</h3>
            <div className="bg-[#F5F7FA] rounded-xl overflow-hidden">
              {rfq.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8EDF2] last:border-b-0">
                  <div>
                    <span className="font-mono text-xs text-[#E8751A] font-medium">{item.partNumber}</span>
                    <span className="text-xs text-[#4A4A6A] ml-2">{item.description?.slice(0, 50)}</span>
                  </div>
                  <span className="text-xs font-bold text-[#1A1A2E]">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {rfq.specialInstructions && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-2">Special Instructions</h3>
              <p className="text-sm text-[#4A4A6A] bg-[#F5F7FA] rounded-xl px-4 py-3">{rfq.specialInstructions}</p>
            </div>
          )}

          {/* Update fields */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8EDF2]">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-2">Update Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as RFQ['status'])}
                className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8751A]/30">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-2">Quote Amount (USD)</label>
              <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)}
                placeholder="e.g. 4500.00"
                className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8751A]/30" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#E8751A] text-white text-sm font-medium hover:bg-[#FF6B00] disabled:opacity-60 transition-colors">
            {saving ? 'Saving...' : 'Update RFQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRFQsPage() {
  const [rfqs,      setRFQs]      = useState<RFQ[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [selected,  setSelected]  = useState<RFQ | null>(null);
  const limit = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...(statusFilter && { status: statusFilter }) });
      const res = await request<{ success: boolean; data: RFQ[]; pagination: { total: number } }>(`/admin/rfqs?${qs}`);
      let data = res.data || [];
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((r) => r.id.toLowerCase().includes(q) || r.companyName?.toLowerCase().includes(q) || r.contactName?.toLowerCase().includes(q));
      }
      setRFQs(data);
      setTotal(res.pagination?.total || data.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (id: string, data: Partial<RFQ>) => {
    try {
      await request(`/admin/rfqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
      toast.success('RFQ updated');
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">RFQ Management</h1>
        <p className="text-[#4A4A6A] text-sm mt-0.5">{total} total requests for quotation</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search RFQ ID, company, contact..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8751A]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#E8751A]/30">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="p-2.5 rounded-xl border border-[#C0C9D5] hover:bg-[#F5F7FA]" title="Refresh">
          <RefreshCw className="w-4 h-4 text-[#4A4A6A]" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : rfqs.length === 0 ? (
          <div className="py-20 text-center">
            <CheckCircle className="w-12 h-12 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-[#4A4A6A]">No RFQs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#F5F7FA]">
                  {['RFQ ID','Company','Contact','Items','Urgency','Status','Date','Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-[#E8751A] font-medium">{rfq.id}</td>
                    <td className="px-5 py-3 font-medium text-[#1A1A2E] max-w-32 truncate">{rfq.companyName}</td>
                    <td className="px-5 py-3 text-[#4A4A6A] max-w-28 truncate">{rfq.contactName}</td>
                    <td className="px-5 py-3 text-[#4A4A6A]">{rfq.items?.length || 0}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', URGENCY_COLORS[rfq.urgency] || 'bg-gray-100 text-gray-600')}>
                        {rfq.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLORS[rfq.status] || 'bg-gray-100 text-gray-600')}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#4A4A6A] text-xs whitespace-nowrap">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelected(rfq)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8EDF2] hover:bg-[#C0C9D5] text-xs font-medium transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E8EDF2]">
            <span className="text-xs text-[#4A4A6A]">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && <RFQDetailModal rfq={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
}
