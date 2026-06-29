import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

export async function listTags(_req: AuthenticatedRequest, res: Response) {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json({ success: true, data: tags });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function createTag(req: AuthenticatedRequest, res: Response) {
  try {
    const { name } = req.body as { name: string };
    const tag = await prisma.blogTag.create({ data: { name, slug: toSlug(name) } });
    res.status(201).json({ success: true, data: tag });
  } catch (e: any) {
    if (e.code === 'P2002') res.status(409).json({ success: false, error: 'Tag already exists' });
    else res.status(500).json({ success: false, error: e.message });
  }
}

export async function updateTag(req: AuthenticatedRequest, res: Response) {
  try {
    const { name } = req.body as { name: string };
    const tag = await prisma.blogTag.update({
      where: { id: req.params.id },
      data: { name, slug: toSlug(name) },
    });
    res.json({ success: true, data: tag });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deleteTag(req: AuthenticatedRequest, res: Response) {
  try {
    await prisma.blogTag.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Tag deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
