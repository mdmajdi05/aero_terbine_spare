import DOMPurify from 'isomorphic-dompurify';
import type { Request, Response, NextFunction } from 'express';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'hr', 'sub', 'sup', 'iframe', 'figure', 'figcaption', 'video', 'source'];
const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'width', 'height', 'target', 'rel', 'data-internal-link', 'controls', 'modestbranding', 'frameborder', 'allowfullscreen', 'allow', 'type', 'start', 'reversed', 'colspan', 'rowspan'];

export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key], {
          ALLOWED_TAGS,
          ALLOWED_ATTR,
        });
      }
    }
  }
  next();
}
