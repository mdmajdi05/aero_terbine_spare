'use client';

import { useState } from 'react';
import type { BlogComment } from '@/types/blog';
import { blogService } from '@/services/blogService';
import toast from 'react-hot-toast';

interface Props {
  postId: string;
  comments: BlogComment[];
}

export default function CommentSection({ postId, comments }: Props) {
  const [content,    setContent]    = useState('');
  const [guestName,  setGuestName]  = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await blogService.comments.submit(postId, { content, guestName, guestEmail });
      setSubmitted(true);
      setContent('');
      toast.success('Comment submitted — it will appear after moderation.');
    } catch {
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-12">
      <h3 className="text-[#0A1628] font-bold text-xl mb-6">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {/* Comment list */}
      <div className="space-y-6 mb-10">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[#4F46E5] flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {(c.author?.fullName ?? c.guestName ?? 'G').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 bg-[#F8FAFC] rounded-xl p-4 border border-[#E8EDF2]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[#0A1628] text-sm">
                  {c.author?.fullName ?? c.guestName ?? 'Guest'}
                </span>
                <span className="text-xs text-[#C0C9D5]">
                  {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-[#4A4A6A] text-sm leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-[#C0C9D5] text-sm italic">No comments yet. Be the first to share your thoughts.</p>
        )}
      </div>

      {/* Submit form */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E8EDF2] p-6">
        <h4 className="text-[#0A1628] font-semibold text-base mb-4">Leave a Comment</h4>
        {submitted ? (
          <p className="text-green-600 font-medium text-sm">
            Thank you! Your comment has been submitted and is awaiting moderation.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              />
              <input
                type="email"
                placeholder="Your email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              />
            </div>
            <textarea
              required
              rows={4}
              placeholder="Write your comment…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2.5 text-sm text-[#0A1628] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Submitting…' : 'Post Comment'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
