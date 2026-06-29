'use client';

interface Props {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export default function SocialSharePreview({ title, description, url, image }: Props) {
  const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max) + '…' : s;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-wider">Social Share Preview</h4>

      {/* Facebook */}
      <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
        <div className="bg-[#F0F2F5] h-32 flex items-center justify-center text-[#C0C9D5] text-sm">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : 'og:image preview'}
        </div>
        <div className="p-3 space-y-1">
          <p className="text-[10px] uppercase text-[#606770] tracking-wider">{new URL(url).hostname}</p>
          <p className="text-sm font-semibold text-[#1D2129] leading-tight">{truncate(title, 90)}</p>
          <p className="text-xs text-[#606770] leading-tight line-clamp-2">{truncate(description, 200)}</p>
        </div>
      </div>

      {/* Twitter */}
      <div className="bg-white rounded-xl border border-[#E8EDF2] overflow-hidden">
        <div className="bg-[#CFD9DE] h-28 flex items-center justify-center text-[#536471] text-sm">
          {image ? <img src={image} alt="" className="w-full h-full object-cover" /> : 'twitter:image preview'}
        </div>
        <div className="p-3 space-y-0.5 bg-[#F7F9FA]">
          <p className="text-xs text-[#536471]">{truncate(url, 50)}</p>
          <p className="text-sm font-semibold text-[#0F1419] leading-tight">{truncate(title, 70)}</p>
          <p className="text-xs text-[#536471] leading-tight line-clamp-2">{truncate(description, 200)}</p>
        </div>
      </div>
    </div>
  );
}
