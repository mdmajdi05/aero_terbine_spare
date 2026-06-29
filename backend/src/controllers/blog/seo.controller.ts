import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import logger from '../../config/logger';

export async function getLinkEquity(_req: AuthenticatedRequest, res: Response) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, slug: true, content: true },
    });

    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]+)"/gi;
    const internalDomain = 'aeroturbinespare.com';

    const equity = posts.map((p) => {
      const matches = [...p.content.matchAll(linkRegex)];
      let internalLinksCount = 0;
      let externalLinksCount = 0;
      for (const m of matches) {
        const url = m[1];
        if (!url || url.startsWith('#')) continue;
        if (url.startsWith('/') || url.includes(internalDomain)) {
          internalLinksCount++;
        } else {
          externalLinksCount++;
        }
      }
      return { postId: p.id, title: p.title, slug: p.slug, internalLinksCount, externalLinksCount };
    });

    equity.sort((a, b) => b.internalLinksCount - a.internalLinksCount);

    res.json({ success: true, data: equity });
  } catch (err) {
    logger.error('Failed to get link equity: ' + err);
    res.status(500).json({ success: false, error: 'Failed to get link equity' });
  }
}
