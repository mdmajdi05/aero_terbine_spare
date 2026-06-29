import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

export async function listCategories(_req: AuthenticatedRequest, res: Response) {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
    res.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.json({ success: true, data: categories });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description } = req.body as { name: string; description?: string };
    const cat = await prisma.blogCategory.create({ data: { name, slug: toSlug(name), description } });
    res.status(201).json({ success: true, data: cat });
  } catch (e: any) {
    if (e.code === 'P2002') res.status(409).json({ success: false, error: 'Category already exists' });
    else res.status(500).json({ success: false, error: e.message });
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description } = req.body as { name?: string; description?: string };
    const cat = await prisma.blogCategory.update({
      where: { id: req.params.id },
      data: {
        ...(name        !== undefined && { name, slug: toSlug(name) }),
        ...(description !== undefined && { description }),
      },
    });
    res.json({ success: true, data: cat });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  try {
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
