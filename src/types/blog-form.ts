import { z } from 'zod';

export const blogFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  content: z.string(),
  excerpt: z.string().max(500, 'Excerpt must be under 500 characters'),
  coverImage: z.string(),
  coverAlt: z.string(),
  metaTitle: z.string().max(60, 'Meta title should be under 60 characters'),
  metaDesc: z.string().max(160, 'Meta description should be under 160 characters'),
  slug: z.string(),
  focusKw: z.string(),
  canonicalUrl: z.string(),
  robotsIndex: z.boolean(),
  robotsFollow: z.boolean(),
  status: z.enum(['Draft', 'Published', 'Scheduled', 'Archived']),
  scheduledAt: z.string(),
  schemaOverrides: z.any().optional(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;

export const defaultFormValues: BlogFormValues = {
  title: '',
  content: '',
  excerpt: '',
  coverImage: '',
  coverAlt: '',
  metaTitle: '',
  metaDesc: '',
  slug: '',
  focusKw: '',
  canonicalUrl: '',
  robotsIndex: true,
  robotsFollow: true,
  status: 'Draft',
  scheduledAt: '',
  categoryIds: [],
  tagIds: [],
};
