import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export async function checkRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug;
    if (slug) {
      const redirect = await prisma.blogRedirect.findUnique({ where: { fromSlug: slug } });
      if (redirect) {
        return res.redirect(redirect.type, `/blog/${redirect.toSlug}`);
      }
    }
    next();
  } catch {
    next();
  }
}
