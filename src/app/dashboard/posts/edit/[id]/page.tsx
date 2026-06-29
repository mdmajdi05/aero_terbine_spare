'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Controller, useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SafeImage from '@/components/blog/SafeImage';
import toast from 'react-hot-toast';
import SEOSidebar from '@/components/blog/SEOSidebar';
import SchemaOverridePanel from '@/components/blog/SchemaOverridePanel';
import { blogService } from '@/services/blogService';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import type { BlogCategory, BlogTag, BlogPost, PostStatus } from '@/types/blog';
import { blogFormSchema, type BlogFormValues } from '@/types/blog-form';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave';
import { useAdminPost, useCategories, useTags, useUpdatePost } from '@/hooks/useBlogPosts';
import DOMPurify from 'dompurify';

const TipTapEditor = dynamic(() => import('@/components/blog/TipTapEditor'), { ssr: false });

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [savingState,    setSavingState]    = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [coverUploading, setCoverUploading] = useState(false);
  const [seoScore,       setSeoScore]       = useState(0);
  const [catSearch,   setCatSearch]   = useState('');
  const [tagSearch,   setTagSearch]   = useState('');
  const [newCatName,  setNewCatName]  = useState('');
  const [newTagName,  setNewTagName]  = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [localCategories, setLocalCategories] = useState<BlogCategory[]>([]);
  const [localTags, setLocalTags] = useState<BlogTag[]>([]);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
  });

  const { data: postRes, isLoading: postLoading } = useAdminPost(id);
  const { data: catsRes } = useCategories();
  const { data: tagsRes } = useTags();
  const remoteCategories = catsRes?.data ?? [];
  const remoteTags = tagsRes?.data ?? [];
  const categories = [...remoteCategories, ...localCategories];
  const tags = [...remoteTags, ...localTags];
  const updatePost = useUpdatePost();

  const title = form.watch('title');
  const content = form.watch('content');
  const excerpt = form.watch('excerpt');
  const coverImage = form.watch('coverImage');
  const coverAlt = form.watch('coverAlt');
  const status = form.watch('status');
  const scheduledAt = form.watch('scheduledAt');
  const categoryIds = form.watch('categoryIds');
  const tagIds = form.watch('tagIds');
  const slug = form.watch('slug');

  const draftData = useMemo(() => ({
    title, content, excerpt, coverImage,
    categoryIds, tagIds,
    seo: { metaTitle: form.watch('metaTitle'), metaDesc: form.watch('metaDesc'), slug: form.watch('slug'), focusKw: form.watch('focusKw'), canonicalUrl: form.watch('canonicalUrl'), robotsIndex: form.watch('robotsIndex'), robotsFollow: form.watch('robotsFollow') } as unknown as Record<string, unknown>,
  }), [title, content, excerpt, coverImage, JSON.stringify(categoryIds), JSON.stringify(tagIds)]);

  const { getDraft, clearDraft, isDraftStale } = useDraftAutoSave(id, draftData);
  const [draftBanner, setDraftBanner] = useState<{ type: 'stale' } | null>(null);

  const filteredCategories = useMemo(() => categories.filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase())), [categories, catSearch]);
  const filteredTags = useMemo(() => tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase())), [tags, tagSearch]);

  const catNewSlug = useMemo(() => toSlug(newCatName), [newCatName]);
  const tagNewSlug = useMemo(() => toSlug(newTagName), [newTagName]);
  const catExistingDuplicate = useMemo(() => categories.find((c) => toSlug(c.name) === catNewSlug), [categories, catNewSlug]);
  const tagExistingDuplicate = useMemo(() => tags.find((t) => toSlug(t.name) === tagNewSlug), [tags, tagNewSlug]);
  const catQuickMatches = useMemo(() => newCatName.trim() ? categories.filter((c) => c.name.toLowerCase().includes(newCatName.toLowerCase())) : [], [categories, newCatName]);
  const tagQuickMatches = useMemo(() => newTagName.trim() ? tags.filter((t) => t.name.toLowerCase().includes(newTagName.toLowerCase())) : [], [tags, newTagName]);

  useEffect(() => {
    if (!postRes?.data) return;
    const p = postRes.data;
    setPost(p);
    form.reset({
      title: p.title,
      content: p.content,
      excerpt: p.excerpt ?? '',
      coverImage: p.coverImage ?? '',
      coverAlt: p.coverAlt ?? '',
      status: p.status,
      scheduledAt: p.scheduledAt ? p.scheduledAt.slice(0, 16) : '',
      categoryIds: p.categories.map((x) => x.id),
      tagIds: p.tags.map((x) => x.id),
      metaTitle: p.metaTitle ?? '',
      metaDesc: p.metaDesc ?? '',
      slug: p.slug,
      focusKw: p.focusKw ?? '',
      canonicalUrl: p.canonicalUrl ?? '',
      robotsIndex: p.robotsIndex,
      robotsFollow: p.robotsFollow,
      schemaOverrides: p.schemaOverrides ?? undefined,
    });

    const draft = getDraft();
    if (draft) {
      if (isDraftStale(p.updatedAt)) {
        setDraftBanner({ type: 'stale' });
      } else {
        form.setValue('title', draft.title);
        form.setValue('content', draft.content);
        form.setValue('excerpt', draft.excerpt);
        form.setValue('coverImage', draft.coverImage);
        form.setValue('categoryIds', draft.categoryIds);
        form.setValue('tagIds', draft.tagIds);
      }
    }
  }, [postRes]);

  const hasUnsavedChanges = title !== post?.title || content !== post?.content || excerpt !== post?.excerpt || coverImage !== post?.coverImage;
  useUnsavedChanges(hasUnsavedChanges);

  const handleSave = useCallback(async () => {
    const valid = await form.trigger();
    if (!valid) { toast.error('Please fix form errors'); return; }
    const values = form.getValues();
    if (!values.title.trim()) { toast.error('Title is required'); return; }
    const cleanContent = DOMPurify.sanitize(values.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'hr', 'sub', 'sup', 'iframe', 'figure', 'figcaption', 'video', 'source'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style', 'width', 'height', 'target', 'rel', 'data-internal-link', 'controls', 'modestbranding', 'frameborder', 'allowfullscreen', 'allow', 'type', 'start', 'reversed', 'colspan', 'rowspan'],
    });
    setSaving(true);
    setSavingState('saving');
    try {
      await updatePost.mutateAsync({ id, body: {
        title: values.title, content: cleanContent, excerpt: values.excerpt, coverImage: values.coverImage, coverAlt: values.coverAlt, status: values.status,
        scheduledAt: values.status === 'Scheduled' ? values.scheduledAt : undefined,
        metaTitle: values.metaTitle, metaDesc: values.metaDesc,
        focusKw: values.focusKw,
        canonicalUrl: values.canonicalUrl || undefined,
        robotsIndex: values.robotsIndex,
        robotsFollow: values.robotsFollow,
        schemaOverrides: values.schemaOverrides,
        seoScore,
        categoryIds: values.categoryIds, tagIds: values.tagIds,
      } as Record<string, unknown> });
      clearDraft();
      setSavingState('saved');
      setTimeout(() => setSavingState('idle'), 3000);
      toast.success('Post updated!');
    } catch (e: any) {
      setSavingState('error');
      toast.error(e.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  }, [form, seoScore, id]);

  function toggleId(arr: string[], setArr: (v: string[]) => void, idVal: string) {
    setArr(arr.includes(idVal) ? arr.filter((x) => x !== idVal) : [...arr, idVal]);
  }

  async function createCategory() {
    const name = newCatName.trim();
    if (!name) { toast.error('Category name is required'); return; }
    if (catExistingDuplicate) { toast.error(`"${catExistingDuplicate.name}" already exists`); setNewCatName(''); return; }
    setCreatingCat(true);
    try {
      const res = await blogService.manage.categories.create({ name, description: '' });
      const created = res.data;
      setLocalCategories((prev) => [...prev, created]);
      form.setValue('categoryIds', [...form.getValues('categoryIds'), created.id]);
      setNewCatName('');
      toast.success(`Category "${created.name}" created`);
    } catch (e: any) { toast.error(e.message ?? 'Failed to create category'); }
    finally { setCreatingCat(false); }
  }

  async function createTag() {
    const name = newTagName.trim();
    if (!name) { toast.error('Tag name is required'); return; }
    if (tagExistingDuplicate) { toast.error(`"${tagExistingDuplicate.name}" already exists`); setNewTagName(''); return; }
    setCreatingTag(true);
    try {
      const res = await blogService.manage.tags.create({ name });
      const created = res.data;
      setLocalTags((prev) => [...prev, created]);
      form.setValue('tagIds', [...form.getValues('tagIds'), created.id]);
      setNewTagName('');
      toast.success(`Tag "${created.name}" created`);
    } catch (e: any) { toast.error(e.message ?? 'Failed to create tag'); }
    finally { setCreatingTag(false); }
  }

  if (postLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-[#4A4A6A]">Loading post…</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center">
        <div className="text-red-500">Post not found.</div>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="flex-1 bg-[#F0F4F8] flex flex-col min-h-0">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E8EDF2] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/posts" className="text-[#4A4A6A] hover:text-[#0A1628] text-sm">← Posts</Link>
          <span className="text-[#E8EDF2]">/</span>
          <span className="text-sm text-[#0A1628] font-medium truncate max-w-xs">{post.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {savingState === 'saving' && (
            <span className="text-xs text-[#4F46E5] flex items-center gap-1">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Saving…
            </span>
          )}
          {savingState === 'saved' && <span className="text-xs text-green-600">✓ Saved</span>}
          {savingState === 'error' && <span className="text-xs text-red-500">✕ Save failed</span>}
          <span className="text-[10px] text-[#C0C9D5]">Draft auto-saved</span>
          <Link href={`/blog/${post.slug}`} target="_blank"
            className="border border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5] hover:text-[#4F46E5] font-medium text-sm px-4 py-2 rounded-lg transition-colors">
            View Live
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>

      {/* Draft banner */}
      {draftBanner && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex-shrink-0">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-amber-800">This post was updated on the server after your draft</span>
            <div className="flex gap-2">
              <button onClick={() => { const d = getDraft(); if (d) { form.setValue('title', d.title); form.setValue('content', d.content); form.setValue('excerpt', d.excerpt); form.setValue('coverImage', d.coverImage); form.setValue('categoryIds', d.categoryIds); form.setValue('tagIds', d.tagIds); setDraftBanner(null); } }}
                className="text-amber-700 font-semibold hover:underline">Use my draft</button>
              <button onClick={() => { clearDraft(); setDraftBanner(null); }}
                className="text-amber-600 hover:underline">Reload from server</button>
            </div>
          </div>
        </div>
      )}

      {/* Editor + Sidebar */}
      <div className="max-w-7xl mx-auto w-full px-4 pb-4 flex-1 flex flex-col lg:flex-row gap-6 min-h-0 pt-4">
        {/* Editor */}
        <div className="flex-1 space-y-4 overflow-y-auto min-h-0 max-h-full lg:self-start">
          <Controller
            name="title"
            control={form.control}
            render={({ field }) => (
              <>
                <input type="text" placeholder="Post title…" {...field} onChange={(e) => {
                  field.onChange(e);
                  form.setValue('slug', toSlug(e.target.value));
                }}
                  className="w-full text-3xl font-bold text-[#0A1628] placeholder:text-[#C0C9D5] border-0 outline-none bg-transparent p-0"
                />
                <p className="text-[11px] text-[#C0C9D5] mt-1">{field.value.length}/200 chars</p>
              </>
            )}
          />

          <Controller
            name="excerpt"
            control={form.control}
            render={({ field }) => (
              <>
                <textarea rows={2} placeholder="Short excerpt…" {...field}
                  className="w-full text-[#0A1628] text-base placeholder:text-[#C0C9D5] border-0 outline-none bg-transparent resize-none p-0"
                />
                <p className="text-[11px] text-[#C0C9D5] mt-1">{field.value.length}/500 chars</p>
              </>
            )}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Controller
                name="coverImage"
                control={form.control}
                render={({ field }) => (
                  <input type="text" placeholder="Cover image URL…" {...field}
                    className="flex-1 border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                  />
                )}
              />
              <button type="button" disabled={coverUploading} onClick={() => coverInputRef.current?.click()}
                className="border border-[#E8EDF2] hover:border-[#4F46E5] text-[#4A4A6A] hover:text-[#4F46E5] text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap">
                {coverUploading ? 'Uploading…' : '↑ Upload'}
              </button>
              <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setCoverUploading(true);
                  try { const res = await blogService.manage.media.upload(file); if (res.success) form.setValue('coverImage', res.data.url); }
                  catch { toast.error('Cover upload failed'); }
                  finally { setCoverUploading(false); e.target.value = ''; }
                }}
              />
            </div>
            {coverImage && (
              <>
                <div className="relative h-32 rounded-xl overflow-hidden bg-[#F0F4F8] border border-[#E8EDF2]">
                  <SafeImage src={coverImage} alt={coverAlt || 'Cover preview'} fill className="object-cover" unoptimized />
                </div>
                <Controller
                  name="coverAlt"
                  control={form.control}
                  render={({ field }) => (
                    <input type="text" placeholder="Cover image alt text…" {...field}
                      className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
                  )}
                />
              </>
            )}
          </div>

          <Controller
            name="content"
            control={form.control}
            render={({ field }) => (
              <TipTapEditor content={field.value} onChange={field.onChange} draftKey={id} />
            )}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-3 lg:sticky lg:top-[5rem] lg:self-start lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:overflow-x-hidden min-h-0 overflow-y-auto">
          <CollapsibleSection id="edit-publish" title="Publish" defaultOpen={true}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#4A4A6A] mb-1 block">Status</label>
                <select value={status} onChange={(e) => form.setValue('status', e.target.value as PostStatus)}
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              {status === 'Scheduled' && (
                <div>
                  <label className="text-xs text-[#4A4A6A] mb-1 block">Schedule Date &amp; Time</label>
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => form.setValue('scheduledAt', e.target.value)}
                    className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
                </div>
              )}
              <button onClick={handleSave} disabled={saving}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Update Post'}
              </button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection id="edit-categories" title="Categories" count={categoryIds.length}>
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C0C9D5]"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>
                <input type="text" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} placeholder="Filter categories..." className="w-full border border-[#E8EDF2] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {(newCatName.trim() ? catQuickMatches : filteredCategories).map((c) => {
                  const isMatch = newCatName.trim() && c.name.toLowerCase().includes(newCatName.toLowerCase());
                  return (
                    <label key={c.id} className={`flex items-center gap-2.5 cursor-pointer group px-1 py-1 rounded-lg transition-colors ${isMatch ? 'bg-[#EEF2FF] ring-1 ring-[#4F46E5]/30' : 'hover:bg-[#F8FAFC]'}`}>
                      <input type="checkbox" checked={categoryIds.includes(c.id)}
                        onChange={() => { toggleId(categoryIds, (arr) => form.setValue('categoryIds', arr), c.id); if (isMatch) setNewCatName(''); }} className="accent-[#4F46E5] w-3.5 h-3.5" />
                      <span className="text-sm text-[#4A4A6A] group-hover:text-[#0A1628] transition-colors">{c.name}</span>
                    </label>
                  );
                })}
                {filteredCategories.length === 0 && !catSearch && !newCatName && <p className="text-xs text-[#C0C9D5] text-center py-2">No categories yet. Create one below.</p>}
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-[#E8EDF2]">
                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name..."
                  className="flex-1 border border-[#E8EDF2] rounded-lg px-2 py-1 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !creatingCat && !catExistingDuplicate) createCategory(); }} />
                <button onClick={createCategory} disabled={creatingCat || !newCatName.trim() || !!catExistingDuplicate}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-30 whitespace-nowrap">
                  {creatingCat ? '…' : catExistingDuplicate ? 'Exists' : '+ Add'}
                </button>
              </div>
              {catExistingDuplicate && (
                <p className="text-[10px] text-red-500 text-center">"{catExistingDuplicate.name}" already exists — tick it above</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection id="edit-tags" title="Tags" count={tagIds.length}>
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#C0C9D5]"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></span>
                <input type="text" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} placeholder="Filter tags..." className="w-full border border-[#E8EDF2] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {(newTagName.trim() ? tagQuickMatches : filteredTags).map((t) => {
                  const isMatch = newTagName.trim() && t.name.toLowerCase().includes(newTagName.toLowerCase());
                  return (
                    <button key={t.id} type="button" onClick={() => { toggleId(tagIds, (arr) => form.setValue('tagIds', arr), t.id); if (isMatch) setNewTagName(''); }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${tagIds.includes(t.id) ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm' : 'border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5] hover:text-[#4F46E5]'} ${isMatch ? 'ring-2 ring-[#4F46E5]/40 bg-[#EEF2FF]' : ''}`}>
                      {t.name}
                    </button>
                  );
                })}
                {filteredTags.length === 0 && !tagSearch && !newTagName && <p className="text-xs text-[#C0C9D5] text-center py-2 w-full">No tags yet. Create one below.</p>}
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t border-[#E8EDF2]">
                <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name..."
                  className="flex-1 border border-[#E8EDF2] rounded-lg px-2 py-1 text-xs text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !creatingTag && !tagExistingDuplicate) createTag(); }} />
                <button onClick={createTag} disabled={creatingTag || !newTagName.trim() || !!tagExistingDuplicate}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-medium px-2.5 py-1 rounded-lg transition-colors disabled:opacity-30 whitespace-nowrap">
                  {creatingTag ? '…' : tagExistingDuplicate ? 'Exists' : '+ Add'}
                </button>
              </div>
              {tagExistingDuplicate && (
                <p className="text-[10px] text-red-500 text-center">"{tagExistingDuplicate.name}" already exists — select it above</p>
              )}
            </div>
          </CollapsibleSection>

          <SEOSidebar content={content} coverImage={coverImage} onScoreChange={setSeoScore} />

          <SchemaOverridePanel
            seo={{ metaTitle: form.watch('metaTitle'), metaDesc: form.watch('metaDesc'), slug: form.watch('slug'), focusKw: form.watch('focusKw'), canonicalUrl: form.watch('canonicalUrl'), robotsIndex: form.watch('robotsIndex'), robotsFollow: form.watch('robotsFollow') }}
            content={content}
            coverImage={coverImage}
            title={title}
            excerpt={excerpt}
            postSlug={slug}
            author={post?.author?.fullName || ''}
            date={post?.publishedAt || ''}
            onChange={(next) => {
              form.setValue('metaTitle', next.metaTitle);
              form.setValue('metaDesc', next.metaDesc);
              form.setValue('slug', next.slug);
              form.setValue('focusKw', next.focusKw);
              form.setValue('canonicalUrl', next.canonicalUrl ?? '');
              form.setValue('robotsIndex', next.robotsIndex ?? true);
              form.setValue('robotsFollow', next.robotsFollow ?? true);
              form.setValue('schemaOverrides', next.schemaOverrides);
            }}
          />
        </div>
      </div>
    </div>
    </FormProvider>
  );
}
