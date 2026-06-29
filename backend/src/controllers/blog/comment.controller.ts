import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../types';
import { prisma } from '../../config/database';

function buildMeta(total: number, page: number, limit: number) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function submitComment(req: Request, res: Response) {
  try {
    const { postId, content, guestName, guestEmail } = req.body as {
      postId: string; content: string; guestName?: string; guestEmail?: string;
    };

    const post = await prisma.blogPost.findFirst({
      where: { id: postId, status: 'Published', deletedAt: null },
    });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

    const authorId = (req as AuthenticatedRequest).user?.sub ?? null;
    const isLoggedIn = !!authorId;

    const comment = await prisma.blogComment.create({
      data: {
        postId,
        content,
        authorId:   isLoggedIn ? authorId : null,
        guestName:  isLoggedIn ? null : (guestName  ?? ''),
        guestEmail: isLoggedIn ? null : (guestEmail ?? ''),
        approved:   false,
      },
    });

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment submitted and awaiting moderation',
    });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function listComments(req: AuthenticatedRequest, res: Response) {
  try {
    const page     = Math.max(1,   Number(req.query.page)   || 1);
    const limit    = Math.min(100, Number(req.query.limit)  || 20);
    const skip     = (page - 1) * limit;
    const approved = req.query.approved as string | undefined;
    const postId   = req.query.postId   as string | undefined;

    const where = {
      ...(approved !== undefined && { approved: approved === 'true' }),
      ...(postId   !== undefined && { postId }),
    };

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { fullName: true, avatarUrl: true } },
          post:   { select: { title: true, slug: true } },
        },
      }),
      prisma.blogComment.count({ where }),
    ]);

    res.json({ success: true, data: comments, pagination: buildMeta(total, page, limit) });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function approveComment(req: AuthenticatedRequest, res: Response) {
  try {
    const comment = await prisma.blogComment.update({
      where: { id: req.params.id },
      data:  { approved: true },
    });
    res.json({ success: true, data: comment });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}

export async function deleteComment(req: AuthenticatedRequest, res: Response) {
  try {
    await prisma.blogComment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
}
