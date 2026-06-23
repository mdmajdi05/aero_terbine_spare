'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, ChevronLeft, ChevronRight, ExternalLink,
  RefreshCw, Package, Plus, Edit2, Trash2, X,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import type { Product } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STOCK_COLORS: Record<string, string> = {
  'In Stock': 'bg-green-100 text-green-800',
  'On Order': 'bg-yellow-100 text-yellow-800',
  'Obsolete': 'bg-red-100 text-red-800',
  'Limited':  'bg-purple-100 text-purple-800',
};

const CONDITIONS   = ['New', 'Overhauled', 'Refurbished', 'Used'] as const;
const STOCK_OPTS   = ['In Stock', 'On Order', 'Obsolete', 'Limited'] as const;
const CATEGORIES   = ['Turbines & Engines', 'Airframe', 'Bearings', 'Electronics', 'Hydraulics', 'Structural', 'Avionics', 'General'];

type PartForm = {
  partNumber: string; nsn: string; cage: string; description: string;
  shortDescription: string; manufacturer: string; category: string;
  condition: string; stockStatus: string; quantityAvailable: string;
  unitPrice: string; fsg: string; fsc: string;
};

const EMPTY_FORM: PartForm = {
  partNumber: '', nsn: '', cage: '', description: '',
  shortDescription: '', manufacturer: '', category: 'General',
  condition: 'New', stockStatus: 'In Stock', quantityAvailable: '0',
  unitPrice: '0', fsg: '', fsc: '',
};

