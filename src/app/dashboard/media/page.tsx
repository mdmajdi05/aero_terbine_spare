'use client';

import { useEffect, useRef, useState } from 'react';
import { blogService } from '@/services/blogService';
import type { BlogMedia } from '@/types/blog';
import toast from 'react-hot-toast';
import Image from 'next/image';

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Converts a full Cloudinary secure_url into a thumbnail variant.
 * Inserts "c_fill,w_300,h_300,q_auto,f_auto" into the URL path.
 * Falls back to the original URL for non-Cloudinary sources.
 */
function cloudinaryThumb(url: string, w = 300, h = 300): string {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('cloudinary.com')) return url;
    // path format: /v<version>/<public_id>  or /image/upload/.../<public_id>
    return url.replace('/image/upload/', `/image/upload/c_fill,w_${w},h_${h},q_auto,f_auto/`);
  } catch {
    return url;
  }
}

export default function MediaPage() {
  const [media,     setMedia]     = useState<BlogMedia[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [selected,  setSelected]  = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await blogService.manage.media.list();
      setMedia(res.data);
    } catch {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setProgress(0);

    const fileArr = Array.from(files);
    let done = 0;

    try {
      await Promise.all(
        fileArr.map(async (f) => {
          await blogService.manage.media.upload(f);
          done += 1;
          setProgress(Math.round((done / fileArr.length) * 100));
        }),
      );
      toast.success(`${fileArr.length} file${fileArr.length > 1 ? 's' : ''} uploaded to Cloudinary`);
      load();
    } catch (e: any) {
      toast.error(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input so same file can be re-selected
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this file from Cloudinary and database?')) return;
    try {
      await blogService.manage.media.delete(id);
      toast.success('Deleted from Cloudinary');
      setSelected(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => toast.success('URL copied!'));
  }

  const selectedItem = media.find((m) => m.id === selected);

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-widest mb-1">Content Manager</p>
            <h1 className="text-2xl font-bold text-[#0A1628]">Media Library</h1>
            <p className="text-xs text-[#C0C9D5] mt-0.5">Images stored on Cloudinary — auto-optimized on delivery</p>
          </div>
          <div className="flex items-center gap-3">
            {uploading && (
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-[#E8EDF2] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs text-[#4A4A6A]">{progress}%</span>
              </div>
            )}
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading…' : '+ Upload Images'}
            </button>
            <input
              ref={fileInput}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          className="border-2 border-dashed border-[#E8EDF2] rounded-2xl p-8 mb-6 text-center bg-white hover:border-[#4F46E5]/40 transition-colors cursor-pointer select-none"
          onClick={() => !uploading && fileInput.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        >
          <div className="w-10 h-10 bg-[#F0F4F8] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#4A4A6A] text-sm">
            Drag &amp; drop images here, or{' '}
            <span className="text-[#4F46E5] font-medium">browse files</span>
          </p>
          <p className="text-xs text-[#C0C9D5] mt-1">JPEG, PNG, WEBP, GIF — max 10 MB — auto-converted to WebP on delivery</p>
        </div>

        <div className="flex gap-6 items-start">

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-[#E8EDF2] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E8EDF2]">
                <p className="text-[#C0C9D5] text-sm">No media uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {media.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    title={m.filename}
                    onClick={() => setSelected(m.id === selected ? null : m.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                      m.id === selected
                        ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/30 shadow-lg'
                        : 'border-transparent hover:border-[#4F46E5]/40'
                    }`}
                  >
                    <Image
                      src={cloudinaryThumb(m.url)}
                      alt={m.alt ?? m.filename}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedItem && (
            <div className="w-64 flex-shrink-0 bg-white border border-[#E8EDF2] rounded-2xl overflow-hidden self-start">
              {/* Preview */}
              <div className="relative aspect-square bg-[#F0F4F8]">
                <Image
                  src={cloudinaryThumb(selectedItem.url, 512, 512)}
                  alt={selectedItem.filename}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Info */}
              <div className="p-4 space-y-1">
                <p className="font-semibold text-[#0A1628] text-sm truncate" title={selectedItem.filename}>
                  {selectedItem.filename}
                </p>
                <p className="text-xs text-[#4A4A6A]">{selectedItem.mimeType}</p>
                <p className="text-xs text-[#4A4A6A]">{formatBytes(selectedItem.size)}</p>
                {selectedItem.width && selectedItem.height && (
                  <p className="text-xs text-[#4A4A6A]">{selectedItem.width} × {selectedItem.height} px</p>
                )}
                <p className="text-xs text-[#C0C9D5]">By {selectedItem.uploader?.fullName}</p>

                {/* Cloudinary ID badge */}
                <p className="text-xs font-mono text-[#C0C9D5] truncate mt-1" title={selectedItem.cloudinaryId}>
                  {selectedItem.cloudinaryId}
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 space-y-2">
                <button
                  onClick={() => copyUrl(selectedItem.url)}
                  className="w-full bg-[#F0F4F8] hover:bg-[#E8EDF2] text-[#4A4A6A] text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Copy Cloudinary URL
                </button>
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Delete from Cloudinary
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {!loading && media.length > 0 && (
          <p className="text-xs text-[#C0C9D5] mt-4 text-right">
            {media.length} file{media.length !== 1 ? 's' : ''} in library
          </p>
        )}
      </div>
    </div>
  );
}
