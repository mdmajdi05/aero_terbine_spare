import Link from 'next/link';
import { Zap, Settings, Circle, Wrench, Cpu, Activity, ArrowUpRight, ArrowUpRightFromCircle } from 'lucide-react';
import type { Category } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap, settings: Settings, circle: Circle,
  tool: Wrench, cpu: Cpu, activity: Activity,
  wrench: Wrench,
};



export default function FeaturedCategories({ categories }: { categories: Category[] }) {
  const featured = categories.slice(0, 6);

  return (
    <section className="relative py-28 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-800 overflow-hidden">
      
      {/* 1. Futuristic Subtle Tech Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-25 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* 2. Soft Pastel Background Orbs (Halke abstract colors piche blend ho rahe hain) */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-10 left-1/4 w-[350px] h-[350px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-orange text-[11px] font-bold uppercase tracking-[0.2em] mb-4 bg-white border border-slate-200 shadow-sm px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-orange rounded-full shadow-[0_0_8px_#f97316] animate-pulse" />
              Aerospace Components Catalog
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Browse Premium <span className="bg-gradient-to-r from-orange to-amber-500 bg-clip-text text-transparent">Categories</span>
            </h2>
          </div>
          
          <Link 
            href="/catalog" 
            className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-orange transition-all duration-300 px-5 py-2.5 bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-xl hover:shadow-md hover:-translate-y-0.5"
          >
            <span>Explore Full Inventory</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover/btn:text-orange transition-colors transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 duration-300" />
          </Link>
        </div>

        {/* 3. Pure Frosted Glass Grid with Light Pastel Tone */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {featured.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Settings;

            return (
              <Link
                key={cat.id}
                href={`/catalog?fsg=${cat.fsg}`}
                // Halka color frosted glass background aur clean micro-shadows
                className="group relative flex flex-col justify-between p-6 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(148,163,184,0.1),inset_0_1px_2px_rgba(255,255,255,0.7)] hover:bg-white/80 hover:border-orange/30 hover:shadow-[0_20px_40px_-15px_rgba(148,163,184,0.3),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-500 ease-out min-h-[210px] text-center items-center"
              >
                {/* Dynamic Subtle Border Top-glow on Hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-orange/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />

                {/* Floating Icon Box with Smooth Scale and Tilt */}
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/60 flex items-center justify-center shadow-sm group-hover:from-orange group-hover:to-amber-500 group-hover:border-transparent group-hover:shadow-[0_10px_20px_rgba(249,115,22,0.25)] transition-all duration-500 transform group-hover:-translate-y-2 group-hover:rotate-6">
                  <Icon className="w-5.5 h-5.5 text-slate-600 group-hover:text-white transition-colors duration-300 stroke-[1.8]" />
                </div>

                {/* Typography with Rich Slate Contrast */}
                <div className="mt-auto w-full">
                  <h3 className="text-[13px] font-bold text-slate-800 tracking-wide group-hover:text-slate-950 mb-2.5 line-clamp-2 leading-snug transition-colors duration-300 min-h-[36px] flex items-center justify-center">
                    {cat.name}
                  </h3>
                  
                  {/* Subtle Light-Gray Part Count Pill Badge */}
                  <div className="inline-block px-3 py-0.5 rounded-full bg-slate-200/50 border border-slate-300/30 text-[10px] font-bold text-slate-500 tracking-wider uppercase group-hover:bg-orange/10 group-hover:border-orange/20 group-hover:text-orange transition-all duration-300">
                    {cat.partCount.toLocaleString()} Parts
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}