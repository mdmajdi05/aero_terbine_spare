'use client';

import Link from 'next/link';
import SafeImage from './SafeImage';
import type { BlogPost } from '@/types/blog';

interface Props {
  post: Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'coverImage' | 'coverAlt' | 'publishedAt' | 'author' | 'categories' | 'tags' | 'viewCount' | '_count'>;
}

export default function PostCard({ post }: Props) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const extraCats = post.categories.length > 1 ? post.categories.length - 1 : 0;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-[#E8EDF2] hover:border-[#4F46E5]/30 hover:shadow-xl transition-all duration-300">
      {/* Cover image */}
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] bg-[#E8EDF2] overflow-hidden">
        {post.coverImage ? (
          <SafeImage
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1628] to-[#4F46E5]">
            <span className="text-white/30 text-5xl font-bold select-none">ATS</span>
          </div>
        )}
        {/* Category badges */}
        {post.categories[0] && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-[#E8751A] text-white text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {post.categories[0].name}
            </span>
            {extraCats > 0 && (
              <span className="bg-[#0A1628]/70 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                +{extraCats}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-6">
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-[#0A1628] font-bold text-lg leading-snug group-hover:text-[#4F46E5] transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>
        </Link>

        {post.excerpt && (
          <p className="text-[#4A4A6A] text-sm leading-relaxed line-clamp-3 mb-3">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.slice(0, 3).map((t) => (
              <Link key={t.slug} href={`/blog/tag/${t.slug}`}
                className="text-[10px] text-[#4A4A6A] bg-[#F0F4F8] px-1.5 py-0.5 rounded-full hover:bg-[#E8EDF2] transition-colors">
                #{t.name}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-[10px] text-[#C0C9D5]">+{post.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8EDF2]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#4F46E5] flex items-center justify-center text-white text-xs font-bold">
              {post.author.fullName.charAt(0)}
            </div>
            <span className="text-xs text-[#4A4A6A] font-medium">{post.author.fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#C0C9D5]">
            {date && <span>{date}</span>}
            {post._count?.comments !== undefined && (
              <span>{post._count.comments} comments</span>
            )}
            <span>{post.viewCount} views</span>
          </div>
        </div>
      </div>
    </article>
  );
}
