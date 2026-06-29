import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import logger from '../../config/logger';

export async function analyzeLinks(_req: AuthenticatedRequest, res: Response) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'Published', deletedAt: null },
      select: { id: true, title: true, content: true },
    });

    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]+)"/gi;
    const internalDomain = 'aeroturbinespare.com';
    const broken: Array<{ sourcePostId: string; sourcePostTitle: string; url: string; statusCode: number; error: string }> = [];

    for (const post of posts) {
      const matches = [...post.content.matchAll(linkRegex)];
      for (const m of matches) {
        const url = m[1];
        if (!url || url.startsWith('#')) continue;
        if (url.startsWith('/')) {
          // Internal link — check by looking for a blog post with matching slug
          const slug = url.replace(/^\/blog\//, '');
          const targetPost = await prisma.blogPost.findFirst({
            where: { slug, status: 'Published', deletedAt: null },
          });
          if (!targetPost) {
            broken.push({ sourcePostId: post.id, sourcePostTitle: post.title, url, statusCode: 404, error: 'Broken internal link' });
          }
        }
      }
    }

    res.json({ success: true, data: { broken, total: broken.length } });
  } catch (err) {
    logger.error('Failed to analyze links: ' + err);
    res.status(500).json({ success: false, error: 'Failed to analyze links' });
  }
}
