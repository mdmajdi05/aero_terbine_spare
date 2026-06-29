import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock must be hoisted above imports
vi.mock('../../config/database');

import app from '../../app';
import * as db from '../../config/database';

describe('Blog Posts API', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.spyOn(db.prisma.blogPost, 'findMany').mockResolvedValue([]);
    vi.spyOn(db.prisma.blogPost, 'count').mockResolvedValue(0);
    vi.spyOn(db.prisma.blogPost, 'findFirst').mockResolvedValue(null);
    vi.spyOn(db.prisma.blogPost, 'findUnique').mockResolvedValue(null);
    vi.spyOn(db.prisma.blogPost, 'create').mockResolvedValue({} as any);
    vi.spyOn(db.prisma.blogPost, 'update').mockResolvedValue({} as any);
    vi.spyOn(db.prisma.blogPost, 'delete').mockResolvedValue({} as any);
  });

  describe('GET /api/v1/blog/posts', () => {
    it('should return paginated published posts', async () => {
      const now = new Date();
      const mockPosts = [
        { id: '1', title: 'Test Post', slug: 'test-post', status: 'Published' as const,
          excerpt: 'Test excerpt', content: '<p>Hello</p>', coverImage: null, coverAlt: null,
          metaTitle: null, metaDesc: null, focusKw: null,           canonicalUrl: null,
          schemaOverrides: null, customJsonLd: null,
          robotsIndex: true, robotsFollow: true, seoScore: 0, viewCount: 0,
          publishedAt: now, scheduledAt: null, deletedAt: null,
          createdAt: now, updatedAt: now, authorId: 'u1',
          author: { fullName: 'Admin' }, categories: [], tags: [],
          comments: [] },
      ];
      vi.spyOn(db.prisma.blogPost, 'findMany').mockResolvedValue(mockPosts);
      vi.spyOn(db.prisma.blogPost, 'count').mockResolvedValue(1);

      const res = await request(app).get('/api/v1/blog/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Test Post');
      expect(res.body.pagination.total).toBe(1);
    });

    it('should return empty array when no posts', async () => {
      const res = await request(app).get('/api/v1/blog/posts');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/v1/blog/posts/:slug', () => {
    it('should return a single post by slug', async () => {
      const now = new Date();
      const mockPost = { id: '1', title: 'Test Post', slug: 'test-post',
        status: 'Published' as const, excerpt: 'Test excerpt', content: '<p>Hello</p>',
        coverImage: null, coverAlt: null, metaTitle: null, metaDesc: null,
        focusKw: null, canonicalUrl: null,
        schemaOverrides: null, customJsonLd: null,
        robotsIndex: true, robotsFollow: true,
        seoScore: 0, viewCount: 0,
        publishedAt: now, scheduledAt: null, deletedAt: null,
        createdAt: now, updatedAt: now, authorId: 'u1',
        author: { fullName: 'Admin' }, categories: [], tags: [],
        comments: [] };
      vi.spyOn(db.prisma.blogPost, 'findFirst').mockResolvedValue(mockPost);
      vi.spyOn(db.prisma.blogPost, 'update').mockResolvedValue(mockPost);

      const res = await request(app).get('/api/v1/blog/posts/test-post');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Post');
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await request(app).get('/api/v1/blog/posts/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Zod validation', () => {
    it('should reject comment with empty content', async () => {
      const res = await request(app)
        .post('/api/v1/blog/posts/1/comments')
        .send({ content: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject comment with missing body', async () => {
      const res = await request(app)
        .post('/api/v1/blog/posts/1/comments')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown top-level routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Route not found');
    });
  });
});
