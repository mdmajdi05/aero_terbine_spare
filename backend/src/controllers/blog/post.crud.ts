import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';
import { PostStatus, Prisma } from '@prisma/client';
import logger from '../../config/logger';
import { blogEvents, BlogEventTypes } from '../../config/events';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Admin / Content Manager — CRUD ────────────────────────────

export async function getAdminPost(req: AuthenticatedRequest, res: Response) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: {
        author:     { select: { id: true, fullName: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags:       { select: { id: true, name: true, slug: true } },
      },
    });
    if (!post) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: post });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title, content, excerpt, coverImage, coverAlt,
      canonicalUrl, robotsIndex, robotsFollow,
      status, scheduledAt,
      metaTitle, metaDesc, focusKw, seoScore,
      schemaOverrides, customJsonLd,
      categoryIds, tagIds,
    } = req.body as {
      title: string; content: string; excerpt?: string; coverImage?: string; coverAlt?: string;
      canonicalUrl?: string; robotsIndex?: boolean; robotsFollow?: boolean;
      status?: PostStatus; scheduledAt?: string;
      metaTitle?: string; metaDesc?: string; focusKw?: string; seoScore?: number;
      schemaOverrides?: any; customJsonLd?: string;
      categoryIds?: string[]; tagIds?: string[];
    };

    const resolvedStatus = status ?? PostStatus.Draft;
    const slug = toSlug(title);

    const post = await prisma.blogPost.create({
      data: {
        title, slug, content,
        excerpt:    excerpt    ?? '',
        coverImage: coverImage ?? null,
        coverAlt:   coverAlt   ?? null,
        canonicalUrl: canonicalUrl ?? null,
        robotsIndex:  robotsIndex  ?? true,
        robotsFollow: robotsFollow ?? true,
        status:     resolvedStatus,
        publishedAt: resolvedStatus === PostStatus.Published ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        metaTitle:  metaTitle  ?? null,
        metaDesc:   metaDesc   ?? null,
        focusKw:    focusKw    ?? null,
        schemaOverrides: schemaOverrides ?? Prisma.JsonNull,
        customJsonLd:   customJsonLd   ?? null,
        seoScore:   seoScore   ?? 0,
        authorId:   req.user.sub,
        categories: categoryIds?.length ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
        tags:       tagIds?.length       ? { connect: tagIds.map((id) => ({ id })) }      : undefined,
      },
    });

    if (resolvedStatus === PostStatus.Published) {
      blogEvents.emit(BlogEventTypes.POST_PUBLISHED, { postId: post.id, slug: post.slug, title: post.title });
    }

    res.status(201).json({ success: true, data: post });
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(409).json({ success: false, error: 'A post with that slug already exists' });
    } else {
      res.status(500).json({ success: false, error: e.message });
    }
  }
}

