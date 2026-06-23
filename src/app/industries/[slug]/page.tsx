'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, Package, ArrowLeft,
  Plane, Shield, Car, Heart, Cpu, Radio,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { request } from '@/lib/api-client';
import type { Industry } from '@/types';
import { cn } from '@/lib/utils';

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  shield: Shield,
  car: Car,
  heart: Heart,
  cpu: Cpu,
  radio: Radio,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [industry, setIndustry] = useState<Industry | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    request<{ success: boolean; data: Industry }>('/industries/' + slug)
      .then((res) => {
        if (!cancelled) setIndustry(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Industry not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-bg py-12 px-4">
          <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-4 w-48 bg-silver rounded" />
            <div className="h-12 w-3/4 bg-silver rounded" />
            <div className="h-4 w-1/2 bg-silver rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-silver rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !industry) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4 bg-bg">
          <div className="text-center max-w-md">
            <div className="text-6xl font-black text-silver mb-4">404</div>
            <h1 className="text-2xl font-bold text-text mb-2">
              Industry Not Found
            </h1>
            <p className="text-text-muted mb-6">
              {error ?? 'We couldn\'t find the industry page you\'re looking for.'}
            </p>
            <Link href="/industries">
              <Button variant="orange" size="lg">
                <ArrowLeft className="w-4 h-4" />
                View All Industries
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = ICON_MAP[industry.icon] ?? Plane;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-navy text-white py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <Breadcrumb
              className="mb-6 [&_a]:text-silver/70 [&_a:hover]:text-orange [&_span]:text-silver/50"
              items={[
                { label: 'Home', href: '/' },
                { label: 'Industries', href: '/industries' },
                { label: industry.name },
              ]}
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-9 h-9 text-orange" />
              </div>
              <div>
                <div className="text-orange text-xs font-bold uppercase tracking-widest mb-2">
                  Industry Expertise
                </div>
                <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
                  {industry.name}
                </h1>
                <p className="text-silver/80 text-lg leading-relaxed">
                  {industry.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────────── */}
        <div className="bg-orange">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-6">
              <div className="text-white">
                <div className="text-2xl font-black">
                  {industry.partCount.toLocaleString()}+
                </div>
                <div className="text-white/80 text-xs uppercase tracking-wide">
                  Parts in Catalog
                </div>
              </div>
              <div className="w-px bg-white/30 hidden sm:block" />
              <div className="text-white">
                <div className="text-2xl font-black">24 hrs</div>
                <div className="text-white/80 text-xs uppercase tracking-wide">
                  Quote Response
                </div>
              </div>
              <div className="w-px bg-white/30 hidden sm:block" />
              <div className="text-white">
                <div className="text-2xl font-black">AS9120</div>
                <div className="text-white/80 text-xs uppercase tracking-wide">
                  Certified
                </div>
              </div>
            </div>
            <Link href="/rfq">
              <Button variant="primary" size="md" className="bg-white text-orange hover:bg-white/90">
                Request Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Long description ──────────────────────────────────────────── */}
        <section className="bg-bg py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
                    <span className="w-6 h-px bg-orange" />
                    Overview
                  </div>
                  <h2 className="text-2xl font-black text-text mb-4">
                    Our {industry.name} Expertise
                  </h2>
                  <p className="text-text-muted leading-relaxed">
                    {industry.longDescription}
                  </p>
                </div>

                {/* Key parts */}
                <div>
                  <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange" />
                    Key Parts We Supply
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {industry.keyParts.map((part) => (
                      <div
                        key={part}
                        className={cn(
                          'flex items-center gap-3 bg-white border border-silver rounded-xl px-4 py-3',
                          'hover:border-orange/30 hover:shadow-sm transition-all duration-150',
                        )}
                      >
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-sm font-medium text-text">{part}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/catalog?industry=${industry.slug}`}
                      className="text-orange text-sm font-semibold hover:underline flex items-center gap-1.5"
                    >
                      Browse all {industry.name} parts
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Clients */}
                <div className="bg-white border border-silver rounded-2xl p-5">
                  <h3 className="font-bold text-text mb-4 text-sm uppercase tracking-wide">
                    Trusted By
                  </h3>
                  <ul className="space-y-2">
                    {industry.clients.map((client) => (
                      <li
                        key={client}
                        className="flex items-center gap-2 text-sm text-text-muted py-1.5 border-b border-silver last:border-0"
                      >
                        <div className="w-7 h-7 rounded-md bg-navy flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black">
                          {client
                            .split(' ')
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <span className="font-medium">{client}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-text-muted mt-3 italic">
                    Representative clients. Confidential relationships not listed.
                  </p>
                </div>

                {/* CTA Card */}
                <div className="bg-navy text-white rounded-2xl p-5">
                  <h3 className="font-bold mb-2">Need Parts Fast?</h3>
                  <p className="text-silver/80 text-sm mb-4">
                    Submit an RFQ for {industry.name} components and receive a
                    quote within 24 hours.
                  </p>
                  <Link href={`/rfq`} className="block">
                    <Button variant="orange" size="md" className="w-full">
                      Submit RFQ
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {/* Certifications */}
                <div className="bg-bg border border-silver rounded-2xl p-5">
                  <h3 className="font-bold text-text mb-3 text-sm uppercase tracking-wide">
                    Our Certifications
                  </h3>
                  <div className="space-y-2">
                    {['ISO 9001:2015', 'AS9120 Rev B', 'CAGE 8ATR9'].map(
                      (cert) => (
                        <div
                          key={cert}
                          className="flex items-center gap-2 text-sm text-text-muted"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          {cert}
                        </div>
                      ),
                    )}
                  </div>
                  <Link
                    href="/quality"
                    className="mt-4 text-orange text-xs font-semibold hover:underline flex items-center gap-1"
                  >
                    View Quality Assurance <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────── */}
        <section className="bg-bg border-t border-silver py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-text mb-3">
              Ready to Source {industry.name} Parts?
            </h2>
            <p className="text-text-muted mb-8 leading-relaxed">
              Our procurement specialists have deep expertise in{' '}
              {industry.name.toLowerCase()} supply chains. Submit an RFQ or
              contact us to discuss your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/rfq">
                <Button variant="orange" size="lg">
                  Request a Quote
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Talk to a Specialist
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
