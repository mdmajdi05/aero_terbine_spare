import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import logger from '../../config/logger';

export async function listRedirects(_req: AuthenticatedRequest, res: Response) {
  try {
    const redirects = await prisma.blogRedirect.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: redirects });
  } catch (err) {
    logger.error('Failed to list redirects: ' + err);
    res.status(500).json({ success: false, error: 'Failed to list redirects' });
  }
}

export async function getRedirect(req: AuthenticatedRequest, res: Response) {
  try {
    const redirect = await prisma.blogRedirect.findUnique({ where: { id: req.params.id } });
    if (!redirect) return res.status(404).json({ success: false, error: 'Redirect not found' });
    res.json({ success: true, data: redirect });
  } catch (err) {
    logger.error('Failed to get redirect: ' + err);
    res.status(500).json({ success: false, error: 'Failed to get redirect' });
  }
}

export async function createRedirect(req: AuthenticatedRequest, res: Response) {
  try {
    const { fromSlug, toSlug, type } = req.body;
    const existing = await prisma.blogRedirect.findUnique({ where: { fromSlug } });
    if (existing) return res.status(409).json({ success: false, error: 'A redirect with this fromSlug already exists' });
    const redirect = await prisma.blogRedirect.create({ data: { fromSlug, toSlug, type: type ?? 301 } });
    res.status(201).json({ success: true, data: redirect });
  } catch (err) {
    logger.error('Failed to create redirect: ' + err);
    res.status(500).json({ success: false, error: 'Failed to create redirect' });
  }
}

export async function updateRedirect(req: AuthenticatedRequest, res: Response) {
  try {
    const existing = await prisma.blogRedirect.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Redirect not found' });
    const { fromSlug, toSlug, type } = req.body;
    const data: Record<string, unknown> = {};
    if (fromSlug !== undefined) { data.fromSlug = fromSlug; }
    if (toSlug !== undefined) { data.toSlug = toSlug; }
    if (type !== undefined) { data.type = type; }
    const redirect = await prisma.blogRedirect.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: redirect });
  } catch (err) {
    logger.error('Failed to update redirect: ' + err);
    res.status(500).json({ success: false, error: 'Failed to update redirect' });
  }
}

export async function deleteRedirect(req: AuthenticatedRequest, res: Response) {
  try {
    await prisma.blogRedirect.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    logger.error('Failed to delete redirect: ' + err);
    res.status(500).json({ success: false, error: 'Failed to delete redirect' });
  }
}
