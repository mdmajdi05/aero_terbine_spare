'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package, Plus, Edit2, Trash2, X, RefreshCw, Search,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const CONDITIONS  = ['New', 'Overhauled', 'Refurbished', 'Used'] as const;
const STOCK_OPTS  = ['In Stock', 'On Order', 'Limited'] as const;

type PartForm = {
  partNumber: string; nsn: string; cage: string; description: string;
  shortDescription: string; manufacturer: string; category: string;
  condition: string; stockStatus: string; quantityAvailable: string; unitPrice: string;
};

const EMPTY: PartForm = {
  partNumber: '', nsn: '', cage: '', description: '', shortDescription: '',
  manufacturer: '', category: 'General', condition: 'New', stockStatus: 'In Stock',
  quantityAvailable: '0', unitPrice: '0',
};

// ── Compact modal ─────────────────────────────────────────
function PartModal({ mode, part, onClose, onSave }: {
  mode: 'add' | 'edit'; part?: Product;
  onClose: () => void; onSave: (f: PartForm) => Promise<void>;
}) {
  const [form, setForm] = useState<PartForm>(
    part ? {
      partNumber: part.partNumber, nsn: part.nsn, cage: part.cage,
      description: part.description, shortDescription: part.shortDescription,
      manufacturer: part.manufacturer, category: part.category,
      condition: part.condition, stockStatus: part.stockStatus,
      quantityAvailable: String(part.quantityAvailable), unitPrice: String(part.unitPrice),
    } : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const set = (k: keyof PartForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E]">{mode === 'add' ? 'List a Part' : 'Edit Listing'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A]"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'partNumber',       label: 'Part Number *',    col: 1 },
            { key: 'nsn',              label: 'NSN',               col: 1 },
            { key: 'cage',             label: 'CAGE Code',         col: 1 },
            { key: 'manufacturer',     label: 'Manufacturer *',    col: 1 },
            { key: 'shortDescription', label: 'Short Description', col: 2 },
            { key: 'quantityAvailable',label: 'Quantity',          col: 1 },
            { key: 'unitPrice',        label: 'Unit Price ($)',     col: 1 },
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Condition</label>
            <select value={form.condition} onChange={(e) => set('condition', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
              {CONDITIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Stock Status</label>
            <select value={form.stockStatus} onChange={(e) => set('stockStatus', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
              {STOCK_OPTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Full Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">Cancel</button>
          <button
            disabled={saving || !form.partNumber || !form.manufacturer}
            onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : mode === 'add' ? 'List Part' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function TraderPartsPage() {
  const { user, isTrader } = useAuth();
  const [parts,      setParts]      = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [addOpen,    setAddOpen]    = useState(false);
  const [editPart,   setEditPart]   = useState<Product | null>(null);
  const [deletePart, setDeletePart] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await request<{ success: boolean; data: Product[] }>('/trader/parts');
      setParts(res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isTrader()) {
    return (
      <div className="text-center py-20">
        <p className="text-[#4A4A6A]">You do not have permission to manage parts listings.</p>
      </div>
    );
  }

  const handleAdd = async (form: PartForm) => {
    try {
      await request('/admin/parts', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Part listed successfully');
      load();
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to add'); }
  };

  const handleEdit = async (form: PartForm) => {
    if (!editPart) return;
    try {
      await request(`/admin/parts/${editPart.id}`, { method: 'PUT', body: JSON.stringify(form) });
      toast.success('Listing updated');
      load();
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deletePart) return;
    try {
      await request(`/admin/parts/${deletePart.id}`, { method: 'DELETE' });
      toast.success('Listing removed');
      load();
      setDeletePart(null);
    } catch (err: unknown) { toast.error((err as Error).message || 'Failed to delete'); }
  };

  const filtered = parts.filter((p) =>
    !search ||
    p.partNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.manufacturer.toLowerCase().includes(search.toLowerCase())
  );

  const STOCK_COLORS: Record<string, string> = {
    'In Stock': 'bg-green-100 text-green-800',
    'On Order': 'bg-yellow-100 text-yellow-800',
    'Limited':  'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">My Parts Listings</h1>
          <p className="text-[#4A4A6A] text-sm mt-0.5">
            {parts.length} part{parts.length !== 1 ? 's' : ''} listed by {user?.fullName}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors"
        >
          <Plus className="w-4 h-4" /> List a Part
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your listings..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-[#C0C9D5] hover:bg-[#F5F7FA]">
          <RefreshCw className="w-4 h-4 text-[#4A4A6A]" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-[#4A4A6A] mb-4">No parts listed yet.</p>
            <button onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-semibold hover:bg-[#4338CA] transition-colors">
              <Plus className="w-4 h-4" /> List your first part
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EDF2] bg-[#F5F7FA]">
                  {['Part #', 'Description', 'Manufacturer', 'Condition', 'Stock', 'Qty', 'Price', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors group">
                    <td className="px-4 py-2.5 font-mono text-xs text-[#4F46E5] font-semibold">{p.partNumber}</td>
                    <td className="px-4 py-2.5 text-[#1A1A2E] max-w-40 truncate text-xs">{p.shortDescription || p.description?.slice(0, 50)}</td>
                    <td className="px-4 py-2.5 text-[#4A4A6A] text-xs">{p.manufacturer}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-[#E8EDF2] text-[#4A4A6A] px-2 py-0.5 rounded-full">{p.condition}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STOCK_COLORS[p.stockStatus] || 'bg-gray-100 text-gray-600')}>
                        {p.stockStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-[#1A1A2E]">{p.quantityAvailable}</td>
                    <td className="px-4 py-2.5 text-xs font-bold text-[#1A1A2E]">
                      {p.unitPrice > 0 ? `$${p.unitPrice.toLocaleString()}` : 'RFQ'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>

      {/* Modals */}
      {addOpen    && <PartModal mode="add"  onClose={() => setAddOpen(false)}   onSave={handleAdd}  />}
      {editPart   && <PartModal mode="edit" part={editPart} onClose={() => setEditPart(null)}  onSave={handleEdit} />}

      {deletePart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-center text-[#1A1A2E] mb-1">Remove Listing?</h2>
            <p className="text-sm text-[#4A4A6A] text-center mb-5">
              Part <strong>{deletePart.partNumber}</strong> will be removed from your listings.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletePart(null)} className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
