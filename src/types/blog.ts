export type PostStatus = 'Draft' | 'Published' | 'Scheduled' | 'Archived';

export interface BlogAuthor {
  id?: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogComment {
  id: string;
  content: string;
  approved: boolean;
  postId: string;
  authorId?: string | null;
  author?: BlogAuthor | null;
  guestName?: string | null;
  guestEmail?: string | null;
  createdAt: string;
  post?: { title: string; slug: string };
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  coverAlt?: string | null;
  status: PostStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  deletedAt?: string | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  focusKw?: string | null;
  canonicalUrl?: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  seoScore: number;
  viewCount: number;
  schemaOverrides?: SchemaOverrides | null;
  customJsonLd?: string | null;
  authorId?: string;
  author: BlogAuthor;
  categories: Pick<BlogCategory, 'id' | 'name' | 'slug'>[];
  tags: Pick<BlogTag, 'id' | 'name' | 'slug'>[];
  _count?: { comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface BlogMedia {
  id: string;
  url: string;           // Cloudinary secure_url
  cloudinaryId: string;  // Cloudinary public_id (used for deletion)
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  uploadedById: string;
  uploader?: { fullName: string };
  createdAt: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SchemaOverrides {
  enabled: boolean;
  customHeadline?: string;
  customDescription?: string;
  articleSection?: string;
  schemaType?: 'BlogPosting' | 'NewsArticle' | 'TechArticle' | 'Review' | 'HowTo';
  isOverridden?: boolean;
  enableFAQ: boolean;
  faqItems?: FAQItem[];
  enableBreadcrumbs: boolean;
  customJsonLd?: string;
}

export interface SEOFields {
  metaTitle: string;
  metaDesc: string;
  slug: string;
  focusKw: string;
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  internalLinks?: number;
  externalLinks?: number;
  schemaOverrides?: SchemaOverrides;
}

export interface PostDraft {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  seo: SEOFields;
  categoryIds: string[];
  tagIds: string[];
  status: PostStatus;
  scheduledAt: string;
}

export interface BlogPostVersion {
  id: string;
  postId: string;
  version: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  coverAlt: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  focusKw: string | null;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  schemaOverrides?: unknown | null;
  customJsonLd?: string | null;
  categoryIds: string | null;
  tagIds: string | null;
  createdBy: string;
  createdAt: string;
}

export interface BlogRedirect {
  id: string;
  fromSlug: string;
  toSlug: string;
  type: number;
  createdAt: string;
  updatedAt: string;
}

export interface LinkIssue {
  sourcePostId: string;
  sourcePostTitle: string;
  url: string;
  statusCode: number;
  error: string;
}

export interface LinkEquityItem {
  postId: string;
  title: string;
  slug: string;
  internalLinksCount: number;
  externalLinksCount: number;
}
