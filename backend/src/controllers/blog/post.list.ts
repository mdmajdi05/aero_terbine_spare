import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { PostStatus, Prisma } from '@prisma/client';
import logger from '../../config/logger';

function buildMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Admin / Content Manager ───────────────────────────────────

export async function listAdminPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const page  = Math.max(1,   Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit)  || 20);
    const skip  = (page - 1) * limit;
    const status = req.query.status as PostStatus | undefined;
    const trash  = req.query.trash === 'true';

    const where: Prisma.BlogPostWhereInput = {
      deletedAt: trash ? { not: null } : null,
      ...(status && !trash && { status }),
    };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip, take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true, title: true, slug: true, status: true,
          publishedAt: true, scheduledAt: true, viewCount: true,
          deletedAt: true, seoScore: true, createdAt: true,
          author: { select: { fullName: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({ success: true, data: posts, pagination: buildMeta(total, page, limit) });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function searchPostsForLinking(req: AuthenticatedRequest, res: Response) {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const posts = await prisma.blogPost.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, slug: true },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: posts });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
