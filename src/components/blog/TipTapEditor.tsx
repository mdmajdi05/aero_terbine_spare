'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import DOMPurify from 'dompurify';
import type { BlogMedia } from '@/types/blog';

// Custom link extension that supports data-internal-link attribute for SEO counting
const CustomLink = LinkExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-internal-link': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-internal-link'),
        renderHTML: (attrs) => {
          if (!attrs['data-internal-link']) return {};
          return { 'data-internal-link': attrs['data-internal-link'] };
        },
      },
    };
  },
});

// Custom image extension with width and alignment support
const ResizableImage = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width'),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      'data-align': {
        default: null,
        parseHTML: (el) => el.getAttribute('data-align'),
        renderHTML: (attrs) => (attrs['data-align'] ? { 'data-align': attrs['data-align'] } : {}),
      },
    };
  },
});

// Module-level hook for slash-command image insert
let openImageDialogFromSlash: (() => void) | null = null;
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import Focus from '@tiptap/extension-focus';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// -- SVG Icons --------------------------------------------------
const I = {
  bold: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>,
  italic: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>,
  underline: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>,
  strike: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>,
  code: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>,
  subscript: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 18h-2v1h3v1h-4v-2c0-.55.45-1 1-1h2v-1h-3v-1h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"/></svg>,
  superscript: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 7h-2v1h3v1h-4V7c0-.55.45-1 1-1h2V5h-3V4h3c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"/></svg>,
  heading: (n: number) => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d={`M${2+(n-1)*2} 4v7h12V4h-2v16h2v-7H4v7h2V4H4z`}/></svg>,
  bulletList: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>,
  orderedList: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>,
  taskList: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM17.99 9l-1.41-1.42-6.59 6.59-2.58-2.57-1.42 1.41 4 3.99z"/></svg>,
  blockquote: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>,
  codeBlock: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>,
  divider: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>,
  undo: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>,
  redo: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.5 8c-4.65 0-8.58 3.03-9.97 7.22l2.37.78c1.05-3.19 4.06-5.5 7.6-5.5 1.96 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6C16.55 8.99 14.15 8 11.5 8z"/></svg>,
  image: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>,
  link: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>,
  internalLink: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>,
  table: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm10 0v4h-4v-4h4zM4 18v-3h4v3H4zm6 0v-3h4v3h-4zm10 0h-4v-3h4v3z"/></svg>,
  alignLeft: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>,
  alignCenter: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>,
  alignRight: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>,
  alignJustify: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg>,
  fullscreen: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>,
  color: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-14c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-6 4c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm6 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-6 4c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm6 0c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/></svg>,
  highlight: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10.54 11l-2.54 2.54L3.41 9l2.54-2.54L10.54 11zm10.41 1.41L14.46 5.8l-7.07 7.07 6.36 6.36 7.07-7.07.13-.13zM1.43 18.16L4.7 14.9l3.04 3.04-3.27 3.27-3.04-3.05z"/></svg>,
  plus: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  removeLink: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M14.39 11L16 12.61V11zM17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.27-.77 2.37-1.87 2.84l1.4 1.4C21.37 15.36 22 13.79 22 12c0-2.76-2.24-5-5-5zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4.01 1.41-1.41L3.41 2.86 2 4.27z"/></svg>,
  externalLink: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>,
  search: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  close: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  addRow: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 13c.55 0 1-.45 1-1s-.45-1-1-1h-1v-1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1zM3 7v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h-2v2H5V7h14v2h2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2z"/></svg>,
  deleteRow: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12zM7 16h4v-2H7v2zm0-4h10v-2H7v2zm0-4h10V6H7v2z"/></svg>,
};

// -- Colors for picker ------------------------------------------
const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
  '#d32f2f', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#1976d2', '#2196f3', '#0288d1', '#0097a7', '#00796b', '#388e3c',
  '#4caf50', '#689f38', '#afb42b', '#fbc02d', '#ffa000', '#f57c00',
  '#e64a19', '#5d4037', '#616161', '#455a64',
];

const HIGHLIGHT_COLORS = [
  '#FFFF00', '#FFD700', '#FFA500', '#FF6B6B', '#FF69B4',
  '#98FB98', '#87CEEB', '#DDA0DD', '#E0E0E0', '#FFFFFF',
];

