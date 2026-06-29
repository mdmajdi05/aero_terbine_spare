'use client';

import { useEffect, useState, useMemo } from 'react';
import { blogService } from '@/services/blogService';
import type { BlogCategory } from '@/types/blog';
import toast from 'react-hot-toast';

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<null | 'create' | BlogCategory>(null);
  const [name,       setName]       = useState('');
  const [desc,       setDesc]       = useState('');
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [sortBy,     setSortBy]     = useState<'name' | 'posts'>('name');
  const [deleteConfirm, setDeleteConfirm] = useState<BlogCategory | null>(null);

  const filtered = useMemo(() => {
    const arr = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'posts') arr.sort((a, b) => (b._count?.posts ?? 0) - (a._count?.posts ?? 0));
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [categories, search, sortBy]);

  async function load() {
    setLoading(true);
    try { const r = await blogService.manage.categories.list(); setCategories(r.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setName(''); setDesc(''); setModal('create'); }
  function openEdit(c: BlogCategory) { setName(c.name); setDesc(c.description ?? ''); setModal(c); }

  async function handleSave() {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'create') {
        await blogService.manage.categories.create({ name, description: desc });
        toast.success('Category created');
      } else if (modal && typeof modal !== 'string') {
        await blogService.manage.categories.update(modal.id, { name, description: desc });
        toast.success('Category updated');
      }
      setModal(null);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try { await blogService.manage.categories.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
    finally { setDeleteConfirm(null); }
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-widest mb-1">Content Manager</p>
            <h1 className="text-2xl font-bold text-[#0A1628]">Categories</h1>
          </div>
          <button onClick={openCreate}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
            + Add Category
          </button>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C9D5]" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full border border-[#E8EDF2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'posts')}
            className="border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#4A4A6A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
            <option value="name">Sort by Name</option>
            <option value="posts">Sort by Posts</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#E8EDF2]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-4 animate-pulse flex justify-between">
                  <div className="h-4 bg-[#E8EDF2] rounded w-32" />
                  <div className="h-4 bg-[#E8EDF2] rounded w-10" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-[#C0C9D5]">
              {search ? `No categories matching "${search}"` : 'No categories yet.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8EDF2]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Slug</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Description</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Posts</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 font-medium text-[#0A1628]">{c.name}</td>
                    <td className="px-5 py-3 text-[#4A4A6A] font-mono text-xs">{c.slug}</td>
                    <td className="px-5 py-3 text-[#C0C9D5] text-xs max-w-[180px] truncate">{c.description || '—'}</td>
                    <td className="px-5 py-3 text-[#4A4A6A]">{c._count?.posts ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => openEdit(c)} className="text-xs text-[#4F46E5] hover:underline font-medium">Edit</button>
                        <button onClick={() => setDeleteConfirm(c)} className="text-xs text-red-400 hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-[#0A1628] text-lg mb-2">Delete Category</h2>
            <p className="text-sm text-[#4A4A6A] mb-1">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?
            </p>
            {deleteConfirm._count?.posts ? (
              <p className="text-xs text-red-500 font-medium">
                This category has {deleteConfirm._count.posts} post{deleteConfirm._count.posts > 1 ? 's' : ''}. Posts will not be deleted but will become uncategorized.
              </p>
            ) : null}
            <div className="flex gap-2 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#E8EDF2] text-[#4A4A6A] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-bold text-[#0A1628] text-lg mb-4">
              {modal === 'create' ? 'New Category' : 'Edit Category'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider block mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. MRO Insights"
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider block mb-1">Slug (auto)</label>
                <input type="text" value={toSlug(name)} readOnly
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm font-mono bg-[#F8FAFC] text-[#4A4A6A]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider block mb-1">Description</label>
                <textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description"
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 border border-[#E8EDF2] text-[#4A4A6A] font-medium text-sm py-2.5 rounded-lg hover:bg-[#F8FAFC]">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
