'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Plane, Shield, Car, Heart, Cpu, Radio } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { request } from '@/lib/api-client';
import type { Industry } from '@/types';

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  shield: Shield,
  car: Car,
  heart: Heart,
  cpu: Cpu,
  radio: Radio,
};

// ─── Color map (deterministic per industry) ──────────────────────────────────

const COLOR_RING = [
  { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'hover:border-blue-300' },
  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'hover:border-green-300' },
  { bg: 'bg-orange-50', icon: 'text-orange',     ring: 'hover:border-orange/40' },
  { bg: 'bg-pink-50',   icon: 'text-pink-600',   ring: 'hover:border-pink-300' },
  { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'hover:border-indigo-300' },
  { bg: 'bg-teal-50',   icon: 'text-teal-600',   ring: 'hover:border-teal-300' },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<{ success: boolean; data: Industry[] }>('/industries')
      .then((res) => { if (res.success && Array.isArray(res.data)) setIndustries(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-4">
              <span className="w-6 h-px bg-orange" />
              Industries We Serve
              <span className="w-6 h-px bg-orange" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              Specialized Parts Sourcing{' '}
              <span className="gradient-text">Across Industries</span>
            </h1>
            <p className="text-silver/80 text-lg max-w-2xl mx-auto leading-relaxed">
              From commercial aviation to military defense, medical devices to
              satellite communications — we source and certify precision
              components for the industries where quality is non-negotiable.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-silver/70">
              {['32,000+ parts in catalog', '6 industries', '150+ countries', 'ISO 9001 & AS9120'].map(
                (stat) => (
                  <span
                    key={stat}
                    className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 font-medium"
                  >
                    {stat}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── Industry Cards ────────────────────────────────────────────── */}
        <section className="bg-bg py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-silver rounded-2xl p-6 animate-pulse">
                    <div className="w-14 h-14 rounded-2xl bg-silver mb-4" />
                    <div className="h-5 bg-silver rounded w-3/4 mb-2" />
                    <div className="h-4 bg-silver rounded w-full mb-4" />
                    <div className="flex gap-1.5 mb-4">
                      <div className="h-6 bg-silver rounded-full w-16" />
                      <div className="h-6 bg-silver rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {industries.map((industry, idx) => {
                  const Icon = ICON_MAP[industry.icon ?? ''] ?? Plane;
                  const color = COLOR_RING[idx % COLOR_RING.length];
                  return (
                    <Link
                      key={industry.id}
                      href={`/industries/${industry.slug}`}
                      className={`group bg-white border border-silver rounded-2xl p-6 flex flex-col hover:shadow-lg ${color.ring} transition-all duration-200 hover:-translate-y-0.5`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl ${color.bg} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`w-7 h-7 ${color.icon}`} />
                      </div>

                      {/* Title & part count */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-text leading-snug">
                          {industry.name}
                        </h3>
                        <span className="flex-shrink-0 text-xs font-bold text-text-muted bg-silver rounded-full px-2 py-0.5 mt-1">
                          {(industry.partCount ?? 0).toLocaleString()} parts
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">
                        {industry.description}
                      </p>

                      {/* Key parts preview */}
                      {industry.keyParts && industry.keyParts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {industry.keyParts.slice(0, 3).map((part) => (
                            <span
                              key={part}
                              className="text-xs bg-bg border border-silver rounded-full px-2.5 py-1 text-text-muted"
                            >
                              {part}
                            </span>
                          ))}
                          {industry.keyParts.length > 3 && (
                            <span className="text-xs bg-bg border border-silver rounded-full px-2.5 py-1 text-text-muted">
                              +{industry.keyParts.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="flex items-center gap-1.5 text-orange text-sm font-semibold group-hover:gap-2.5 transition-all duration-150">
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="bg-navy py-14 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-black mb-3">
              Can&apos;t Find Your Industry?
            </h2>
            <p className="text-silver/80 mb-6">
              We source parts for a wide range of niche applications. Contact
              our procurement team with your specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/rfq"
                className="inline-flex items-center justify-center gap-2 bg-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-light transition-colors"
              >
                Submit an RFQ
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
