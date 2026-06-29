import { Metadata } from 'next';
import Link from 'next/link';
import PostContentClient from './PostContent.client';
import type { BlogPost, SchemaOverrides } from '@/types/blog';

const API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/blog/posts/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Aero Turbine Spare',
      robots: { index: false, follow: false },
    };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDesc || post.excerpt || '';
  const canonical = post.canonicalUrl || `https://aeroturbinespare.com/blog/${post.slug}`;
  const robotsIndex = post.robotsIndex !== false;
  const robotsFollow = post.robotsFollow !== false;

  return {
    title: `${title} | Aero Turbine Spare`,
    description,
    metadataBase: new URL('https://aeroturbinespare.com'),
    alternates: { canonical },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : [],
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: [post.author.fullName],
      tags: post.tags.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-[#0A1628] mb-4">Article Not Found</h1>
          <Link href="/blog" className="text-[#4F46E5] font-semibold hover:underline">← Back to Blog</Link>
        </div>
      </>
    );
  }

  return <PostContentClient post={post} />;
}
