import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional().default(''),
  coverImage: z.string().max(1000).optional().nullable(),
  coverAlt: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(1000).optional().nullable(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  status: z.enum(['Draft', 'Published', 'Scheduled', 'Archived']).optional(),
  scheduledAt: z.string().optional().nullable(),
  metaTitle: z.string().max(150).optional().nullable(),
  metaDesc: z.string().max(300).optional().nullable(),
  focusKw: z.string().max(100).optional().nullable(),
  schemaOverrides: z.any().optional(),
  customJsonLd: z.string().optional().nullable(),
  seoScore: z.number().int().min(0).max(100).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().max(1000).optional().nullable(),
  coverAlt: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().max(1000).optional().nullable(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  status: z.enum(['Draft', 'Published', 'Scheduled', 'Archived']).optional(),
  scheduledAt: z.string().optional().nullable(),
  metaTitle: z.string().max(150).optional().nullable(),
  metaDesc: z.string().max(300).optional().nullable(),
  focusKw: z.string().max(100).optional().nullable(),
  schemaOverrides: z.any().optional(),
  customJsonLd: z.string().optional().nullable(),
  seoScore: z.number().int().min(0).max(100).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  updatedAt: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const submitCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(5000),
  guestName: z.string().max(100).optional(),
  guestEmail: z.string().email().max(200).optional(),
});

export const createRedirectSchema = z.object({
  fromSlug: z.string().min(1).max(200),
  toSlug: z.string().min(1).max(200),
  type: z.coerce.number().int().min(301).max(302).default(301),
});

export const updateRedirectSchema = z.object({
  fromSlug: z.string().min(1).max(200).optional(),
  toSlug: z.string().min(1).max(200).optional(),
  type: z.coerce.number().int().min(301).max(302).optional(),
});
