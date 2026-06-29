'use client';

import { useMemo } from 'react';
import type { SchemaOverrides, SEOFields } from '@/types/blog';
import FAQBuilder from './FAQBuilder';

function safeJson(data: unknown): string {
  try { return JSON.stringify(data, null, 2).replace(/</g, '\\u003c'); } catch { return '{}'; }
}

interface Props {
  seo: SEOFields;
  content: string;
  coverImage: string;
  title: string;
  excerpt: string;
  postSlug: string;
  author: string;
  date: string;
  onChange: (next: SEOFields) => void;
}

const SCHEMA_TYPES = ['BlogPosting', 'NewsArticle', 'TechArticle', 'Review', 'HowTo'] as const;

function buildAutoSchema(opts: { title: string; description: string; image: string; slug: string; author: string; date: string; seo: SEOFields }) {
  const headline = opts.seo.schemaOverrides?.customHeadline || opts.title;
  const desc = opts.seo.schemaOverrides?.customDescription || opts.description;
  const type = opts.seo.schemaOverrides?.schemaType || 'BlogPosting';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    headline,
    description: desc,
    image: opts.image || undefined,
    url: `https://aeroturbinespare.com/blog/${opts.slug}`,
    author: { '@type': 'Person', name: opts.author },
    datePublished: opts.date || undefined,
    dateModified: new Date().toISOString(),
    articleSection: opts.seo.schemaOverrides?.articleSection || undefined,
  };
}

function buildFAQSchema(items: { question: string; answer: string }[]) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((p) => ({
      '@type': 'Question',
      name: p.question,
      acceptedAnswer: { '@type': 'Answer', text: p.answer },
    })),
  };
}

function buildBreadcrumbSchema(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeroturbinespare.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aeroturbinespare.com/blog' },
      { '@type': 'ListItem', position: 3, name: title, item: `https://aeroturbinespare.com/blog/${slug}` },
    ],
  };
}

export default function SchemaOverridePanel({ seo, coverImage, title, excerpt, postSlug, author, date, onChange }: Props) {
  const overrides = seo.schemaOverrides || { enabled: false, enableFAQ: false, enableBreadcrumbs: false };
  const enabled = overrides.enabled;

  function setOverrides(partial: Partial<SchemaOverrides>) {
    onChange({ ...seo, schemaOverrides: { ...overrides, ...partial } });
  }

  const autoSchema = useMemo(() => buildAutoSchema({ title, description: excerpt, image: coverImage, slug: postSlug, author, date, seo }), [title, excerpt, coverImage, postSlug, author, date, seo]);
  const faqSchema = useMemo(() => overrides.enableFAQ && overrides.faqItems ? buildFAQSchema(overrides.faqItems) : null, [overrides.enableFAQ, overrides.faqItems]);
  const breadcrumbSchema = useMemo(() => overrides.enableBreadcrumbs ? buildBreadcrumbSchema(postSlug, title) : null, [overrides.enableBreadcrumbs, postSlug, title]);

  const schemas: Record<string, unknown>[] = [autoSchema];
  if (faqSchema) schemas.push(faqSchema);
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);

  if (overrides.customJsonLd?.trim()) {
    try {
      const parsed = JSON.parse(overrides.customJsonLd);
      schemas.push(parsed);
    } catch {
      console.error('[SchemaOverridePanel] Invalid customJsonLd — falling back to auto');
    }
  }

  return (
    <div className="bg-white border border-[#E8EDF2] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8EDF2]">
        <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">Schema (JSON-LD)</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setOverrides({ enabled: e.target.checked })} className="sr-only peer" />
          <div className="w-8 h-4.5 bg-[#E8EDF2] rounded-full peer peer-checked:bg-[#4F46E5] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all" />
        </label>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Auto-generated preview (always visible) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-[#C0C9D5] uppercase tracking-wider">Auto-Generated Preview</span>
          </div>
          <pre className="bg-[#F8FAFC] border border-[#E8EDF2] rounded-lg p-2 text-[10px] text-[#4A4A6A] overflow-x-auto max-h-28 leading-relaxed font-mono">{safeJson(autoSchema)}</pre>
        </div>

        {enabled && (
          <div className="space-y-3 border-t border-[#E8EDF2] pt-3">
            {/* Schema Type */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Schema Type</label>
              <select value={overrides.schemaType || 'BlogPosting'} onChange={(e) => setOverrides({ schemaType: e.target.value as any })}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
                {SCHEMA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Article Section / Category */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Article Section / Category</label>
              <input type="text" value={overrides.articleSection || ''} onChange={(e) => setOverrides({ articleSection: e.target.value })}
                placeholder="e.g. Aerospace Technology"
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            </div>

            {/* Custom Headline */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Custom Headline</label>
              <input type="text" value={overrides.customHeadline || ''} onChange={(e) => setOverrides({ customHeadline: e.target.value })}
                placeholder="Leave empty to use post title"
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            </div>

            {/* Custom Description */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Custom Description</label>
              <textarea rows={2} value={overrides.customDescription || ''} onChange={(e) => setOverrides({ customDescription: e.target.value })}
                placeholder="Leave empty to use meta description"
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            </div>

            {/* FAQ Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">Enable FAQ Schema</span>
              <input type="checkbox" checked={overrides.enableFAQ} onChange={(e) => setOverrides({ enableFAQ: e.target.checked })} className="accent-[#4F46E5] w-4 h-4" />
            </label>
            {overrides.enableFAQ && (
              <div className="pl-2 border-l-2 border-[#E8EDF2]">
                <FAQBuilder items={overrides.faqItems || []} onChange={(items) => setOverrides({ faqItems: items })} />
              </div>
            )}

            {/* Breadcrumb Toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">Enable Breadcrumb Schema</span>
              <input type="checkbox" checked={overrides.enableBreadcrumbs} onChange={(e) => setOverrides({ enableBreadcrumbs: e.target.checked })} className="accent-[#4F46E5] w-4 h-4" />
            </label>

            {/* Custom JSON-LD */}
            <div>
              <label className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Raw Custom JSON-LD <span className="text-[#C0C9D5] normal-case">(advanced)</span></label>
              <textarea rows={4} value={overrides.customJsonLd || ''} onChange={(e) => setOverrides({ customJsonLd: e.target.value })}
                placeholder='{&#10;  "@type": "BlogPosting",&#10;  "alternativeHeadline": "..."&#10;}'
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-xs text-[#0A1628] font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            </div>

            {/* Current schema output */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[#C0C9D5] uppercase tracking-wider">Final Schema Output</span>
              </div>
              <pre className="bg-[#F8FAFC] border border-[#E8EDF2] rounded-lg p-2 text-[10px] text-[#0A1628] overflow-x-auto max-h-40 leading-relaxed font-mono">{schemas.map((s) => safeJson(s)).join('\n\n')}</pre>
            </div>

            {/* Reset */}
            <button type="button" onClick={() => onChange({ ...seo, schemaOverrides: { enabled: false, enableFAQ: false, enableBreadcrumbs: false } })}
              className="w-full text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-medium py-2 rounded-lg transition-colors">
              Reset to Auto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
