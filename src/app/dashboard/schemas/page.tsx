'use client';

import { useState, useEffect } from 'react';
import { schemaService, type PageSchema } from '@/services/schemaService';
import toast from 'react-hot-toast';
import { Trash2, Plus, Loader2 } from 'lucide-react';

export default function SchemaManagerPage() {
  const [schemas, setSchemas] = useState<PageSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageSchema | null>(null);
  const [label, setLabel] = useState('');
  const [schemaJson, setSchemaJson] = useState('');
  const [faqItems, setFaqItems] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const resp = await schemaService.list();
      setSchemas(resp.data);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditing(null);
    setLabel('');
    setSchemaJson('');
    setFaqItems('');
  }

  function openEdit(s: PageSchema) {
    setEditing(s);
    setLabel(s.label);
    setSchemaJson(s.schemaJson ? JSON.stringify(s.schemaJson, null, 2) : '');
    setFaqItems(s.faqItems ? JSON.stringify(s.faqItems, null, 2) : '');
  }

  async function handleSave() {
    const pageKey = editing?.pageKey || label.toLowerCase().replace(/\s+/g, '-');
    let parsedSchema: unknown = null;
    let parsedFaq: unknown = null;
    try {
      if (schemaJson.trim()) parsedSchema = JSON.parse(schemaJson);
    } catch { toast.error('Invalid JSON in Schema field'); return; }
    try {
      if (faqItems.trim()) parsedFaq = JSON.parse(faqItems);
    } catch { toast.error('Invalid JSON in FAQ Items field'); return; }

    try {
      const resp = await schemaService.upsert(pageKey, { label, schemaJson: parsedSchema, faqItems: parsedFaq });
      toast.success('Schema saved');
      setEditing(resp.data);
      await load();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  async function handleDelete(pageKey: string) {
    if (!confirm('Delete this schema?')) return;
    try {
      await schemaService.delete(pageKey);
      toast.success('Schema deleted');
      if (editing?.pageKey === pageKey) openNew();
      await load();
    } catch (err: unknown) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-navy">Schema Manager</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-orange text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-orange/90 transition">
          <Plus className="w-4 h-4" /> New Schema
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Schema list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto bg-white rounded-xl border border-silver p-3">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>
          ) : schemas.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">No schemas yet</p>
          ) : (
            <div className="space-y-1">
              {schemas.map((s) => (
                <div key={s.pageKey}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                    editing?.pageKey === s.pageKey ? 'bg-navy text-white' : 'hover:bg-silver text-navy'
                  }`}
                  onClick={() => openEdit(s)}
                >
                  <span className="font-medium truncate">{s.label}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.pageKey); }}
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-white rounded-xl border border-silver p-6">
          <h2 className="text-lg font-bold text-navy mb-4">{editing ? `Edit: ${editing.label}` : 'New Schema'}</h2>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Page Key</label>
              <input
                value={editing?.pageKey || label.toLowerCase().replace(/\s+/g, '-')}
                disabled={!!editing}
                onChange={(e) => setLabel(e.target.value.replace(/-/g, ' '))}
                className="w-full border border-silver rounded-lg px-3 py-2 text-sm text-navy bg-gray-50 disabled:opacity-60"
                placeholder="homepage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Label</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-silver rounded-lg px-3 py-2 text-sm text-navy"
                placeholder="Homepage" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Schema JSON</label>
              <textarea value={schemaJson} onChange={(e) => setSchemaJson(e.target.value)} rows={8}
                className="w-full border border-silver rounded-lg px-3 py-2 text-sm font-mono text-navy"
                placeholder='{"@context":"https://schema.org","@type":"WebPage"}' />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">FAQ Items (JSON array)</label>
              <textarea value={faqItems} onChange={(e) => setFaqItems(e.target.value)} rows={5}
                className="w-full border border-silver rounded-lg px-3 py-2 text-sm font-mono text-navy"
                placeholder='[{"question":"...","answer":"..."}]' />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave}
                className="bg-navy text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-navy/90 transition">
                Save
              </button>
              {editing && (
                <button onClick={openNew}
                  className="border border-silver text-text-muted text-sm px-5 py-2 rounded-lg hover:bg-silver transition">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
