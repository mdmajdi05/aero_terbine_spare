'use client';

import { useState } from 'react';
import { useRedirects, useCreateRedirect, useUpdateRedirect, useDeleteRedirect } from '@/hooks/useBlogPosts';

export default function RedirectsPage() {
  const { data: res, isLoading } = useRedirects();
  const createRedirect = useCreateRedirect();
  const updateRedirect = useUpdateRedirect();
  const deleteRedirect = useDeleteRedirect();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ fromSlug: '', toSlug: '', type: 301 });
  const [showForm, setShowForm] = useState(false);
  const redirects = (res as any)?.data || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fromSlug || !form.toSlug) return;
    if (editingId) {
      updateRedirect.mutate({ id: editingId, body: form });
    } else {
      createRedirect.mutate(form);
    }
    setForm({ fromSlug: '', toSlug: '', type: 301 });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(r: any) {
    setForm({ fromSlug: r.fromSlug, toSlug: r.toSlug, type: r.type });
    setEditingId(r.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this redirect?')) return;
    deleteRedirect.mutate(id);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">Redirect Manager</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ fromSlug: '', toSlug: '', type: 301 }); }}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
          {showForm ? 'Cancel' : 'Add Redirect'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E8EDF2] p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#4A4A6A] block mb-1">From Slug</label>
              <input value={form.fromSlug} onChange={(e) => setForm({ ...form, fromSlug: e.target.value })}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" placeholder="old-slug" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4A4A6A] block mb-1">To Slug</label>
              <input value={form.toSlug} onChange={(e) => setForm({ ...form, toSlug: e.target.value })}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" placeholder="new-slug" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4A4A6A] block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
                <option value={301}>301 (Permanent)</option>
                <option value={302}>302 (Temporary)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors">
            {editingId ? 'Update' : 'Create'} Redirect
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-[#C0C9D5]">Loading…</div>
      ) : redirects.length === 0 ? (
        <div className="text-center py-12 text-[#C0C9D5]">No redirects configured.</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">From</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">To</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">Type</th>
                <th className="text-right px-4 py-3 font-medium text-[#4A4A6A]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirects.map((r: any) => (
                <tr key={r.id} className="border-b border-[#E8EDF2] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 font-mono text-xs text-[#0A1628]">/{r.fromSlug}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#0A1628]">/{r.toSlug}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{r.type}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(r)} className="text-xs text-[#4F46E5] hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
