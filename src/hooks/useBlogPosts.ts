'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogService } from '@/services/blogService';
import toast from 'react-hot-toast';

export const blogKeys = {
  all:      ['blog'] as const,
  posts:    (params?: Record<string, string>) => ['blog', 'posts', params] as const,
  post:     (slug: string) => ['blog', 'post', slug] as const,
  adminPosts: (params?: Record<string, string>) => ['blog', 'adminPosts', params] as const,
  adminPost:  (id: string) => ['blog', 'adminPost', id] as const,
  categories: () => ['blog', 'categories'] as const,
  tags:       () => ['blog', 'tags'] as const,
  media:      (params?: Record<string, string>) => ['blog', 'media', params] as const,
  comments:   (params?: Record<string, string>) => ['blog', 'comments', params] as const,
  sitemap:    () => ['blog', 'sitemap'] as const,
};

export function useBlogPosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: blogKeys.posts(params),
    queryFn:  () => blogService.posts.list(params),
    staleTime: 30 * 1000,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.post(slug),
    queryFn:  () => blogService.posts.get(slug),
    enabled:  !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn:  () => blogService.categories.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: blogKeys.tags(),
    queryFn:  () => blogService.tags.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPosts(params?: Record<string, string>) {
  return useQuery({
    queryKey: blogKeys.adminPosts(params),
    queryFn:  () => blogService.manage.posts.list(params),
  });
}

export function useAdminPost(id: string) {
  return useQuery({
    queryKey: blogKeys.adminPost(id),
    queryFn:  () => blogService.manage.posts.get(id),
    enabled:  !!id,
  });
}

export function useMedia(params?: Record<string, string>) {
  return useQuery({
    queryKey: blogKeys.media(params),
    queryFn:  () => blogService.manage.media.list(params),
  });
}

export function useComments(params?: Record<string, string>) {
  return useQuery({
    queryKey: blogKeys.comments(params),
    queryFn:  () => blogService.manage.comments.list(params),
  });
}

export function useSitemap() {
  return useQuery({
    queryKey: blogKeys.sitemap(),
    queryFn:  () => blogService.sitemap(),
    staleTime: 60 * 1000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => blogService.manage.posts.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Post created');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create post'),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => blogService.manage.posts.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: blogKeys.all });
      toast.success('Post updated');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update post'),
  });
}

export function useTrashPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.manage.posts.trash(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: blogKeys.adminPosts() }); },
    onError: (e: Error) => toast.error(e.message || 'Failed to trash post'),
  });
}

export function useRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.manage.posts.restore(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: blogKeys.adminPosts() }); toast.success('Post restored'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to restore post'),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.manage.posts.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: blogKeys.adminPosts() }); toast.success('Post permanently deleted'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete post'),
  });
}

// ── Versions ──
export function useVersions(postId: string) {
  return useQuery({
    queryKey: ['blog', 'versions', postId],
    queryFn:  () => blogService.manage.versions.list(postId),
    enabled:  !!postId,
  });
}

export function useRestoreVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, versionId }: { postId: string; versionId: string }) =>
      blogService.manage.versions.restore(postId, versionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog'] }); toast.success('Version restored'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to restore version'),
  });
}

// ── Redirects ──
export function useRedirects() {
  return useQuery({
    queryKey: ['blog', 'redirects'],
    queryFn:  () => blogService.manage.redirects.list(),
    staleTime: 60 * 1000,
  });
}

export function useCreateRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => blogService.manage.redirects.create(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog', 'redirects'] }); toast.success('Redirect created'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to create redirect'),
  });
}

export function useUpdateRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      blogService.manage.redirects.update(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog', 'redirects'] }); toast.success('Redirect updated'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to update redirect'),
  });
}

export function useDeleteRedirect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogService.manage.redirects.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blog', 'redirects'] }); toast.success('Redirect deleted'); },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete redirect'),
  });
}

// ── Link Checker ──
export function useAnalyzeLinks() {
  return useMutation({
    mutationFn: () => blogService.manage.linkChecker.analyze(),
    onSuccess: (data) => {
      toast.success(`Link analysis complete: ${data.broken?.length || 0} broken links found`);
    },
    onError: (e: Error) => toast.error(e.message || 'Link analysis failed'),
  });
}

// ── Link Equity ──
export function useLinkEquity() {
  return useQuery({
    queryKey: ['blog', 'seo', 'linkEquity'],
    queryFn:  () => blogService.manage.seo.linkEquity(),
    staleTime: 60 * 1000,
  });
}
