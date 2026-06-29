import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import logger from '../../config/logger';

export async function listVersions(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const versions = await prisma.blogPostVersion.findMany({
      where: { postId: id },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, title: true, slug: true, createdAt: true, createdBy: true },
    });
    res.json({ success: true, data: versions });
  } catch (err) {
    logger.error('Failed to list versions: ' + err);
    res.status(500).json({ success: false, error: 'Failed to list versions' });
  }
}

export async function getVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, versionId } = req.params;
    const version = await prisma.blogPostVersion.findUnique({ where: { id: versionId } });
    if (!version || version.postId !== id) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }
    res.json({ success: true, data: version });
  } catch (err) {
    logger.error('Failed to get version: ' + err);
    res.status(500).json({ success: false, error: 'Failed to get version' });
  }
}

export async function restoreVersion(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, versionId } = req.params;
    const version = await prisma.blogPostVersion.findUnique({ where: { id: versionId } });
    if (!version || version.postId !== id) {
      return res.status(404).json({ success: false, error: 'Version not found' });
    }
    const restored = await prisma.blogPost.update({
      where: { id },
      data: {
        title: version.title,
        slug: version.slug,
        content: version.content,
        excerpt: version.excerpt,
        coverImage: version.coverImage,
        coverAlt: version.coverAlt,
        metaTitle: version.metaTitle,
        metaDesc: version.metaDesc,
        focusKw: version.focusKw,
        canonicalUrl: version.canonicalUrl,
        robotsIndex: version.robotsIndex,
        robotsFollow: version.robotsFollow,
        schemaOverrides: version.schemaOverrides as any,
        customJsonLd: version.customJsonLd,
      },
    });
    res.json({ success: true, data: restored });
  } catch (err) {
    logger.error('Failed to restore version: ' + err);
    res.status(500).json({ success: false, error: 'Failed to restore version' });
  }
}
