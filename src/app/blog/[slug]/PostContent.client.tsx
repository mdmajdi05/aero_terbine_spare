'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CommentSection from '@/components/blog/CommentSection';
import SafeImage from '@/components/blog/SafeImage';
import type { BlogPost, SchemaOverrides } from '@/types/blog';

function toSafeJson(data: unknown): string {
  try { return JSON.stringify(data).replace(/</g, '\\u003c'); } catch { return '{}'; }
}

function generateSchema(post: BlogPost): Record<string, unknown> {
  const ov = post.schemaOverrides as SchemaOverrides | null | undefined;
  const headline = ov?.customHeadline || post.metaTitle || post.title;
  const desc = ov?.customDescription || post.metaDesc || post.excerpt || '';
  const schemaType = ov?.schemaType || 'BlogPosting';
  return {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline,
    description: desc,
    image: post.coverImage || undefined,
    url: `https://aeroturbinespare.com/blog/${post.slug}`,
    author: { '@type': 'Person', name: post.author.fullName },
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt || undefined,
    keywords: post.tags.map((t) => t.name).join(', ') || undefined,
    articleSection: ov?.articleSection || post.categories.map((c) => c.name).join(', ') || undefined,
  };
}

function generateFAQSchema(post: BlogPost): Record<string, unknown> | null {
  const ov = post.schemaOverrides as SchemaOverrides | null | undefined;
  if (!ov?.enableFAQ) return null;
  const pairs = ov.faqItems || [];
  if (pairs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.question,
      acceptedAnswer: { '@type': 'Answer', text: p.answer },
    })),
  };
}

function generateBreadcrumbSchema(post: BlogPost): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aeroturbinespare.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://aeroturbinespare.com/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://aeroturbinespare.com/blog/${post.slug}` },
    ],
  };
}

function collectSchemas(post: BlogPost): string[] {
  const results: string[] = [];
  const ov = post.schemaOverrides as SchemaOverrides | null | undefined;

  try {
    if (ov?.isOverridden && ov?.customJsonLd?.trim()) {
      results.push(ov.customJsonLd);
    } else {
      const main = generateSchema(post);
      results.push(toSafeJson(main));

      const faq = generateFAQSchema(post);
      if (faq) results.push(toSafeJson(faq));

      const bread = generateBreadcrumbSchema(post);
      results.push(toSafeJson(bread));
    }
  } catch (e) { console.error('[Schema] generation failed:', e); }

  return results;
}

interface Props {
  post: BlogPost;
}

export default function PostContentClient({ post }: Props) {
  const schemas = useMemo(() => collectSchemas(post), [post]);

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <>
      <Header />
      {/* JSON-LD Schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: s }} />
      ))}
      <main>
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0A1628] to-[#1A1A2E] py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((c) => (
                <Link key={c.slug} href={`/blog?category=${c.slug}`}
                  className="bg-[#E8751A] text-white text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {c.name}
                </Link>
              ))}
            </div>
            <h1 className="text-white font-bold text-3xl md:text-4xl leading-tight mb-4">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-[#C0C9D5] text-sm">
              <span>By <strong className="text-white">{post.author.fullName}</strong></span>
              {dateStr && <span>{dateStr}</span>}
              <span>{post.viewCount} views</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10">
              <SafeImage src={post.coverImage} alt={post.coverAlt || post.title} fill className="object-cover" />
            </div>
          )}

          {/* Article body */}
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-[#E8EDF2]">
              {post.tags.map((t) => (
                <Link key={t.slug} href={`/blog?tag=${t.slug}`}
                  className="text-xs border border-[#E8EDF2] text-[#4A4A6A] px-3 py-1 rounded-full hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-8">
            <Link href="/blog" className="text-[#4F46E5] font-semibold hover:underline text-sm">← All Articles</Link>
          </div>

          {/* Comments */}
          <CommentSection postId={post.id} comments={[]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
