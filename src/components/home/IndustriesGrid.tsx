'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Shield, Car, Heart, Cpu, Radio, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Industry } from '@/types';
import { request } from '@/lib/api-client';
import fallbackIndustries from '@/data/industries.json';

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  plane: Plane,
  shield: Shield,
  car: Car,
  heart: Heart,
  cpu: Cpu,
  radio: Radio,
};

const INDUSTRY_COLORS = [
  'bg-blue-50 text-blue-600',
  'bg-slate-50 text-slate-600',
  'bg-teal-50 text-teal-600',
  'bg-rose-50 text-rose-600',
  'bg-violet-50 text-violet-600',
  'bg-orange-50 text-orange-600',
];

export default function IndustriesGrid() {
  const [industries, setIndustries] = useState<Industry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await request<{ success: boolean; data: Industry[] }>('/industries');
        if (res?.data) setIndustries(res.data);
        else setIndustries(fallbackIndustries as Industry[]);
      } catch { setIndustries(fallbackIndustries as Industry[]); }
    })();
  }, []);
  return (
    <section className="relative py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      {/* Decorative background element for a premium touch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30 sm:opacity-40">
        <div className="absolute top-12 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-12 right-10 w-56 sm:w-96 h-56 sm:h-96 bg-slate-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 text-orange text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 bg-orange/5 rounded-full border border-orange/10">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            What We Serve
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-text tracking-tight max-w-2xl mx-auto leading-tight">
            Industries We Supply
          </h2>
          
          <p className="text-text-muted mt-4 text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Certified aerospace components for every critical sector — from commercial aviation to defense and beyond.
          </p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {industries.slice(0, 8).map((ind, idx) => {
            const Icon = (ind.icon && INDUSTRY_ICONS[ind.icon]) || Package;
            const color = INDUSTRY_COLORS[idx % INDUSTRY_COLORS.length];
            
            return (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/80 bg-[#e5ecf0] hover:bg-gradient-to-b hover:from-white hover:to-slate-50/50 hover:border-orange/30 hover:shadow-[0_10px_30px_-15px_rgba(249,115,22,0.15)] transition-all duration-300 ease-out"
              >
                {/* Subtle top border glow on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

                {/* Icon Wrapper with Custom Color & Glow */}
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm', 
                  color
                )}>
                  <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-105" />
                </div>

                {/* Content */}
                <h3 className="text-sm font-bold text-text leading-snug mb-2 group-hover:text-orange transition-colors duration-200 min-h-[36px] flex items-center justify-center">
                  {ind.name}
                </h3>
                
                {/* Part Count Badge */}
                {ind.partCount != null && (
                  <div className="mt-auto px-2.5 py-0.5 rounded-full bg-green-100 text-slate-600 font-semibold text-[10px] uppercase tracking-wider group-hover:bg-orange/10 group-hover:text-orange transition-all duration-200">
                    {ind.partCount.toLocaleString()} parts
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
