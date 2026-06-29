'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/blog/PostCard';
import { blogService } from '@/services/blogService';
import type { BlogPost, BlogTag } from '@/types/blog';

export default function TagArchivePage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts,   setPosts]   = useState<BlogPost[]>([]);
  const [tag,     setTag]     = useState<BlogTag | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      blogService.tags.list(),
      blogService.posts.list({ tag: slug, limit: '50' }),
    ])
      .then(([tagRes, postRes]) => {
        const found = tagRes.data.find((t: BlogTag) => t.slug === slug);
        setTag(found ?? null);
        setPosts(postRes.data);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0A1628] to-[#1A1A2E] py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-[#E8751A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">Tag</p>
            <h1 className="text-white font-bold text-4xl md:text-5xl mb-4">
              #{tag?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
            <p className="text-[#C0C9D5] text-lg max-w-2xl mx-auto">
              {tag?._count?.posts ? `${tag._count.posts} article${tag._count.posts > 1 ? 's' : ''} tagged` : 'Browse articles by tag'}
            </p>
            <div className="mt-4">
              <Link href="/blog" className="text-[#E8751A] hover:text-[#d4691a] text-sm font-semibold">← All Articles</Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8EDF2] overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-[#E8EDF2]" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-[#E8EDF2] rounded w-3/4" />
                    <div className="h-3 bg-[#E8EDF2] rounded w-full" />
                    <div className="h-3 bg-[#E8EDF2] rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#C0C9D5] text-lg">No articles found with this tag.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
