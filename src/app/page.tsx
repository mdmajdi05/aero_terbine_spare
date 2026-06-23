'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ArrowRight, ChevronDown, Filter, X,
  ShieldCheck, Award, Clock, Truck, Zap,
} from 'lucide-react';
import type { Product, Category, Testimonial } from '@/types';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TrustBar from '@/components/home/TrustBar';
import IndustriesGrid from '@/components/home/IndustriesGrid';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import HowItWorks from '@/components/home/HowItWorks';
import StatsCounter from '@/components/home/StatsCounter';
import TestimonialsCarousel from '@/components/home/TestimonialsCarousel';
import PartCard from '@/components/catalog/PartCard';
import Button from '@/components/ui/Button';
import { request } from '@/lib/api-client';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useSiteConfig } from '@/hooks/useSiteConfig';

const SEARCH_TYPES = ['Part Number', 'NSN', 'CAGE Code', 'Description', 'Manufacturer'];
const CONDITIONS   = ['Any Condition', 'New', 'Overhauled', 'Refurbished', 'Used'];
const CATEGORIES   = ['All Categories', 'Turbines & Engines', 'Airframe', 'Bearings', 'Electronics', 'Hydraulics'];
const STOCK_OPTS   = ['Any Stock', 'In Stock', 'On Order', 'Limited'];

