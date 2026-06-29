'use client';

import { useState } from 'react';
import { useAnalyzeLinks } from '@/hooks/useBlogPosts';

export default function LinkCheckerPage() {
  const analyzeLinks = useAnalyzeLinks();
  const [results, setResults] = useState<any[] | null>(null);

  function handleAnalyze() {
    analyzeLinks.mutate(undefined, {
      onSuccess: (data) => setResults((data as any).data?.broken || []),
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#0A1628]">Broken Link Checker</h1>
        <button onClick={handleAnalyze} disabled={analyzeLinks.isPending}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50">
          {analyzeLinks.isPending ? 'Scanning…' : 'Run Analysis'}
        </button>
      </div>

      {analyzeLinks.isPending && (
        <div className="text-center py-12 text-[#C0C9D5]">Scanning all published posts for broken links…</div>
      )}

      {results !== null && results.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">No broken links found! All internal links are valid.</div>
      )}

      {results && results.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
          <div className="p-3 bg-red-50 border-b border-red-100 text-sm text-red-700 font-medium">{results.length} broken link(s) found</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EDF2] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">Source Post</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">Broken URL</th>
                <th className="text-left px-4 py-3 font-medium text-[#4A4A6A]">Error</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: any, i: number) => (
                <tr key={i} className="border-b border-[#E8EDF2] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3 text-[#0A1628]">{r.sourcePostTitle}</td>
                  <td className="px-4 py-3 font-mono text-xs text-red-600">{r.url}</td>
                  <td className="px-4 py-3 text-xs text-[#4A4A6A]">{r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results === null && !analyzeLinks.isPending && (
        <div className="text-center py-12 text-[#C0C9D5]">Click &quot;Run Analysis&quot; to check all published posts for broken internal links.</div>
      )}
    </div>
  );
}