// ── Part CRUD Modal ───────────────────────────────────────
function PartModal({ mode, part, onClose, onSave }: {
  mode: 'add' | 'edit';
  part?: Product;
  onClose: () => void;
  onSave: (data: PartForm) => Promise<void>;
}) {
  const [form, setForm] = useState<PartForm>(
    part
      ? {
          partNumber:       part.partNumber,
          nsn:              part.nsn,
          cage:             part.cage,
          description:      part.description,
          shortDescription: part.shortDescription,
          manufacturer:     part.manufacturer,
          category:         part.category,
          condition:        part.condition,
          stockStatus:      part.stockStatus,
          quantityAvailable: String(part.quantityAvailable),
          unitPrice:         String(part.unitPrice),
          fsg:              part.fsg,
          fsc:              part.fsc,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const set = (k: keyof PartForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E]">{mode === 'add' ? 'Add New Part' : 'Edit Part'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'partNumber',       label: 'Part Number *',       col: 1 },
            { key: 'nsn',              label: 'NSN',                  col: 1 },
            { key: 'cage',             label: 'CAGE Code',            col: 1 },
            { key: 'manufacturer',     label: 'Manufacturer *',       col: 1 },
            { key: 'shortDescription', label: 'Short Description',    col: 2 },
            { key: 'fsg',              label: 'FSG',                  col: 1 },
            { key: 'fsc',              label: 'FSC',                  col: 1 },
            { key: 'quantityAvailable',label: 'Quantity',             col: 1 },
            { key: 'unitPrice',        label: 'Unit Price (USD)',      col: 1 },
          ].map(({ key, label, col }) => (
            <div key={key} className={col === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">{label}</label>
              <input
                type={['quantityAvailable', 'unitPrice'].includes(key) ? 'number' : 'text'}
                value={form[key as keyof PartForm]}
                onChange={(e) => set(key as keyof PartForm, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              />
            </div>
          ))}

          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => set('condition', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            >
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Stock Status</label>
            <select
              value={form.stockStatus}
              onChange={(e) => set('stockStatus', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            >
              {STOCK_OPTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Full Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">Cancel</button>
          <button
            disabled={saving || !form.partNumber || !form.manufacturer}
            onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : mode === 'add' ? 'Add Part' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────
function DeleteModal({ part, onClose, onConfirm }: {
  part: Product; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-[#1A1A2E] text-center mb-1">Delete Part?</h2>
        <p className="text-sm text-[#4A4A6A] text-center mb-5">
          <strong>{part.partNumber}</strong> — {part.shortDescription || part.description?.slice(0, 50)}<br />
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">Cancel</button>
          <button
            disabled={saving}
            onClick={async () => { setSaving(true); await onConfirm(); setSaving(false); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminPartsPage() {
  const [parts,      setParts]      = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [addOpen,    setAddOpen]    = useState(false);
  const [editPart,   setEditPart]   = useState<Product | null>(null);
  const [deletePart, setDeletePart] = useState<Product | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }) });
      const res = await request<{ success: boolean; data: Product[]; pagination: { total: number } }>(`/admin/parts?${qs}`);
      setParts(res.data || []);
      setTotal(res.pagination?.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form: PartForm) => {
    try {
      await request('/admin/parts', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Part added');
      load();
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to add'); }
  };

  const handleEdit = async (form: PartForm) => {
    if (!editPart) return;
    try {
      await request(`/admin/parts/${editPart.id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast.success('Part updated');
      load();
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deletePart) return;
    try {
      await request(`/admin/parts/${deletePart.id}`, { method: 'DELETE' });
      toast.success('Part deleted');
      load();
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to delete'); }
  };

  const totalPages = Math.ceil(total / limit);

  const statCards = [
    { label: 'Total Parts',   value: total,                                                       color: 'bg-[#0A1628]' },
    { label: 'In Stock',      value: parts.filter((p) => p.stockStatus === 'In Stock').length,   color: 'bg-[#00A651]' },
    { label: 'On Order',      value: parts.filter((p) => p.stockStatus === 'On Order').length,   color: 'bg-[#4F46E5]' },
    { label: 'Obsolete',      value: parts.filter((p) => p.stockStatus === 'Obsolete').length,   color: 'bg-red-500'   },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Parts Catalog</h1>
          <p className="text-[#4A4A6A] text-sm mt-0.5">{total} parts in inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/catalog" target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-[#C0C9D5] text-[#4A4A6A] rounded-xl text-sm font-medium hover:bg-[#F5F7FA] transition-colors">
            <ExternalLink className="w-4 h-4" /> Storefront
          </Link>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Part
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-[#E8EDF2] flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#1A1A2E]">{value}</div>
              <div className="text-xs text-[#4A4A6A]">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search parts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]" />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-[#C0C9D5] hover:bg-[#F5F7FA]">
          <RefreshCw className="w-4 h-4 text-[#4A4A6A]" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#F5F7FA]">
                  {['Part #', 'NSN', 'Description', 'Manufacturer', 'Condition', 'Stock', 'Qty', 'Price', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p.id} className="border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors group">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#4F46E5] font-semibold">{p.partNumber}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#4A4A6A]">{p.nsn}</td>
                    <td className="px-4 py-2.5 text-[#1A1A2E] max-w-40 truncate text-xs">
                      {p.shortDescription || p.description?.slice(0, 50)}
                    </td>
                    <td className="px-4 py-2.5 text-[#4A4A6A] text-xs">{p.manufacturer}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-[#E8EDF2] text-[#4A4A6A] px-2 py-0.5 rounded-full">{p.condition}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STOCK_COLORS[p.stockStatus] || 'bg-gray-100 text-gray-600')}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#1A1A2E] font-medium text-xs">{p.quantityAvailable}</td>
                    <td className="px-4 py-2.5 text-[#1A1A2E] font-bold text-xs">
                      {p.unitPrice > 0 ? `$${p.unitPrice.toLocaleString()}` : 'RFQ'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/catalog/${p.id}`} target="_blank"
                          className="p-1.5 rounded-lg hover:bg-[#EEF2FF] text-[#4A4A6A] hover:text-[#4F46E5] transition-colors" title="View">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => setEditPart(p)}
                          className="p-1.5 rounded-lg hover:bg-[#EEF2FF] text-[#4A4A6A] hover:text-[#4F46E5] transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeletePart(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#4A4A6A] hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#E8EDF2]">
            <span className="text-xs text-[#4A4A6A]">Page {page} of {totalPages} ({total} parts)</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-[#F5F7FA] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {addOpen    && <PartModal mode="add"  onClose={() => setAddOpen(false)}   onSave={handleAdd}    />}
      {editPart   && <PartModal mode="edit" part={editPart} onClose={() => setEditPart(null)}  onSave={handleEdit}   />}
      {deletePart && <DeleteModal part={deletePart} onClose={() => setDeletePart(null)} onConfirm={handleDelete} />}
    </div>
  );
}