// -- Slash-command menu items ----------------------------------
interface SlashItem {
  icon: string;
  label: string;
  desc: string;
  category: 'text' | 'block' | 'insert';
  cmd: (e: any) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  { icon: 'H1', label: 'Heading 1', desc: 'Large heading', category: 'text', cmd: (e: any) => e.chain().focus().setHeading({ level: 1 }).run() },
  { icon: 'H2', label: 'Heading 2', desc: 'Medium heading', category: 'text', cmd: (e: any) => e.chain().focus().setHeading({ level: 2 }).run() },
  { icon: 'H3', label: 'Heading 3', desc: 'Small heading', category: 'text', cmd: (e: any) => e.chain().focus().setHeading({ level: 3 }).run() },
  { icon: 'H4', label: 'Heading 4', desc: 'Extra small heading', category: 'text', cmd: (e: any) => e.chain().focus().setHeading({ level: 4 }).run() },
  { icon: '¶', label: 'Paragraph', desc: 'Plain text', category: 'text', cmd: (e: any) => e.chain().focus().setParagraph().run() },
  { icon: '•', label: 'Bullet List', desc: 'Unordered list', category: 'block', cmd: (e: any) => e.chain().focus().toggleBulletList().run() },
  { icon: '1.', label: 'Numbered List', desc: 'Ordered list', category: 'block', cmd: (e: any) => e.chain().focus().toggleOrderedList().run() },
  { icon: '☑', label: 'Task List', desc: 'Checklist', category: 'block', cmd: (e: any) => e.chain().focus().toggleTaskList().run() },
  { icon: '"', label: 'Blockquote', desc: 'Quote block', category: 'block', cmd: (e: any) => e.chain().focus().toggleBlockquote().run() },
  { icon: '<>', label: 'Code Block', desc: 'Code snippet', category: 'block', cmd: (e: any) => e.chain().focus().toggleCodeBlock().run() },
  { icon: '—', label: 'Divider', desc: 'Horizontal rule', category: 'insert', cmd: (e: any) => e.chain().focus().setHorizontalRule().run() },
  { icon: '▦', label: 'Table', desc: 'Insert table', category: 'insert', cmd: (e: any) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { icon: '▶', label: 'YouTube', desc: 'Embed video', category: 'insert', cmd: (e: any) => { const url = window.prompt('YouTube URL:'); if (url) e.chain().focus().setYoutubeVideo({ src: url }).run(); } },
  { icon: '🖼', label: 'Image', desc: 'Insert image', category: 'insert', cmd: () => openImageDialogFromSlash?.() },
];

// -- Slash command Extension -----------------------------------
interface SlashState { open: boolean; query: string; pos: number }

function createSlashPlugin(onUpdate: (s: SlashState) => void) {
  return new Plugin({
    key: new PluginKey('slashCommand'),
    props: {
      handleKeyDown(view, event) {
        if (event.key === 'Escape') { onUpdate({ open: false, query: '', pos: -1 }); }
        return false;
      },
    },
    state: {
      init: () => ({ open: false, query: '', pos: -1 }),
      apply(tr, prev) {
        const meta = tr.getMeta('slashCommand');
        if (meta !== undefined) return meta;
        if (tr.docChanged && prev.open) {
          const text = tr.doc.textBetween(Math.max(0, prev.pos - 1), tr.selection.to, '\n');
          if (text.startsWith('/')) {
            const query = text.slice(1);
            onUpdate({ open: true, query, pos: prev.pos });
            return { open: true, query, pos: prev.pos };
          }
          onUpdate({ open: false, query: '', pos: -1 });
          return { open: false, query: '', pos: -1 };
        }
        return prev;
      },
    },
  });
}

function SlashExtension(onUpdate: (s: SlashState) => void) {
  return Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins: () => [createSlashPlugin(onUpdate)],
    addKeyboardShortcuts() {
      return {
        '/': ({ editor }) => {
          const { state } = editor;
          const pos = state.selection.from;
          const nodeBefore = state.doc.resolve(pos).nodeBefore;
          if (!nodeBefore || nodeBefore.textContent === '') {
            onUpdate({ open: true, query: '', pos });
          }
          return false;
        },
      };
    },
  });
}

// -- Cloudinary image upload helper ---------------------------
async function uploadImageToCloudinary(file: File): Promise<string> {
  const { blogService } = await import('@/services/blogService');
  const res = await blogService.manage.media.upload(file);
  if (!res.success) throw new Error('Image upload failed');
  return res.data.url;
}

// -- Reading time estimator ------------------------------------
function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function wordCount(html: string): number {
  return html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
}

function charCount(html: string): number {
  return html.replace(/<[^>]*>/g, '').length;
}

// -- Props -----------------------------------------------------
interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  draftKey?: string;
  charLimit?: number;
}

