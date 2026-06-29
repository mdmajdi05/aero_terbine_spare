import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { PostStatus } from '@prisma/client';

export async function getSitemapData(_req: AuthenticatedRequest, res: Response) {
  try {
    const [posts, categories, tags] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: PostStatus.Published, deletedAt: null },
        select: { slug: true, updatedAt: true, publishedAt: true, coverImage: true, coverAlt: true },
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogCategory.findMany({
        select: { slug: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.blogTag.findMany({
        select: { slug: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json({
      success: true,
      data: {
        posts,
        categories,
        tags,
        generatedAt: new Date().toISOString(),
        totalUrls: posts.length + categories.length + tags.length + 1,
      },
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
