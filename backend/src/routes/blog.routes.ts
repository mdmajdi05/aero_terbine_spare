import { Router } from 'express';
import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate }         from '../middleware/auth';
import { requireContentManager } from '../middleware/blogRbac';
import { requireRole }           from '../middleware/rbac';
import { blogUpload }            from '../middleware/upload';
import { validate } from '../middleware/validate';
import { sanitizeBody } from '../middleware/sanitize';
import { blogPublicLimiter, blogSearchLimiter } from '../middleware/rateLimiter';
import { createPostSchema, updatePostSchema, createCategorySchema, updateCategorySchema, createTagSchema, updateTagSchema, submitCommentSchema } from '../validators/blog';
import * as postPub   from '../controllers/blog/post.public';
import * as postList  from '../controllers/blog/post.list';
import * as postCrud  from '../controllers/blog/post.crud';
import * as category  from '../controllers/blog/category.controller';
import * as tag       from '../controllers/blog/tag.controller';
import * as media     from '../controllers/blog/media.controller';
import * as comment   from '../controllers/blog/comment.controller';
import * as sitemap   from '../controllers/blog/sitemap.controller';
import * as versionCtrl from '../controllers/blog/version.controller';
import * as redirectCtrl from '../controllers/blog/redirect.controller';
import * as linkCheckerCtrl from '../controllers/blog/linkChecker.controller';
import * as seoCtrl from '../controllers/blog/seo.controller';
import { checkRedirect } from '../middleware/redirect';
import { createRedirectSchema, updateRedirectSchema } from '../validators/blog';

const router = Router();

// ── Public routes (no auth required) ─────────────────────────
router.get('/posts',                blogPublicLimiter as RequestHandler, postPub.listPublicPosts as unknown as RequestHandler);
router.get('/posts/:slug',          blogPublicLimiter as RequestHandler, checkRedirect as unknown as RequestHandler, postPub.getPublicPost as unknown as RequestHandler);
router.get('/categories',           category.listCategories as unknown as RequestHandler);
router.get('/tags',                 tag.listTags as unknown as RequestHandler);
router.get('/sitemap',              sitemap.getSitemapData as unknown as RequestHandler);
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many comments. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.post('/posts/:postId/comments', commentLimiter as RequestHandler, validate(submitCommentSchema) as RequestHandler, comment.submitComment as RequestHandler);

// ── All routes below require authentication ───────────────────
router.use(authenticate as RequestHandler);

// ── Post management (ContentManager, Admin, SuperAdmin) ───────
router.get('/manage/posts',              requireContentManager as RequestHandler, postList.listAdminPosts as unknown as RequestHandler);
router.get('/manage/posts/search',       requireContentManager as RequestHandler, blogSearchLimiter as RequestHandler, postList.searchPostsForLinking as unknown as RequestHandler); // must be before :id
router.get('/manage/posts/:id',          requireContentManager as RequestHandler, postCrud.getAdminPost as unknown as RequestHandler);
router.post('/manage/posts',             requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(createPostSchema) as RequestHandler, postCrud.createPost as unknown as RequestHandler);
router.put('/manage/posts/:id',          requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(updatePostSchema) as RequestHandler, postCrud.updatePost as unknown as RequestHandler);
router.patch('/manage/posts/:id/trash',   requireContentManager as RequestHandler, postCrud.trashPost as unknown as RequestHandler);
router.patch('/manage/posts/:id/restore', requireContentManager as RequestHandler, postCrud.restorePost as unknown as RequestHandler);
// Hard delete — Admin and SuperAdmin only
router.delete('/manage/posts/:id', requireRole('Admin') as RequestHandler, postCrud.deletePost as unknown as RequestHandler);

// ── Categories ────────────────────────────────────────────────
router.post('/categories',       requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(createCategorySchema) as RequestHandler, category.createCategory as unknown as RequestHandler);
router.put('/categories/:id',    requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(updateCategorySchema) as RequestHandler, category.updateCategory as unknown as RequestHandler);
router.delete('/categories/:id', requireContentManager as RequestHandler, category.deleteCategory as unknown as RequestHandler);

// ── Tags ──────────────────────────────────────────────────────
router.post('/tags',       requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(createTagSchema) as RequestHandler, tag.createTag as unknown as RequestHandler);
router.put('/tags/:id',    requireContentManager as RequestHandler, sanitizeBody as RequestHandler, validate(updateTagSchema) as RequestHandler, tag.updateTag as unknown as RequestHandler);
router.delete('/tags/:id', requireContentManager as RequestHandler, tag.deleteTag as unknown as RequestHandler);

// ── Media ─────────────────────────────────────────────────────
router.get('/media',                 requireContentManager as RequestHandler, media.listMedia as unknown as RequestHandler);
router.post('/media/upload',         requireContentManager as RequestHandler, blogUpload.single('file') as RequestHandler, media.uploadMedia as unknown as RequestHandler);
router.delete('/media/:id',          requireContentManager as RequestHandler, media.deleteMedia as unknown as RequestHandler);

// ── Comments moderation ───────────────────────────────────────
router.get('/comments',              requireContentManager as RequestHandler, comment.listComments as unknown as RequestHandler);
router.patch('/comments/:id/approve', requireContentManager as RequestHandler, comment.approveComment as unknown as RequestHandler);
router.delete('/comments/:id',        requireContentManager as RequestHandler, comment.deleteComment as unknown as RequestHandler);

// ── Version History ──────────────────────────────────────────
router.get('/manage/posts/:id/versions',                requireContentManager as RequestHandler, versionCtrl.listVersions as unknown as RequestHandler);
router.get('/manage/posts/:id/versions/:versionId',     requireContentManager as RequestHandler, versionCtrl.getVersion as unknown as RequestHandler);
router.post('/manage/posts/:id/versions/:versionId/restore', requireContentManager as RequestHandler, versionCtrl.restoreVersion as unknown as RequestHandler);

// ── Redirect Management ─────────────────────────────────────
router.get('/manage/redirects',           requireContentManager as RequestHandler, redirectCtrl.listRedirects as unknown as RequestHandler);
router.get('/manage/redirects/:id',       requireContentManager as RequestHandler, redirectCtrl.getRedirect as unknown as RequestHandler);
router.post('/manage/redirects',          requireContentManager as RequestHandler, validate(createRedirectSchema), redirectCtrl.createRedirect as unknown as RequestHandler);
router.put('/manage/redirects/:id',       requireContentManager as RequestHandler, validate(updateRedirectSchema), redirectCtrl.updateRedirect as unknown as RequestHandler);
router.delete('/manage/redirects/:id',    requireContentManager as RequestHandler, redirectCtrl.deleteRedirect as unknown as RequestHandler);

// ── Link Checker ────────────────────────────────────────────
router.post('/manage/analyze-links', requireContentManager as RequestHandler, linkCheckerCtrl.analyzeLinks as unknown as RequestHandler);

// ── SEO Analytics ───────────────────────────────────────────
router.get('/manage/seo/link-equity', requireContentManager as RequestHandler, seoCtrl.getLinkEquity as unknown as RequestHandler);

export default router;
