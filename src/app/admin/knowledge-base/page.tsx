'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, Save, X,
  ChevronDown, Filter,
} from 'lucide-react';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import type { KnowledgeBaseItem, KBCategory } from '@/types/chat';
import { cn } from '@/lib/utils';

const CATEGORIES: KBCategory[] = ['general', 'parts', 'rfq', 'shipping', 'quality', 'contact', 'blog', 'other'];

const CATEGORY_LABELS: Record<KBCategory, string> = {
  general: 'General',
  parts: 'Parts',
  rfq: 'RFQ',
  shipping: 'Shipping',
  quality: 'Quality',
  contact: 'Contact',
  blog: 'Blog',
  other: 'Other',
};

const CATEGORY_COLORS: Record<KBCategory, string> = {
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  parts: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  rfq: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  shipping: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  quality: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  contact: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  blog: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

type EditorState = {
  isOpen: boolean;
  editId: string | null;
  category: KBCategory;
  question: string;
  answer: string;
  keywords: string;
  priority: number;
  isActive: boolean;
};

const EMPTY_EDITOR: EditorState = {
  isOpen: false,
  editId: null,
  category: 'general',
  question: '',
  answer: '',
  keywords: '',
  priority: 5,
  isActive: true,
};

export default function KnowledgeBasePage() {
  const { items, loading, addItem, updateItem, deleteItem } = useKnowledgeBase();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<KBCategory | 'all'>('all');
  const [editor, setEditor] = useState<EditorState>(EMPTY_EDITOR);

  const filtered = items.filter((item) => {
    if (catFilter !== 'all' && item.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => b.priority - a.priority);

  const openAdd = () => {
    setEditor({ ...EMPTY_EDITOR, isOpen: true });
  };

  const openEdit = (item: KnowledgeBaseItem) => {
    setEditor({
      isOpen: true,
      editId: item.id,
      category: item.category,
      question: item.question,
      answer: item.answer,
      keywords: item.keywords.join(', '),
      priority: item.priority,
      isActive: item.isActive,
    });
  };

  const closeEditor = () => setEditor(EMPTY_EDITOR);

  const handleSave = () => {
    if (!editor.question.trim() || !editor.answer.trim()) return;
    const keywords = editor.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const data = {
      category: editor.category,
      question: editor.question.trim(),
      answer: editor.answer.trim(),
      keywords,
      priority: editor.priority,
      isActive: editor.isActive,
    };

    if (editor.editId) {
      updateItem(editor.editId, data);
    } else {
      addItem(data);
    }
    closeEditor();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Knowledge Base
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Q&A entries that the chatbot uses to answer visitor questions.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as KBCategory | 'all')}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No entries yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add your first knowledge base entry to help the chatbot answer questions.
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        CATEGORY_COLORS[item.category],
                      )}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">
                        P{item.priority}
                      </span>
                      {!item.isActive && (
                        <span className="text-[10px] text-red-500 font-medium">Inactive</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.question}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.answer}</p>
                    {item.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.keywords.map((kw, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this entry?')) deleteItem(item.id); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editor.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editor.editId ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <button onClick={closeEditor} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={editor.category}
                  onChange={(e) => setEditor((s) => ({ ...s, category: e.target.value as KBCategory }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
                <input
                  type="text"
                  value={editor.question}
                  onChange={(e) => setEditor((s) => ({ ...s, question: e.target.value }))}
                  placeholder="e.g., How do I request a quote?"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label>
                <textarea
                  value={editor.answer}
                  onChange={(e) => setEditor((s) => ({ ...s, answer: e.target.value }))}
                  placeholder="Write the answer here..."
                  rows={5}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Supports basic formatting. Use **bold** for emphasis.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Keywords <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={editor.keywords}
                  onChange={(e) => setEditor((s) => ({ ...s, keywords: e.target.value }))}
                  placeholder="quote, rfq, how to order, price"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editor.priority}
                    onChange={(e) => setEditor((s) => ({ ...s, priority: Math.min(10, Math.max(1, Number(e.target.value)))}))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <p className="text-xs text-gray-400 mt-1">Higher = matched first</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={editor.isActive}
                      onChange={(e) => setEditor((s) => ({ ...s, isActive: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeEditor}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editor.question.trim() || !editor.answer.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editor.editId ? 'Update' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
