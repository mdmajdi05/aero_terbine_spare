'use client';
import { useEffect, useCallback } from 'react';

interface DraftData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  categoryIds: string[];
  tagIds: string[];
  seo: Record<string, unknown>;
  savedAt: string;
}

const DRAFT_KEY_PREFIX = 'blog_draft_';

export function useDraftAutoSave(postId: string | 'new', data: {
  title: string; content: string; excerpt: string; coverImage: string;
  categoryIds: string[]; tagIds: string[]; seo: Record<string, unknown>;
}) {
  const draftKey = `${DRAFT_KEY_PREFIX}${postId}`;

  // Auto-save every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const draft: DraftData = { ...data, savedAt: new Date().toISOString() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      } catch { /* quota exceeded, ignore */ }
    }, 30000);
    return () => clearInterval(timer);
  }, [draftKey, data.title, data.content, data.excerpt, data.coverImage,
      JSON.stringify(data.categoryIds), JSON.stringify(data.tagIds), JSON.stringify(data.seo)]);

  // Restore draft
  const getDraft = useCallback((): DraftData | null => {
    try {
      const raw = localStorage.getItem(draftKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [draftKey]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
  }, [draftKey]);

  // Check if draft is stale (backend has newer changes)
  const isDraftStale = useCallback((serverUpdatedAt: string): boolean => {
    const draft = getDraft();
    if (!draft) return false;
    return new Date(serverUpdatedAt).getTime() > new Date(draft.savedAt).getTime();
  }, [getDraft]);

  return { getDraft, clearDraft, isDraftStale };
}
