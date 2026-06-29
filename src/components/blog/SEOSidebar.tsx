'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import SERPPreview from './SERPPreview';
import SocialSharePreview from './SocialSharePreview';
import type { SEOFields } from '@/types/blog';
import type { BlogFormValues } from '@/types/blog-form';

interface Props {
  seo?: SEOFields;
  content?: string;
  coverImage?: string;
  onChange?: (next: SEOFields) => void;
  onScoreChange?: (score: number) => void;
  title?: string;
}

interface ScoreCheck {
  label: string;
  pass: boolean;
  points: number;
}

function countLinks(html: string): { internal: number; external: number } {
  const internal: string[] = [];
  const external: string[] = [];
  const hrefRe = /<a[^>]*\shref=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRe.exec(html)) !== null) {
    const href = match[1].toLowerCase();
    if (href.startsWith('/blog/') || html.slice(match.index, match.index + match[0].length).includes('data-internal-link')) {
      internal.push(href);
    } else if (href.startsWith('http')) {
      external.push(href);
    }
  }
  return { internal: internal.length, external: external.length };
}

function fleschKincaid(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const syllables = text.split(/\s+/).filter(Boolean).reduce((sum, w) => {
    const s = w.toLowerCase().replace(/[^a-z]/g, '');
    if (!s) return sum;
    let count = 0;
    let prevVowel = false;
    for (const ch of s) {
      const isVowel = 'aeiou'.includes(ch);
      if (isVowel && !prevVowel) count++;
      prevVowel = isVowel;
    }
    return sum + Math.max(count, 1);
  }, 0);
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

function calcScore(seo: SEOFields, content: string, coverImage: string): { score: number; checks: ScoreCheck[] } {
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const kw = seo.focusKw.toLowerCase().trim();
  const { internal: internalLinks, external: externalLinks } = countLinks(content);
  const headingRe = /<h[1-4][^>]*>.*?<\/h[1-4]>/gi;
  const headings = content.match(headingRe)?.map((h) => h.replace(/<[^>]*>/g, '')) ?? [];
  const kwInHeading = kw.length > 0 && headings.some((h) => h.toLowerCase().includes(kw));

  const checks: ScoreCheck[] = [
    { label: 'Meta title present (50–60 chars)', pass: seo.metaTitle.length >= 50 && seo.metaTitle.length <= 60, points: 15 },
    { label: 'Meta description present (120–160 chars)', pass: seo.metaDesc.length >= 120 && seo.metaDesc.length <= 160, points: 15 },
    { label: 'Focus keyword in meta title', pass: kw.length > 0 && seo.metaTitle.toLowerCase().includes(kw), points: 10 },
    { label: 'Focus keyword in content', pass: kw.length > 0 && plainText.toLowerCase().includes(kw), points: 10 },
    { label: 'Focus keyword in a heading', pass: kwInHeading, points: 10 },
    { label: 'URL slug is clean (a-z, 0-9, hyphens)', pass: /^[a-z0-9-]+$/.test(seo.slug) && seo.slug.length > 0, points: 10 },
    { label: 'Content has at least 300 words', pass: wordCount >= 300, points: 10 },
    { label: 'Cover image set', pass: coverImage.trim().length > 0, points: 10 },
    { label: 'At least 2 internal links', pass: internalLinks >= 2, points: 5 },
    { label: 'At least 1 external link', pass: externalLinks >= 1, points: 5 },
    { label: 'Images have alt text', pass: !/<img(?![\s\S]*?alt=)[^>]*>/i.test(content), points: 5 },
    { label: `Content readability: ${Math.round(fleschKincaid(plainText))}`, pass: fleschKincaid(plainText) >= 60, points: 5 },
    {
      label: `Keyword density: ${wordCount > 0 ? ((kw.length > 0 ? (plainText.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length : 0) / wordCount * 100).toFixed(1) : '0.0'}% (${kw.length > 0 ? (plainText.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length : 0}x)`,
      pass: kw.length > 0 && (() => { const count = (plainText.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length; return wordCount > 0 && (count / wordCount * 100) >= 0.5 && (count / wordCount * 100) <= 3.0; })(),
      points: 5,
    },
  ];

  const score = checks.reduce((acc, c) => acc + (c.pass ? c.points : 0), 0);
  return { score, checks };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 80 ? '#00A651' : score >= 50 ? '#E8751A' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#E8EDF2" strokeWidth="6" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }} />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function toSeoFields(values: BlogFormValues): SEOFields {
  return {
    metaTitle: values.metaTitle,
    metaDesc: values.metaDesc,
    slug: values.slug,
    focusKw: values.focusKw,
    canonicalUrl: values.canonicalUrl || undefined,
    robotsIndex: values.robotsIndex,
    robotsFollow: values.robotsFollow,
  };
}

export default function SEOSidebar({ seo: seoProp, content = '', coverImage = '', onChange, onScoreChange, title }: Props) {
  let seoValues: SEOFields;
  let handleChange: (next: SEOFields) => void;
  let seoTitle: string | undefined;

  const formContext = useFormContext<BlogFormValues>() ?? null;

  if (formContext) {
    const values = formContext.watch();
    seoValues = toSeoFields(values);
    handleChange = useCallback((next: SEOFields) => {
      formContext.setValue('metaTitle', next.metaTitle);
      formContext.setValue('metaDesc', next.metaDesc);
      formContext.setValue('slug', next.slug);
      formContext.setValue('focusKw', next.focusKw);
      formContext.setValue('canonicalUrl', next.canonicalUrl ?? '');
      formContext.setValue('robotsIndex', next.robotsIndex ?? true);
      formContext.setValue('robotsFollow', next.robotsFollow ?? true);
    }, [formContext]);
    seoTitle = values.title;
  } else {
    seoValues = seoProp ?? { metaTitle: '', metaDesc: '', slug: '', focusKw: '' };
    handleChange = onChange ?? (() => {});
    seoTitle = title;
  }

  const { score, checks } = useMemo(() => calcScore(seoValues, content, coverImage), [seoValues, content, coverImage]);
  const { internal, external } = useMemo(() => countLinks(content), [content]);

  useEffect(() => { onScoreChange?.(score); }, [score, onScoreChange]);
  useEffect(() => {
    if (seoValues.internalLinks !== internal || seoValues.externalLinks !== external) {
      handleChange({ ...seoValues, internalLinks: internal, externalLinks: external });
    }
  }, [internal, external]);

  function set(key: keyof SEOFields, value: string) {
    handleChange({ ...seoValues, [key]: value });
  }

  return (
    <div className="space-y-3">
      <CollapsibleSection id="seo-score" title="SEO Score" defaultOpen={true}>
        <div className="flex items-center gap-4">
          <ScoreRing score={score} />
          <div>
            <p className="font-semibold text-[#0A1628] text-sm">
              {score >= 80 ? 'Great!' : score >= 50 ? 'Needs improvement' : 'Poor — fix issues below'}
            </p>
            <p className="text-xs text-[#4A4A6A]">{score}/100</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="seo-checks" title="Checks" count={`${checks.filter((c) => c.pass).length}/${checks.length}`}>
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-start gap-2 text-xs">
              <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${c.pass ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                {c.pass ? '✓' : '✕'}
              </span>
              <span className={c.pass ? 'text-[#4A4A6A]' : 'text-red-500'}>{c.label}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="seo-fields" title="SEO Fields" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <label htmlFor="seo-slug" className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Slug</label>
            <input id="seo-slug" type="text" value={seoValues.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              placeholder="post-url-slug"
              className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 font-mono" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="seo-meta-title" className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">Meta Title</label>
              <span className={`text-xs ${seoValues.metaTitle.length >= 50 && seoValues.metaTitle.length <= 60 ? 'text-green-500' : 'text-[#C0C9D5]'}`}>{seoValues.metaTitle.length}/60</span>
            </div>
            <input id="seo-meta-title" type="text" value={seoValues.metaTitle} onChange={(e) => set('metaTitle', e.target.value)}
              placeholder="SEO meta title (50–60 chars)"
              className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="seo-meta-desc" className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">Meta Description</label>
              <span className={`text-xs ${seoValues.metaDesc.length >= 120 && seoValues.metaDesc.length <= 160 ? 'text-green-500' : 'text-[#C0C9D5]'}`}>{seoValues.metaDesc.length}/160</span>
            </div>
            <textarea id="seo-meta-desc" rows={3} value={seoValues.metaDesc} onChange={(e) => set('metaDesc', e.target.value)}
              placeholder="Meta description for search engines (120–160 chars)"
              className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
          </div>
          <div>
            <label htmlFor="seo-focus-kw" className="block text-xs font-semibold text-[#0A1628] mb-1 uppercase tracking-wider">Focus Keyword</label>
            <input id="seo-focus-kw" type="text" value={seoValues.focusKw} onChange={(e) => set('focusKw', e.target.value)}
              placeholder="e.g. turbine spare parts"
              className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
          </div>
          <div>
            <label htmlFor="seo-canonical" className="text-xs text-[#4A4A6A] mb-1 block">Canonical URL</label>
            <input id="seo-canonical" type="text" value={seoValues.canonicalUrl || ''} onChange={(e) => handleChange({ ...seoValues, canonicalUrl: e.target.value })}
              placeholder="https://aeroturbinespare.com/..." className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seoValues.robotsIndex !== false} onChange={(e) => handleChange({ ...seoValues, robotsIndex: e.target.checked })}
                className="accent-[#4F46E5] w-3.5 h-3.5" />
              <span className="text-xs text-[#4A4A6A]">Index</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={seoValues.robotsFollow !== false} onChange={(e) => handleChange({ ...seoValues, robotsFollow: e.target.checked })}
                className="accent-[#4F46E5] w-3.5 h-3.5" />
              <span className="text-xs text-[#4A4A6A]">Follow links</span>
            </label>
          </div>
        </div>
      </CollapsibleSection>

      <SERPPreview
        title={seoValues.metaTitle || seoTitle || ''}
        description={seoValues.metaDesc || ''}
        slug={seoValues.slug}
        canonicalUrl={seoValues.canonicalUrl}
      />

      <SocialSharePreview title={seoValues.metaTitle || seoTitle || ''} description={seoValues.metaDesc} url={`https://aeroturbinespare.com/blog/${seoValues.slug}`} image={coverImage} />
    </div>
  );
}
