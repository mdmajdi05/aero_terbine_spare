'use client';

interface Props {
  title: string;
  description: string;
  slug: string;
  canonicalUrl?: string | null;
}

export default function SERPPreview({ title, description, slug, canonicalUrl }: Props) {
  const displayUrl = canonicalUrl || `https://aeroturbinespare.com/blog/${slug}`;
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const displayDesc = description.length > 160 ? description.slice(0, 157) + '...' : description;

  return (
    <div className="border border-[#E8EDF2] rounded-xl overflow-hidden bg-white">
      <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E8EDF2]">
        <span className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">SERP Preview</span>
      </div>
      <div className="p-3 space-y-1">
        <p className="text-xs text-[#4A4A6A] truncate">{displayUrl}</p>
        <p className="text-sm text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer">{displayTitle}</p>
        <p className="text-xs text-[#545454] leading-relaxed">{displayDesc}</p>
      </div>
      <div className="px-3 py-1.5 bg-[#F8FAFC] border-t border-[#E8EDF2] flex items-center gap-2">
        <span className="text-[10px] text-[#C0C9D5]">
          {title.length}/60 · {description.length}/160
        </span>
        {title.length > 60 && <span className="text-[10px] text-amber-500">Title too long</span>}
        {description.length > 160 && <span className="text-[10px] text-amber-500">Desc too long</span>}
        {title.length < 50 && <span className="text-[10px] text-amber-500">Title too short</span>}
        {description.length < 120 && <span className="text-[10px] text-amber-500">Desc too short</span>}
        {title.length >= 50 && title.length <= 60 && description.length >= 120 && description.length <= 160 && (
          <span className="text-[10px] text-green-600">Optimal</span>
        )}
      </div>
    </div>
  );
}
