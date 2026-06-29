import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { PostStatus, Prisma } from '@prisma/client';
import logger from '../../config/logger';

function buildMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Public ────────────────────────────────────────────────────

export async function listPublicPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const page     = Math.max(1, Number(req.query.page)  || 1);
    const limit    = Math.min(50,  Number(req.query.limit) || 10);
    const skip     = (page - 1) * limit;
    const category = req.query.category as string | undefined;
    const tag      = req.query.tag      as string | undefined;
    const search   = req.query.search   as string | undefined;

    const where: Prisma.BlogPostWhereInput = {
      status:    PostStatus.Published,
      deletedAt: null,
      ...(category && { categories: { some: { slug: category } } }),
      ...(tag      && { tags:       { some: { slug: tag } } }),
      ...(search   && {
        OR: [
          { title:   { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverImage: true, coverAlt: true, canonicalUrl: true, robotsIndex: true, robotsFollow: true, publishedAt: true, viewCount: true,
          author:     { select: { fullName: true, avatarUrl: true } },
          categories: { select: { name: true, slug: true } },
          tags:       { select: { name: true, slug: true } },
          _count:     { select: { comments: { where: { approved: true } } } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.set('Vary', 'Accept-Encoding');
    res.json({ success: true, data: posts, pagination: buildMeta(total, page, limit) });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function getPublicPost(req: AuthenticatedRequest, res: Response) {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, status: PostStatus.Published, deletedAt: null },
      include: {
        author:     { select: { fullName: true, avatarUrl: true } },
        categories: { select: { name: true, slug: true } },
        tags:       { select: { name: true, slug: true } },
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true, content: true, createdAt: true, guestName: true,
            author: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    // Non-blocking view increment
    prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json({ success: true, data: post });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
