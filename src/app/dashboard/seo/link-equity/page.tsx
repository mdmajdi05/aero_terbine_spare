'use client';

import { useLinkEquity } from '@/hooks/useBlogPosts';
import Link from 'next/link';

export default function LinkEquityPage() {
  const { data: res, isLoading } = useLinkEquity();
  const items = (res as any)?.data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#0A1628] mb-1">Link Equity</h1>
      <p className="text-sm text-[#C0C9D5] mb-6">Internal and external link counts per post, sorted by internal links (highest first).</p>

      {isLoading ? (
        <div className="text-center py-12 text-[#C0C9D5]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-[#C0C9D5]">No posts found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">Post</th>
                <th className="text-center px-4 py-3 font-medium text-[#4A4A6A]">Internal Links</th>
                <th className="text-center px-4 py-3 font-medium text-[#4A4A6A]">External Links</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.postId} className="border-b border-[#E8EDF2] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/posts/edit/${item.postId}`} className="text-[#4F46E5] hover:underline font-medium">{item.title}</Link>
                    <p className="text-xs text-[#C0C9D5]">/{item.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${item.internalLinksCount > 0 ? 'text-green-600' : 'text-[#C0C9D5]'}`}>
                      {item.internalLinksCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${item.externalLinksCount > 0 ? 'text-blue-600' : 'text-[#C0C9D5]'}`}>
                      {item.externalLinksCount}
                    </span>
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
