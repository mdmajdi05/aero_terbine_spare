'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useVersions, useRestoreVersion } from '@/hooks/useBlogPosts';
import Link from 'next/link';

export default function VersionsPage() {
  const params = useParams<{ id: string }>();
  const { data: res, isLoading } = useVersions(params.id);
  const restoreVersion = useRestoreVersion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const versions = (res as any)?.data || [];

  function handleRestore(versionId: string) {
    if (!confirm('Restore this version? Current content will be replaced.')) return;
    restoreVersion.mutate({ postId: params.id, versionId });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/posts" className="text-[#C0C9D5] hover:text-[#4F46E5] text-sm">← Back to Posts</Link>
        <h1 className="text-2xl font-bold text-[#0A1628]">Version History</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#C0C9D5]">Loading…</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-[#C0C9D5]">No versions saved yet. Versions are auto-created when you update a post.</div>
      ) : (
        <div className="space-y-2">
          {versions.map((v: any) => (
            <div key={v.id}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${selectedId === v.id ? 'border-[#4F46E5] ring-1 ring-[#4F46E5]/20' : 'border-[#E8EDF2] hover:border-[#4F46E5]/50'}`}
              onClick={() => setSelectedId(selectedId === v.id ? null : v.id)}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">v{v.version}</p>
                  <p className="text-xs text-[#C0C9D5]">{v.title} · {new Date(v.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleRestore(v.id); }}
                  className="text-xs text-[#4F46E5] hover:underline font-medium">Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