export async function updatePost(req: AuthenticatedRequest, res: Response) {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Not found' });

    const {
      title, content, excerpt, coverImage, coverAlt,
      canonicalUrl, robotsIndex, robotsFollow,
      status, scheduledAt,
      metaTitle, metaDesc, focusKw, seoScore,
      schemaOverrides, customJsonLd,
      categoryIds, tagIds,
      updatedAt,
    } = req.body as {
      title?: string; content?: string; excerpt?: string; coverImage?: string; coverAlt?: string;
      canonicalUrl?: string; robotsIndex?: boolean; robotsFollow?: boolean;
      status?: PostStatus; scheduledAt?: string;
      metaTitle?: string; metaDesc?: string; focusKw?: string; seoScore?: number;
      schemaOverrides?: any; customJsonLd?: string;
      categoryIds?: string[]; tagIds?: string[];
      updatedAt?: string;
    };

    if (updatedAt && new Date(existing.updatedAt).getTime() > new Date(updatedAt).getTime()) {
      return res.status(409).json({ success: false, error: 'This post was updated by someone else. Please refresh and try again.', serverUpdatedAt: existing.updatedAt });
    }

    // Auto-create version snapshot before update
    const currentPost = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (currentPost) {
      const maxVersion = await prisma.blogPostVersion.findFirst({
        where: { postId: req.params.id },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      await prisma.blogPostVersion.create({
        data: {
          postId: currentPost.id,
          version: (maxVersion?.version ?? 0) + 1,
          title: currentPost.title,
          slug: currentPost.slug,
          content: currentPost.content,
          excerpt: currentPost.excerpt,
          coverImage: currentPost.coverImage,
          coverAlt: currentPost.coverAlt,
          metaTitle: currentPost.metaTitle,
          metaDesc: currentPost.metaDesc,
          focusKw: currentPost.focusKw,
          canonicalUrl: currentPost.canonicalUrl,
          robotsIndex: currentPost.robotsIndex,
          robotsFollow: currentPost.robotsFollow,
          schemaOverrides: currentPost.schemaOverrides as any,
          customJsonLd: currentPost.customJsonLd,
          createdBy: req.user?.sub ?? 'system',
        },
      });
    }

    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: {
        ...(title       !== undefined && { title, slug: toSlug(title) }),
        ...(content     !== undefined && { content }),
        ...(excerpt     !== undefined && { excerpt }),
        ...(coverImage  !== undefined && { coverImage }),
        ...(coverAlt    !== undefined && { coverAlt }),
        ...(metaTitle   !== undefined && { metaTitle }),
        ...(metaDesc    !== undefined && { metaDesc }),
        ...(focusKw      !== undefined && { focusKw }),
        ...(seoScore     !== undefined && { seoScore }),
        ...(schemaOverrides !== undefined && { schemaOverrides }),
        ...(customJsonLd !== undefined && { customJsonLd }),
        ...(canonicalUrl !== undefined && { canonicalUrl }),
        ...(robotsIndex  !== undefined && { robotsIndex }),
        ...(robotsFollow !== undefined && { robotsFollow }),
        ...(status      !== undefined && {
          status,
          publishedAt: status === PostStatus.Published && !existing.publishedAt ? new Date() : existing.publishedAt,
        }),
        ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
        ...(categoryIds !== undefined && { categories: { set: categoryIds.map((id) => ({ id })) } }),
        ...(tagIds      !== undefined && { tags:       { set: tagIds.map((id) => ({ id })) } }),
      },
    });

    const prevStatus = existing.status;
    const newStatus = status ?? prevStatus;

    if (prevStatus !== PostStatus.Published && newStatus === PostStatus.Published) {
      blogEvents.emit(BlogEventTypes.POST_PUBLISHED, { postId: post.id, slug: post.slug, title: post.title });
    } else if (prevStatus !== newStatus || title !== undefined || content !== undefined) {
      blogEvents.emit(BlogEventTypes.POST_UPDATED, { postId: post.id, slug: post.slug, title: post.title ?? existing.title });
    }

    res.json({ success: true, data: post });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function trashPost(req: AuthenticatedRequest, res: Response) {
  try {
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    blogEvents.emit(BlogEventTypes.POST_TRASHED, { postId: post.id, slug: post.slug, title: post.title });
    res.json({ success: true, message: 'Post moved to trash' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function restorePost(req: AuthenticatedRequest, res: Response) {
  try {
    const post = await prisma.blogPost.update({ where: { id: req.params.id }, data: { deletedAt: null } });
    blogEvents.emit(BlogEventTypes.POST_RESTORED, { postId: post.id, slug: post.slug, title: post.title });
    res.json({ success: true, message: 'Post restored' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deletePost(req: AuthenticatedRequest, res: Response) {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    if (post) {
      blogEvents.emit(BlogEventTypes.POST_DELETED, { postId: post.id, slug: post.slug, title: post.title });
    }
    res.json({ success: true, message: 'Post permanently deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