// -- Link Editor Popover ---------------------------------------
function LinkEditor({ editor, onClose, initialTab }: { editor: any; onClose: () => void; initialTab?: 'url' | 'internal' }) {
  const linkAttrs = editor.getAttributes('link');
  const existingHref = linkAttrs.href || '';
  const existingIsInternal = linkAttrs['data-internal-link'] === 'true' || existingHref.startsWith('/');
  const [tab, setTab] = useState<'url' | 'internal'>(initialTab ?? (existingIsInternal ? 'internal' : 'url'));
  const [href, setHref] = useState(existingHref);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLink = editor.isActive('link');

  useEffect(() => {
    if (tab === 'internal' && search.length >= 2) {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(async () => {
        setLoading(true);
        try {
          const { blogService } = await import('@/services/blogService');
          const res = await blogService.manage.posts.search(search);
          setResults(res.data);
        } catch { setResults([]); }
        setLoading(false);
      }, 300);
    } else {
      setResults([]);
    }
  }, [search, tab]);

  function apply(h: string) {
    if (!h) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let href = h;
      const isInternal = href.startsWith('/');
      if (!isInternal && !href.startsWith('http://') && !href.startsWith('https://')) {
        href = 'https://' + href;
      }
      editor.chain().focus().extendMarkRange('link').setLink({
        href,
        'data-internal-link': isInternal ? 'true' : null,
      }).run();
    }
    onClose();
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl w-80 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <button onMouseDown={(e) => { e.preventDefault(); setTab('url'); }} className={`flex-1 text-xs font-semibold py-2.5 transition-colors flex items-center justify-center gap-1.5 ${tab === 'url' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>{I.externalLink} External</button>
        <button onMouseDown={(e) => { e.preventDefault(); setTab('internal'); }} className={`flex-1 text-xs font-semibold py-2.5 transition-colors flex items-center justify-center gap-1.5 ${tab === 'internal' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>{I.internalLink} Internal</button>
      </div>
      <div className="p-3 space-y-3">
        {tab === 'url' ? (
          <>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C0C9D5] text-xs font-mono">https://</span>
              <input type="text" value={href.replace(/^https?:\/\//, '')} onChange={(e) => setHref('https://' + e.target.value.replace(/^https?:\/\//, ''))} placeholder="example.com" className="w-full border border-[#E8EDF2] rounded-lg pl-16 pr-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" autoFocus />
            </div>
            <div className="flex gap-2">
              <button onMouseDown={(e) => { e.preventDefault(); apply(href); }} className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium py-1.5 rounded-lg transition-colors">{hasLink ? 'Update' : 'Apply'}</button>
              {hasLink && <button onMouseDown={(e) => { e.preventDefault(); apply(''); }} className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">Remove</button>}
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C0C9D5]">{I.search}</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="w-full border border-[#E8EDF2] rounded-lg pl-9 pr-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" autoFocus />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {loading && <div className="flex items-center justify-center py-3"><div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" /></div>}
              {!loading && results.length === 0 && search.length >= 2 && <p className="text-xs text-[#C0C9D5] text-center py-2">No posts found</p>}
              {!loading && search.length < 2 && <p className="text-xs text-[#C0C9D5] text-center py-3">Type at least 2 characters <br />to search posts</p>}
              {results.map((post) => (
                <button key={post.id} onMouseDown={(e) => { e.preventDefault(); apply(`/blog/${post.slug}`); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F0F4FF] transition-colors group border border-transparent hover:border-[#4F46E5]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-[#4F46E5]">{I.internalLink}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A1628] truncate">{post.title}</p>
                      <p className="text-xs text-[#4F46E5] mt-0.5">/{post.slug}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -- Color Picker ----------------------------------------------
function ColorPicker({ colors, onSelect, onClose, title }: { colors: string[]; onSelect: (c: string) => void; onClose: () => void; title: string }) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xl p-3 w-64" onClick={(e) => e.stopPropagation()}>
      <p className="text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-2.5">{title}</p>
      <div className="grid grid-cols-8 gap-1.5">
        {colors.map((c) => (
          <button key={c} onMouseDown={(e) => { e.preventDefault(); onSelect(c); }} className="w-7 h-7 rounded-lg border border-[#E2E8F0] hover:scale-110 hover:shadow-md transition-all" style={{ backgroundColor: c }} title={c} />
        ))}
      </div>
      <button onMouseDown={(e) => { e.preventDefault(); onClose(); }} className="mt-2.5 w-full text-xs text-[#94A3B8] hover:text-[#475569] py-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors font-medium">Clear</button>
    </div>
  );
}

// -- Toolbar Button --------------------------------------------
function ToolBtn({ active, onClick, children, title, shortcut }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string; shortcut?: string }) {
  return (
    <button type="button" title={shortcut ? `${title} (${shortcut})` : title} onMouseDown={(e) => { e.preventDefault(); onClick(); }} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${active ? 'bg-[#4F46E5] text-white shadow-sm ring-1 ring-[#4F46E5]/30' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`}>
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-[#E2E8F0] mx-1 flex-shrink-0" />;
}

// ── Emoji Picker ──────────────────────────────────────────────
const EMOJIS = [
  ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊'],
  ['😍', '🥰', '😘', '😗', '😙', '😚', '🤗', '🤩'],
  ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌'],
  ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍'],
  ['🔥', '⭐', '✨', '💡', '📌', '🎯', '🚀', '💯'],
  ['🎉', '🎊', '🎈', '🎁', '🏆', '✅', '❌', '💪'],
];

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] p-3 w-72">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.flat().map((emoji) => (
          <button key={emoji} type="button" onClick={() => onSelect(emoji)}
            className="w-7 h-7 flex items-center justify-center hover:bg-[#F1F5F9] rounded-lg text-lg transition-all hover:scale-110">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// -- Component -------------------------------------------------
export default function TipTapEditor({ content, onChange, placeholder = "Start writing, or type '/' for commands…", draftKey, charLimit = 5000 }: Props) {
  const [slash, setSlash] = useState<SlashState>({ open: false, query: '', pos: -1 });
  const [slashIdx, setSlashIdx] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [initialLinkTab, setInitialLinkTab] = useState<'url' | 'internal'>('url');
  const [linkPopoverPos, setLinkPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState<'text' | 'highlight' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogTab, setImageDialogTab] = useState<'upload' | 'url' | 'browse'>('upload');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [mediaList, setMediaList] = useState<BlogMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [imageAltEditing, setImageAltEditing] = useState(false);
  const [imageAltEditValue, setImageAltEditValue] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [splitView, setSplitView] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef(content);

  const handleSlashUpdate = useCallback((s: SlashState) => setSlash(s), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: false,
        underline: false,
      }),
      Placeholder.configure({ placeholder }),
      ResizableImage.configure({ inline: false }),
      CustomLink.configure({ openOnClick: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({ controls: true, modestBranding: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
      CharacterCount,
      Focus.configure({ className: 'has-focus', mode: 'all' }),
      SlashExtension(handleSlashUpdate),
    ],
    content,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      onChange(html);
      if (draftKey) {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => {
          localStorage.setItem(`blog_autosave_${draftKey}`, html);
          setLastSaved(new Date());
        }, 1500);
      }
    },
    editorProps: {
      attributes: { class: 'blog-content min-h-[500px] focus:outline-none p-6', style: 'color: #0A1628' },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
        if (!imageFile) return false;
        event.preventDefault();
        setImageUploading(true);
        uploadImageToCloudinary(imageFile).then((url) => {
          setImagePreviewUrl(url);
          setImageAlt('');
          setImageDialogTab('upload');
          setImageDialogOpen(true);
        }).catch(() => toast.error('Image upload failed. Please try again.'))
          .finally(() => setImageUploading(false));
        return true;
      },
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((i) => i.type.startsWith('image/'));
        if (!imageItem) return false;
        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        setImageUploading(true);
        uploadImageToCloudinary(file).then((url) => {
          setImagePreviewUrl(url);
          setImagePreviewUrl(url);
          setImageAlt('');
          setImageDialogTab('upload');
          setImageDialogOpen(true);
        }).catch(() => toast.error('Image upload failed. Please try again.'))
          .finally(() => setImageUploading(false));
        return true;
      },
    },
    immediatelyRender: false,
  });

  const hasUnsavedChanges = editor ? editor.getHTML() !== initialContentRef.current : false;

  // Close menus when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSlash({ open: false, query: '', pos: -1 });
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-save timer cleanup on unmount
  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, []);

  // Keyboard shortcut help
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable)) return;
        e.preventDefault();
        setShowShortcuts((s) => !s);
      }
      if (e.key === 'Escape') setShowShortcuts(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Warn on unsaved changes beforeunload
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handler);
    } else {
      window.removeEventListener('beforeunload', handler);
    }
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Slash-command image insert hook
  useEffect(() => {
    openImageDialogFromSlash = () => {
      setImageDialogTab('upload');
      setImageAlt('');
      setImagePreviewUrl('');
      setImageDialogOpen(true);
    };
    return () => { openImageDialogFromSlash = null; };
  }, []);

  // Keyboard nav for slash menu
  useEffect(() => {
    if (!slash.open) return;
    function handler(e: KeyboardEvent) {
      const items = filteredItems();
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIdx((i) => Math.min(i + 1, items.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); applySlash(items[slashIdx]); }
      if (e.key === 'Escape') { setSlash({ open: false, query: '', pos: -1 }); }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });

  function filteredItems() {
    return SLASH_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(slash.query.toLowerCase()),
    );
  }

  function applySlash(item: SlashItem) {
    if (!editor) return;
    const from = slash.pos;
    const to = editor.state.selection.to;
    editor.chain().focus().deleteRange({ from: from - 1, to }).run();
    item.cmd(editor);
    setSlash({ open: false, query: '', pos: -1 });
  }

  async function loadMedia() {
    if (mediaList.length > 0) return;
    setMediaLoading(true);
    try {
      const { blogService } = await import('@/services/blogService');
      const res = await blogService.manage.media.list();
      setMediaList(res.data);
    } catch { toast.error('Failed to load media'); }
    finally { setMediaLoading(false); }
  }

  function handleTableAction(action: string) {
    if (!editor) return;
    setShowTableMenu(false);
    switch (action) {
      case 'insert': editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
      case 'addRowBefore': editor.chain().focus().addRowBefore().run(); break;
      case 'addRowAfter': editor.chain().focus().addRowAfter().run(); break;
      case 'addColBefore': editor.chain().focus().addColumnBefore().run(); break;
      case 'addColAfter': editor.chain().focus().addColumnAfter().run(); break;
      case 'deleteRow': editor.chain().focus().deleteRow().run(); break;
      case 'deleteCol': editor.chain().focus().deleteColumn().run(); break;
      case 'toggleHeader': editor.chain().focus().toggleHeaderRow().run(); break;
      case 'deleteTable': editor.chain().focus().deleteTable().run(); break;
    }
  }

  function openLinkPopover(tab: 'url' | 'internal' = 'url') {
    if (!editor) return;
    const from = editor.state.selection.from;
    const coords = editor.view.coordsAtPos(from);
    if (coords) {
      const popoverHeight = 300;
      const popoverWidth = 320;
      let top = coords.bottom + 8;
      if (top + popoverHeight > window.innerHeight) top = coords.top - popoverHeight - 8;
      const left = Math.max(8, Math.min(coords.left - popoverWidth / 2, window.innerWidth - popoverWidth - 8));
      setLinkPopoverPos({ top, left });
    }
    setInitialLinkTab(tab);
    setLinkEditorOpen(true);
  }

  function handleEmojiSelect(emoji: string) {
    editor?.chain().focus().insertContent(emoji).run();
    setShowEmojiPicker(false);
  }

  function insertTOC() {
    if (!editor) return;
    const headings: { level: number; text: string; id: string }[] = [];
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === 'heading' && (node.attrs.level === 2 || node.attrs.level === 3)) {
        const text = node.textContent;
        const id = `toc-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
        headings.push({ level: node.attrs.level, text, id });
      }
    });
    if (headings.length === 0) return;

    const tocHtml = `<nav class="toc"><h3>Table of Contents</h3><ul>${headings.map((h) =>
      `<li style="margin-left:${(h.level - 2) * 1.5}rem"><a href="#${h.id}">${h.text}</a></li>`
    ).join('')}</ul></nav>`;

    editor.chain().focus().insertContent(tocHtml).run();
  }

  const categories = ['text', 'block', 'insert'] as const;
  const catLabels = { text: 'Text', block: 'Blocks', insert: 'Insert' };

  const isInTable = editor?.isActive('table');

  return (
    <div className={`relative border border-[#E8EDF2] rounded-xl overflow-hidden bg-white shadow-sm transition-all ${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* -- Toolbar -------------------------------------------- */}
      <div className="flex flex-wrap items-center gap-0.5 px-4 py-2.5 border-b border-[#E2E8F0] bg-white sticky top-0 z-10 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)]">
        {/* Row 1: Headings + Formatting */}
        {[1, 2, 3, 4].map((n) => (
          <ToolBtn key={`h${n}`} title={`Heading ${n}`} shortcut={`Ctrl+Alt+${n}`} active={editor?.isActive('heading', { level: n })} onClick={() => editor?.chain().focus().toggleHeading({ level: n as 1|2|3|4 }).run()}>
            <span className="text-xs font-bold">{`H${n}`}</span>
          </ToolBtn>
        ))}
        <Divider />
        <ToolBtn title="Bold" shortcut="Ctrl+B" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>{I.bold}</ToolBtn>
        <ToolBtn title="Italic" shortcut="Ctrl+I" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>{I.italic}</ToolBtn>
        <ToolBtn title="Underline" shortcut="Ctrl+U" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>{I.underline}</ToolBtn>
        <ToolBtn title="Strike" shortcut="Ctrl+Shift+S" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>{I.strike}</ToolBtn>
        <ToolBtn title="Code" shortcut="Ctrl+E" active={editor?.isActive('code')} onClick={() => editor?.chain().focus().toggleCode().run()}>{I.code}</ToolBtn>
        <ToolBtn title="Subscript" active={editor?.isActive('subscript')} onClick={() => editor?.chain().focus().toggleSubscript().run()}>{I.subscript}</ToolBtn>
        <ToolBtn title="Superscript" active={editor?.isActive('superscript')} onClick={() => editor?.chain().focus().toggleSuperscript().run()}>{I.superscript}</ToolBtn>
        <Divider />

        {/* Lists */}
        <ToolBtn title="Bullet List" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>{I.bulletList}</ToolBtn>
        <ToolBtn title="Ordered List" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>{I.orderedList}</ToolBtn>
        <ToolBtn title="Task List" active={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()}>{I.taskList}</ToolBtn>
        <ToolBtn title="Blockquote" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>{I.blockquote}</ToolBtn>
        <ToolBtn title="Code Block" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>{I.codeBlock}</ToolBtn>
        <Divider />

        {/* Align */}
        <ToolBtn title="Align Left" active={editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()}>{I.alignLeft}</ToolBtn>
        <ToolBtn title="Align Center" active={editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()}>{I.alignCenter}</ToolBtn>
        <ToolBtn title="Align Right" active={editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()}>{I.alignRight}</ToolBtn>
        <ToolBtn title="Justify" active={editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.chain().focus().setTextAlign('justify').run()}>{I.alignJustify}</ToolBtn>
        <Divider />

        {/* Color & Highlight */}
        <div className="relative">
          <ToolBtn title="Text Color" active={!!colorPickerOpen} onClick={() => setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text')}>{I.color}</ToolBtn>
          {colorPickerOpen === 'text' && (
            <div className="absolute top-full left-0 mt-1 z-50" ref={(r) => { if (r) { r.addEventListener('mousedown', (e) => e.stopPropagation(), { once: true }); } }}>
              <ColorPicker colors={TEXT_COLORS} title="Text Color" onSelect={(c) => { editor?.chain().focus().setColor(c).run(); setColorPickerOpen(null); }} onClose={() => { editor?.chain().focus().unsetColor().run(); setColorPickerOpen(null); }} />
            </div>
          )}
        </div>
        <div className="relative">
          <ToolBtn title="Highlight" active={!!colorPickerOpen} onClick={() => setColorPickerOpen(colorPickerOpen === 'highlight' ? null : 'highlight')}>{I.highlight}</ToolBtn>
          {colorPickerOpen === 'highlight' && (
            <div className="absolute top-full left-0 mt-1 z-50" ref={(r) => { if (r) { r.addEventListener('mousedown', (e) => e.stopPropagation(), { once: true }); } }}>
              <ColorPicker colors={HIGHLIGHT_COLORS} title="Highlight Color" onSelect={(c) => { editor?.chain().focus().setHighlight({ color: c }).run(); setColorPickerOpen(null); }} onClose={() => { editor?.chain().focus().unsetHighlight().run(); setColorPickerOpen(null); }} />
            </div>
          )}
        </div>
        <Divider />

        {/* Insert */}
        <ToolBtn title="Insert Image" onClick={() => { setImageDialogTab('upload'); setImageAlt(''); setImagePreviewUrl(''); setImageDialogOpen(true); if (urlInputRef.current) urlInputRef.current.value = ''; }}>{I.image}</ToolBtn>
        <div className="relative">
          <ToolBtn title="Table" active={isInTable} onClick={() => setShowTableMenu(!showTableMenu)}>{I.table}</ToolBtn>
          {showTableMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl w-48 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {!isInTable ? (
                <button onMouseDown={(e) => { e.preventDefault(); handleTableAction('insert'); }} className="w-full text-left px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors font-medium">Insert Table</button>
              ) : (
                <div className="py-1">
                  {[{ label: 'Add Row Above', action: 'addRowBefore' }, { label: 'Add Row Below', action: 'addRowAfter' }, { label: 'Add Column Before', action: 'addColBefore' }, { label: 'Add Column After', action: 'addColAfter' }, { label: 'Delete Row', action: 'deleteRow' }, { label: 'Delete Column', action: 'deleteCol' }, { label: 'Toggle Header', action: 'toggleHeader' }, { label: 'Delete Table', action: 'deleteTable' }].map(({ label, action }) => (
                    <button key={action} onMouseDown={(e) => { e.preventDefault(); handleTableAction(action); }} className="w-full text-left px-4 py-2 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors">{label}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <ToolBtn title="Link" active={editor?.isActive('link')} onClick={() => openLinkPopover('url')}>{I.link}</ToolBtn>
        <ToolBtn title="YouTube Embed" onClick={() => { const url = window.prompt('YouTube URL:'); if (url && editor) editor.chain().focus().setYoutubeVideo({ src: url }).run(); }}>{I.youtube}</ToolBtn>
        <ToolBtn title="Horizontal Rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>{I.divider}</ToolBtn>
        <div className="relative">
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]" title="Emoji">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>
          {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />}
        </div>
        <button type="button" onClick={insertTOC}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]" title="Table of Contents">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
        <Divider />

        {/* Undo / Redo / Fullscreen */}
        <ToolBtn title="Undo" shortcut="Ctrl+Z" onClick={() => editor?.chain().focus().undo().run()}>{I.undo}</ToolBtn>
        <ToolBtn title="Redo" shortcut="Ctrl+Shift+Z" onClick={() => editor?.chain().focus().redo().run()}>{I.redo}</ToolBtn>
        <ToolBtn title="Fullscreen" shortcut="F11" active={fullscreen} onClick={() => setFullscreen(!fullscreen)}>{I.fullscreen}</ToolBtn>
        <button type="button" onClick={() => setSplitView(!splitView)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-all ${splitView ? 'bg-[#4F46E5] text-white shadow-sm ring-1 ring-[#4F46E5]/30' : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'}`} title="Split View">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
        </button>
        <ToolBtn title="Keyboard Shortcuts" shortcut="?" onClick={() => setShowShortcuts(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
        </ToolBtn>
      </div>

      {/* -- Bubble Menu ----------------------------------------- */}
      {editor && (
        <BubbleMenu editor={editor} options={{ placement: 'top' }}
          shouldShow={({ editor: ed }) => {
            if (ed.isActive('image')) return true;
            return !ed.state.selection.empty;
          }}>
          {editor.isActive('image') ? (
            <div className="flex items-center gap-0.5 bg-[#0F172A] rounded-xl px-2 py-1.5 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-white/60 px-1.5 font-medium">Image</span>
              <span className="w-px h-4 bg-white/20 mx-0.5" />
              {/* Size preset */}
              <select onMouseDown={(e) => e.preventDefault()} value={editor.getAttributes('image').width || ''}
                onChange={(e) => editor.chain().focus().updateAttributes('image', { width: e.target.value || null }).run()}
                className="bg-transparent text-xs text-white/70 border border-white/20 rounded px-1 py-0.5 outline-none cursor-pointer">
                <option value="">Auto</option>
                <option value="25%">25%</option>
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
              </select>
              {/* Alignment */}
              {(['left', 'center', 'right'] as const).map((a) => (
                <button key={a} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { 'data-align': editor.getAttributes('image')['data-align'] === a ? null : a }).run(); }}
                  className={`px-1.5 py-1 rounded text-xs font-medium ${editor.getAttributes('image')['data-align'] === a ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                  {a === 'left' ? '⬅' : a === 'center' ? '⬌' : '➡'}
                </button>
              ))}
              <span className="w-px h-4 bg-white/20 mx-0.5" />
              {/* Alt Text */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); const attrs = editor.getAttributes('image'); setImageAltEditValue(attrs.alt || ''); setImageAltEditing(true); }}
                className="px-2 py-1 rounded text-xs font-medium text-white/70 hover:text-white hover:bg-white/10">
                {I.image} Alt
              </button>
              {imageAltEditing && (
                <div className="flex items-center gap-1 pl-1">
                  <input type="text" value={imageAltEditValue} onChange={(e) => setImageAltEditValue(e.target.value)}
                    placeholder="Alt text…" autoFocus
                    className="w-24 px-2 py-1 rounded text-xs text-[#0A1628] bg-white border-0 outline-none"
                    onKeyDown={(e) => { if (e.key === 'Enter') { editor.chain().focus().updateAttributes('image', { alt: imageAltEditValue || null }).run(); setImageAltEditing(false); } if (e.key === 'Escape') setImageAltEditing(false); }}
                  />
                  <button onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().updateAttributes('image', { alt: imageAltEditValue || null }).run(); setImageAltEditing(false); }}
                    className="px-1.5 py-1 rounded text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#4338CA]">Set</button>
                </div>
              )}
              <span className="w-px h-4 bg-white/20 mx-0.5" />
              {/* Delete */}
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteSelection().run(); }}
                className="px-2 py-1 rounded text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/20">
                Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 bg-[#0F172A] rounded-xl px-2 py-1.5 shadow-2xl border border-white/10">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('bold') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.bold}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('italic') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.italic}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('underline') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.underline}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('strike') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.strike}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('code') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.code}</button>
              <span className="w-px h-5 bg-white/20 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>H2</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>H3</button>
              <span className="w-px h-5 bg-white/20 mx-1" />
              <button type="button" onMouseDown={(e) => { e.preventDefault(); openLinkPopover('url'); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.isActive('link') ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.link}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); openLinkPopover('internal'); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${editor.getAttributes('link')['data-internal-link'] === 'true' ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`} title="Internal Link">{I.internalLink}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setColorPickerOpen(colorPickerOpen === 'text' ? null : 'text'); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${colorPickerOpen === 'text' ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.color}</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setColorPickerOpen(colorPickerOpen === 'highlight' ? null : 'highlight'); }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${colorPickerOpen === 'highlight' ? 'bg-[#4F46E5] text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>{I.highlight}</button>
            </div>
          )}
        </BubbleMenu>
      )}

      {/* -- Link Editor Popover -------------------------------- */}
      {linkEditorOpen && editor && linkPopoverPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setLinkEditorOpen(false); setLinkPopoverPos(null); }} />
          <div className="fixed z-50" style={{ top: linkPopoverPos.top, left: linkPopoverPos.left }}>
            <LinkEditor editor={editor} onClose={() => { setLinkEditorOpen(false); setLinkPopoverPos(null); }} initialTab={initialLinkTab} />
          </div>
        </>
      )}

      {/* -- Editor Area ---------------------------------------- */}
      {splitView ? (
        <div className="flex flex-row">
          <div ref={editorRef} className="flex-1 relative">
            <EditorContent editor={editor} />
          </div>
          <div className="flex-1 border-l border-[#E8EDF2] overflow-y-auto p-4 bg-white">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editor?.getHTML() || '') }} />
          </div>
        </div>
      ) : (
        <div ref={editorRef} className="relative">
          <EditorContent editor={editor} />
        </div>
      )}

      {/* -- Bottom Status Bar ---------------------------------- */}
      {editor && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#E2E8F0] bg-white text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            <span className="font-medium text-[#0F172A]">{wordCount(editor.getHTML())}</span>
            <span>words</span>
            <span className="text-[#CBD5E1]">·</span>
            <span className="font-medium text-[#0F172A]">{charCount(editor.getHTML())}</span>
            <span>chars</span>
            <span className="text-[#CBD5E1]">·</span>
            <span>{estimateReadingTime(editor.getHTML())}</span>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {editor.storage.characterCount && (
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${editor.storage.characterCount.characters() > charLimit ? 'bg-red-500' : editor.storage.characterCount.characters() > charLimit * 0.9 ? 'bg-amber-500' : 'bg-[#4F46E5]'}`}
                    style={{ width: `${Math.min(100, (editor.storage.characterCount.characters() / charLimit) * 100)}%` }} />
                </div>
                <span className={`font-medium ${editor.storage.characterCount.characters() > charLimit ? 'text-red-500' : editor.storage.characterCount.characters() > charLimit * 0.9 ? 'text-amber-500' : 'text-[#0F172A]'}`}>
                  {editor.storage.characterCount.characters()}
                </span>
                <span className="text-[#94A3B8]">/ {charLimit}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Slash Command Menu --------------------------------- */}
      {slash.open && (
        <div ref={menuRef} className="absolute z-50 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl w-80 overflow-hidden" style={{ top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-white">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Commands</p>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {categories.map((cat) => {
              const items = filteredItems().filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="px-4 py-1.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{catLabels[cat]}</p>
                  {items.map((item) => {
                    const globalIdx = filteredItems().indexOf(item);
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applySlash(item); }}
                        onMouseEnter={() => setSlashIdx(globalIdx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${globalIdx === slashIdx ? 'bg-[#4F46E5]/10 text-[#4F46E5]' : 'hover:bg-[#F8FAFC] text-[#0F172A]'}`}
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-xs font-bold flex-shrink-0 ring-1 ring-[#E2E8F0]">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none truncate">{item.label}</p>
                          <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            {filteredItems().length === 0 && <p className="px-4 py-3 text-xs text-[#94A3B8] text-center">No results</p>}
          </div>
        </div>
      )}

      {/* -- Image Dialog ----------------------------------------- */}
      {imageDialogOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => { setImageDialogOpen(false); setImagePreviewUrl(''); }} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">
            <div className="flex border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => setImageDialogTab('upload')}
                className={`flex-1 text-xs font-semibold py-3 transition-colors flex items-center justify-center gap-1.5 ${imageDialogTab === 'upload' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>
                {I.image} Upload
              </button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => setImageDialogTab('url')}
                className={`flex-1 text-xs font-semibold py-3 transition-colors flex items-center justify-center gap-1.5 ${imageDialogTab === 'url' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>
                {I.link} URL
              </button>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setImageDialogTab('browse'); loadMedia(); }}
                className={`flex-1 text-xs font-semibold py-3 transition-colors flex items-center justify-center gap-1.5 ${imageDialogTab === 'browse' ? 'text-[#4F46E5] border-b-2 border-[#4F46E5] bg-white' : 'text-[#94A3B8] hover:text-[#475569]'}`}>
                {I.image} Browse
              </button>
            </div>
            <div className="p-4 space-y-4">
              {imageDialogTab === 'upload' ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-[#E8EDF2] rounded-xl p-6 text-center hover:border-[#4F46E5]/40 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageUploading(true);
                        try { const url = await uploadImageToCloudinary(file); setImagePreviewUrl(url); }
                        catch { toast.error('Image upload failed'); }
                        finally { setImageUploading(false); e.target.value = ''; }
                      }} />
                    {imageUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-[#4A4A6A]">Uploading…</span>
                      </div>
                    ) : imagePreviewUrl ? (
                      <img src={imagePreviewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[#C0C9D5]">{I.image}</span>
                        <span className="text-xs text-[#C0C9D5]">Click to select an image, or drag & drop here</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : imageDialogTab === 'url' ? (
                <div className="space-y-3">
                  <input ref={urlInputRef} type="text" placeholder="https://example.com/image.jpg"
                    onChange={(e) => { const v = e.target.value.trim(); setImageAlt(v); if (v) setImagePreviewUrl(v); else setImagePreviewUrl(''); }}
                    className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
                    autoFocus />
                  {imagePreviewUrl && (
                    <img src={imagePreviewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain bg-[#F8FAFC]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mediaLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : mediaList.length === 0 ? (
                    <p className="text-xs text-[#C0C9D5] text-center py-8">No media found. Upload an image first.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {mediaList.map((m) => (
                        <div key={m.id} onClick={() => { setImagePreviewUrl(m.url); setImageAlt(m.alt || ''); }}
                          className={`cursor-pointer border-2 rounded-lg overflow-hidden hover:border-[#4F46E5] transition-colors ${imagePreviewUrl === m.url ? 'border-[#4F46E5]' : 'border-transparent'}`}>
                          <img src={m.url} alt={m.alt || ''} className="w-full h-16 object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <input type="text" placeholder="Alt text (for accessibility & SEO)…" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-lg px-3 py-2 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />

              <div className="flex gap-2">
                <button onMouseDown={(e) => { e.preventDefault(); if (!editor || !imagePreviewUrl) return; editor.chain().focus().setImage({ src: imagePreviewUrl, alt: imageAlt || undefined }).run(); setImageDialogOpen(false); setImagePreviewUrl(''); setImageAlt(''); }}
                  disabled={!imagePreviewUrl || imageUploading}
                  className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-40">
                  {imageUploading ? 'Uploading…' : 'Insert Image'}
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); setImageDialogOpen(false); setImagePreviewUrl(''); setImageAlt(''); }}
                  className="px-4 border border-[#E8EDF2] text-[#4A4A6A] hover:bg-[#F8FAFC] text-sm font-medium py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* -- Keyboard Shortcuts ------------------------------------ */}
      {showShortcuts && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowShortcuts(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-[#4F46E5]"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="text-[#94A3B8] hover:text-[#475569] p-1 rounded-lg hover:bg-[#F1F5F9] transition-colors">{I.close}</button>
            </div>
            <div className="p-5 space-y-1 max-h-[65vh] overflow-y-auto">
              {[
                { keys: 'Ctrl + B', label: 'Bold' },
                { keys: 'Ctrl + I', label: 'Italic' },
                { keys: 'Ctrl + U', label: 'Underline' },
                { keys: 'Ctrl + Shift + S', label: 'Strikethrough' },
                { keys: 'Ctrl + E', label: 'Inline Code' },
                { keys: 'Ctrl + K', label: 'Insert Link' },
                { keys: 'Ctrl + Z', label: 'Undo' },
                { keys: 'Ctrl + Shift + Z', label: 'Redo' },
                { keys: 'Ctrl + Alt + 1-4', label: 'Heading 1-4' },
                { keys: 'Tab', label: 'Indent list item' },
                { keys: 'Shift + Tab', label: 'Outdent list item' },
                { keys: 'Enter after /', label: 'Open slash commands' },
                { keys: '/', label: 'Insert command menu' },
                { keys: '?', label: 'Show this help' },
                { keys: 'Escape', label: 'Close menus / dialogs' },
                { keys: 'F11', label: 'Toggle fullscreen' },
              ].map((s) => (
                <div key={s.keys} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#F8FAFC] transition-colors">
                  <span className="text-sm text-[#475569]">{s.label}</span>
                  <kbd className="text-xs bg-[#F1F5F9] border border-[#E2E8F0] rounded-md px-2 py-1 text-[#0F172A] font-mono min-w-[80px] text-center">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