export default function HomePage() {
  const router = useRouter();
  const { config: site } = useSiteConfig();

  const [search, setSearch]             = useState('');
  const [searchType, setSearchType]     = useState('Part Number');
  const [condition, setCondition]       = useState('Any Condition');
  const [category, setCategory]         = useState('All Categories');
  const [stock, setStock]               = useState('Any Stock');
  const [showFilters, setShowFilters]   = useState(false);
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      request<{ success: boolean; data: Product[]; pagination: unknown }>('/products?limit=8'),
      request<{ success: boolean; data: Category[] }>('/categories'),
      request<{ success: boolean; data: Testimonial[] }>('/testimonials'),
    ]).then(([prods, cats, tests]) => {
      setProducts(prods.data);
      setCategories(cats.data);
      setTestimonials(tests.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (searchType !== 'Part Number') params.set('filterType', searchType);
    if (condition !== 'Any Condition') params.set('condition', condition);
    if (category !== 'All Categories') params.set('category', category);
    if (stock !== 'Any Stock') params.set('stock', stock);
    router.push(`/catalog?${params.toString()}`);
  };

  const hasFilters = condition !== 'Any Condition' || category !== 'All Categories' || stock !== 'Any Stock';

  // Compute hero background
  const heroBg =
    site.heroBgType === 'solid'
      ? site.heroBgValue
      : site.heroBgType === 'image'
      ? `url(${site.heroBgValue}) center/cover`
      : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* ═══════════════════════════════════════════════════
          HERO — Blue/Indigo theme, dynamic from SiteConfig
      ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={heroBg ? { background: heroBg } : undefined}
      >
        {/* Gradient when type = gradient or no override */}
        {site.heroBgType !== 'solid' && site.heroBgType !== 'image' && (
          <div className="absolute inset-0 hero-gradient" />
        )}

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Ambient glow blobs */}
        <div className="absolute top-1/3 right-[15%] w-[28rem] h-[28rem] bg-[#4F46E5]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-[10%]   w-[20rem] h-[20rem] bg-[#1D4ED8]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-[18rem] h-[18rem] bg-[#818CF8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold text-white mb-8 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse flex-shrink-0" />
              {site.heroBadgeText || 'Trusted by 500+ Aviation Companies'}
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-white leading-[1.1] mb-6 tracking-tight">
              {site.heroHeading
                ? site.heroHeading.split(',').map((part, i, arr) => (
                    <span key={i}>
                      {i === 1 ? <span className="gradient-text">{part}</span> : part}
                      {i < arr.length - 1 ? ',' : ''}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))
                : (
                  <>
                    Source Aerospace Parts<br />
                    <span className="gradient-text">with Confidence</span>
                  </>
                )
              }
            </h1>

            {/* Sub-heading */}
            <p className="text-white/70 text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl">
              {site.heroSubheading ||
                'Global inventory of aviation, turbine, and defense components — NSN, CAGE, and part-number searchable in seconds.'}
            </p>

            {/* ─── Advanced Search Bar ─────────────────── */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
              {/* Main search row */}
              <div className="flex items-stretch">
                {/* Filter type selector */}
                <div className="relative border-r border-[#E8EDF2] flex-shrink-0">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="appearance-none h-full pl-4 pr-8 text-xs font-semibold text-[#0A1628] bg-[#F5F7FA] focus:outline-none focus:bg-[#EEF2FF] cursor-pointer min-w-[120px]"
                  >
                    {SEARCH_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A4A6A] pointer-events-none" />
                </div>

                {/* Text input */}
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search by ${searchType}…`}
                  className="flex-1 text-sm text-[#0A1628] px-5 py-4 focus:outline-none placeholder:text-[#4A4A6A]/50 min-w-0"
                  autoComplete="off"
                />

                {/* Filter toggle */}
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className={`flex items-center gap-1.5 px-4 text-sm font-medium border-l border-[#E8EDF2] transition-colors flex-shrink-0 ${
                    showFilters || hasFilters
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'text-[#4A4A6A] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasFilters && (
                    <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center">
                      {[condition !== 'Any Condition', category !== 'All Categories', stock !== 'Any Stock'].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Search button */}
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors flex-shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>

              {/* Expandable filter row */}
              <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-24 border-t border-[#E8EDF2]' : 'max-h-0'}`}>
                <div className="flex flex-wrap gap-3 px-5 py-3 bg-[#F8F9FF]">
                  {/* Condition */}
                  <div className="relative">
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium text-[#0A1628] bg-white border border-[#E8EDF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
                    >
                      {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A4A6A] pointer-events-none" />
                  </div>

                  {/* Category */}
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium text-[#0A1628] bg-white border border-[#E8EDF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A4A6A] pointer-events-none" />
                  </div>

                  {/* Stock */}
                  <div className="relative">
                    <select
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium text-[#0A1628] bg-white border border-[#E8EDF2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 cursor-pointer"
                    >
                      {STOCK_OPTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4A4A6A] pointer-events-none" />
                  </div>

                  {/* Clear filters */}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={() => { setCondition('Any Condition'); setCategory('All Categories'); setStock('Any Stock'); }}
                      className="flex items-center gap-1 pl-2 pr-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Quick-search tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['GE90 Turbine Blades', 'CFM56 Parts', 'Boeing 737 Components', 'NSN 2840-01'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => { setSearch(tag); router.push(`/catalog?search=${encodeURIComponent(tag)}`); }}
                  className="px-3 py-1 text-xs font-medium text-white/70 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3">
              <Link href={site.heroCta1Href || '/rfq'}>
                <Button variant="blue" size="lg">
                  {site.heroCta1Label || 'Request a Quote'} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={site.heroCta2Href || '/catalog'}>
                <Button
                  variant="outline" size="lg"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50"
                >
                  {site.heroCta2Label || 'Browse Catalog'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust chips — desktop right panel */}
          <div className="hidden xl:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 w-64">
            {[
              { icon: ShieldCheck, label: 'ISO 9001 & AS9120B', sub: 'Quality Certified' },
              { icon: Clock,       label: '24-Hr Quote Response', sub: 'SLA Guaranteed' },
              { icon: Award,       label: 'Zero Counterfeit Policy', sub: 'Full Traceability' },
              { icon: Truck,       label: '150+ Countries Served', sub: 'Global Logistics' },
              { icon: Zap,         label: 'AOG Priority Response', sub: '4-Hour Escalation' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 bg-white/8 border border-white/12 rounded-xl px-4 py-3 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-[#4F46E5]/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#818CF8]" />
                </div>
                <div>
                  <div className="text-white text-xs font-semibold leading-tight">{label}</div>
                  <div className="text-white/50 text-[10px] mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      <TrustBar />
      <IndustriesGrid />
      <FeaturedCategories categories={categories} />
      <HowItWorks />
      <StatsCounter />

      {/* LATEST PARTS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#4F46E5] text-sm font-semibold uppercase tracking-wider mb-2">
                <span className="w-6 h-px bg-[#4F46E5]" /> Fresh Inventory
              </div>
              <h2 className="text-3xl font-bold text-[#0A1628]">Recently Added Parts</h2>
            </div>
            <Link href="/catalog" className="text-sm font-medium text-[#4F46E5] hover:underline">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((p) => <PartCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <TestimonialsCarousel testimonials={testimonials} />

      {/* WHY US */}
      <section className="py-20 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-[#818CF8] text-sm font-semibold uppercase tracking-wider mb-4">
                <span className="w-6 h-px bg-[#4F46E5]" /> Our Advantage
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Why Top MROs &amp; OEMs Choose AeroTurbineSpare
              </h2>
              <div className="space-y-5">
                {[
                  { title: 'Full Traceability on Every Part', desc: 'Every component comes with complete documentation — 8130-3 tags, COCs, and material certifications.' },
                  { title: 'Direct Access to Your Trader', desc: 'A dedicated account manager works every RFQ, ensuring you get the right part at the best price.' },
                  { title: 'Hard-to-Find & Obsolete Parts', desc: 'We specialize in sourcing parts that other distributors can\'t locate — legacy military and legacy commercial.' },
                  { title: 'No Counterfeit Policy', desc: 'Stringent supplier qualification, incoming inspection, and chain-of-custody controls eliminate counterfeit risk.' },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{title}</div>
                      <div className="text-[#C0C9D5]/70 text-sm mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '100%', label: 'Inspection on Every Order' },
                { val: '< 24h', label: 'Average Quote Response' },
                { val: 'AS9120', label: 'Quality Certification' },
                { val: 'Zero', label: 'Counterfeit Incidents' },
              ].map(({ val, label }) => (
                <div key={label} className="bg-white/8 border border-white/12 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-[#818CF8] mb-1">{val}</div>
                  <div className="text-[#C0C9D5]/80 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* URGENT CTA */}
      <section className="py-16 bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-3">Need a Part Urgently?</h2>
          <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
            AOG situations require immediate action. Our urgent team is on standby 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rfq?urgency=urgent">
              <Button variant="primary" size="xl" className="bg-white text-[#4F46E5] hover:bg-white/90">
                Submit Urgent RFQ
              </Button>
            </Link>
            <a href="tel:+17138425500">
              <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10 hover:text-white">
                Call +1-713-842-5500
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
