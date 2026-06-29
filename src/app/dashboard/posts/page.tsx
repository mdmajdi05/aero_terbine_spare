'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { blogService } from '@/services/blogService';
import { useAdminPosts, useTrashPost, useRestorePost, useDeletePost } from '@/hooks/useBlogPosts';
import type { BlogPost, PostStatus } from '@/types/blog';
import toast from 'react-hot-toast';

const TABS: { label: string; status?: PostStatus; trash?: boolean }[] = [
  { label: 'All' },
  { label: 'Published', status: 'Published' },
  { label: 'Draft',     status: 'Draft' },
  { label: 'Scheduled', status: 'Scheduled' },
  { label: 'Archived',  status: 'Archived' },
  { label: 'Trash',     trash: true },
];

const STATUS_COLORS: Record<PostStatus, string> = {
  Published: 'bg-green-100 text-green-700',
  Draft:     'bg-yellow-100 text-yellow-700',
  Scheduled: 'bg-blue-100  text-blue-700',
  Archived:  'bg-gray-100  text-gray-500',
};

export default function PostsListPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');

  const tab = TABS[activeTab];
  const params: Record<string, string> = { page: String(page) };
  if (tab.trash)  params.trash  = 'true';
  if (tab.status) params.status = tab.status;

  const { data: res, isLoading, refetch } = useAdminPosts(params);
  const posts = res?.data ?? [];
  const pagination = res?.pagination ?? { total: 0, page: 1, totalPages: 1 };

  const trashMutation = useTrashPost();
  const restoreMutation = useRestorePost();
  const deleteMutation = useDeletePost();

  function switchTab(idx: number) {
    setActiveTab(idx);
    setPage(1);
  }

  const undo = useCallback(async (id: string) => {
    try {
      await blogService.manage.posts.restore(id);
      toast.success('Post restored');
      refetch();
    } catch {
      toast.error('Failed to restore post');
    }
  }, [refetch]);

  const handleTrash = (id: string) => {
    if (!confirm('Move this post to trash?')) return;
    trashMutation.mutate(id, {
      onSuccess: () => {
        toast.custom((t) => (
          <div className="bg-[#0A1628] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">
            <span>Moved to trash</span>
            <button
              onClick={() => { toast.dismiss(t.id); undo(id); }}
              className="text-[#E8751A] font-semibold hover:underline"
            >
              Undo
            </button>
          </div>
        ), { duration: 5000 });
      },
    });
  };

  const handleRestore = (id: string) => {
    restoreMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Permanently delete this post? This cannot be undone.')) return;
    deleteMutation.mutate(id);
  };

  const isTrashTab = TABS[activeTab].trash;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-widest mb-1">Content Manager</p>
            <h1 className="text-2xl font-bold text-[#0A1628]">All Posts</h1>
          </div>
          <Link href="/dashboard/posts/new"
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
            + New Post
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {['Total', 'Published', 'Draft', 'Scheduled'].map((label) => (
            <div key={label} className="bg-white rounded-xl border border-[#E8EDF2] p-4">
              <p className="text-xs text-[#4A4A6A] font-medium uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-[#0A1628] mt-1">—</p>
            </div>
          ))}
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-[#EEF2FF] border border-[#4F46E5]/20 rounded-xl px-4 py-2.5 flex items-center justify-between mb-6">
            <span className="text-sm text-[#4F46E5] font-medium">{selectedIds.size} post(s) selected</span>
            <div className="flex items-center gap-2">
              <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
                className="border border-[#E8EDF2] rounded-lg px-3 py-1.5 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
                <option value="">Bulk action…</option>
                <option value="publish">Publish</option>
                <option value="draft">Move to Draft</option>
                <option value="archive">Archive</option>
                <option value="trash">Move to Trash</option>
                <option value="delete">Delete Permanently</option>
              </select>
              <button onClick={async () => {
                if (!bulkAction || selectedIds.size === 0) return;
                const action = bulkAction;
                setBulkAction('');
                try {
                  const ids = Array.from(selectedIds);
                  if (action === 'delete') {
                    if (!confirm(`Permanently delete ${ids.length} posts? This cannot be undone.`)) return;
                    await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
                  } else if (action === 'trash') {
                    await Promise.all(ids.map((id) => blogService.manage.posts.trash(id)));
                    toast.custom((t) => (
                      <div className="bg-[#0A1628] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">
                        <span>{ids.length} post(s) moved to trash</span>
                        <button
                          onClick={() => { toast.dismiss(t.id); Promise.all(ids.map((id) => blogService.manage.posts.restore(id))).then(() => { toast.success('Posts restored'); refetch(); }).catch(() => toast.error('Failed to restore posts')); }}
                          className="text-[#E8751A] font-semibold hover:underline"
                        >
                          Undo
                        </button>
                      </div>
                    ), { duration: 5000 });
                    setSelectedIds(new Set());
                    refetch();
                    return;
                  } else if (action === 'restore') {
                    await Promise.all(ids.map((id) => restoreMutation.mutateAsync(id)));
                  } else {
                    await Promise.all(ids.map((id) => blogService.manage.posts.update(id, { status: action as any })));
                  }
                  const actionLabel = action === 'delete' ? 'deleted' : action === 'restore' ? 'restored' : 'updated';
                  toast.success(`${ids.length} post(s) ${actionLabel}!`);
                  setSelectedIds(new Set());
                  refetch();
                } catch (e: any) { toast.error(e.message ?? 'Bulk action failed'); }
              }} disabled={!bulkAction}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40">
                Apply
              </button>
              <button onClick={() => setSelectedIds(new Set())}
                className="text-xs text-[#4A4A6A] hover:text-[#0A1628] px-2 py-1.5">Clear</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-[#E8EDF2] overflow-x-auto">
            {TABS.map((t, i) => (
              <button key={t.label} onClick={() => switchTab(i)}
                className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === i ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'text-[#4A4A6A] hover:text-[#0A1628]'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E8EDF2]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider w-10">
                    <input type="checkbox" onChange={(e) => {
                      if (e.target.checked) setSelectedIds(new Set(posts.map((p) => p.id)));
                      else setSelectedIds(new Set());
                    }} checked={posts.length > 0 && selectedIds.size === posts.length}
                      className="accent-[#4F46E5] w-3.5 h-3.5" />
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Author</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Views</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-[#E8EDF2] rounded w-3/4" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-[#E8EDF2] rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-5 bg-[#E8EDF2] rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-[#E8EDF2] rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-[#E8EDF2] rounded w-10" /></td>
                      <td className="px-5 py-4" />
                    </tr>
                  ))
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#C0C9D5]">No posts found.</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedIds.has(post.id)} onChange={() => {
                          const next = new Set(selectedIds);
                          if (next.has(post.id)) next.delete(post.id); else next.add(post.id);
                          setSelectedIds(next);
                        }} className="accent-[#4F46E5] w-3.5 h-3.5" />
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-medium text-[#0A1628] truncate">{post.title}</p>
                        <p className="text-xs text-[#C0C9D5] font-mono mt-0.5 truncate">{post.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-[#4A4A6A] whitespace-nowrap">{post.author.fullName}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[post.status as PostStatus] ?? 'bg-gray-100 text-gray-500'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#4A4A6A] text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-[#4A4A6A]">{post.viewCount}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {isTrashTab ? (
                            <>
                              <button onClick={() => handleRestore(post.id)} className="text-xs text-[#4F46E5] hover:underline font-medium">Restore</button>
                              <button onClick={() => handleDelete(post.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                            </>
                          ) : (
                            <>
                              <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs text-[#4A4A6A] hover:text-[#4F46E5]">View</Link>
                              <Link href={`/dashboard/posts/edit/${post.id}`} className="text-xs text-[#4F46E5] hover:underline font-medium">Edit</Link>
                              <button onClick={() => handleTrash(post.id)} className="text-xs text-red-400 hover:underline font-medium">Trash</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center px-5 py-4 border-t border-[#E8EDF2]">
              <p className="text-xs text-[#4A4A6A]">{pagination.total} total posts</p>
              <div className="flex gap-2">
                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium ${pagination.page === i + 1 ? 'bg-[#4F46E5] text-white' : 'border border-[#E8EDF2] text-[#4A4A6A]'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
