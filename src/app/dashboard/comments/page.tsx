'use client';

import { useState } from 'react';
import { useComments } from '@/hooks/useBlogPosts';
import { blogService } from '@/services/blogService';
import toast from 'react-hot-toast';

export default function CommentsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const params = filter !== 'all' ? { approved: filter === 'approved' ? 'true' : 'false' } : undefined;
  const { data: res, isLoading, refetch } = useComments(params);
  const comments = res?.data || [];

  async function handleApprove(id: string) {
    try {
      await blogService.manage.comments.approve(id);
      toast.success('Comment approved');
      refetch();
    } catch { toast.error('Failed to approve'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this comment?')) return;
    try {
      await blogService.manage.comments.delete(id);
      toast.success('Comment deleted');
      refetch();
    } catch { toast.error('Failed to delete'); }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0A1628] mb-6">Comments</h1>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[#4F46E5] text-white' : 'bg-white border border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5]'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : 'Approved'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#C0C9D5]">Loading…</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-[#C0C9D5]">No comments found.</div>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-[#E8EDF2] p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{c.guestName || c.author?.fullName || 'Anonymous'}</p>
                  <p className="text-xs text-[#C0C9D5]">{c.guestEmail ? c.guestEmail : ''} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {c.approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-[#4A4A6A] mb-2">{c.content}</p>
              {c.post && (
                <p className="text-xs text-[#C0C9D5] mb-3">On: <span className="text-[#4F46E5]">{c.post.title}</span></p>
              )}
              <div className="flex gap-2">
                {!c.approved && (
                  <button onClick={() => handleApprove(c.id)} className="text-xs text-green-600 hover:underline font-medium">Approve</button>
                )}
                <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
