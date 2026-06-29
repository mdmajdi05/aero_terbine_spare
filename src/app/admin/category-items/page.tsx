'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Plus, Edit2, Trash2, X, ChevronUp, ChevronDown,
  Search, Loader2, Upload, FileSpreadsheet,
  List, FileJson, FileText,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import 'react-data-grid/lib/styles.css';
import { request } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { NavCategory, NavCategoryTree, CategoryItem } from '@/types';
import toast from 'react-hot-toast';
import useSpreadsheetEditor from '@/app/admin/hooks/useSpreadsheetEditor';
import SpreadsheetGrid from '@/components/admin/SpreadsheetGrid';

// ── Helpers ─────────────────────────────────────────────
function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (raw == null) { reject(new Error('Empty file')); return; }
        const isCSV = file.name.toLowerCase().endsWith('.csv');
        const wb = XLSX.read(raw as string, { type: isCSV ? 'string' : 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' }));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    file.name.toLowerCase().endsWith('.csv') ? reader.readAsText(file) : reader.readAsBinaryString(file);
  });
}

function parseTableText(text: string): Record<string, unknown>[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = line.split(delimiter).map((v) => v.trim());
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
}

// ── Confirm Delete Modal ───────────────────────────────
function ConfirmDeleteModal({ title, onClose, onConfirm }: {
  title: string; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-[#1A1A2E] text-center mb-1">Delete &ldquo;{title}&rdquo;?</h2>
        <p className="text-sm text-[#4A4A6A] text-center mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button disabled={saving}
            onClick={async () => { setSaving(true); await onConfirm(); setSaving(false); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
            {saving ? 'Deleting\u2026' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Modal ─────────────────────────────────────
function AddEditItemModal({ mode, item, categoryId, onClose, onSave }: {
  mode: 'add' | 'edit';
  item?: CategoryItem;
  categoryId: string;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(item?.title ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [image, setImage] = useState(item?.image ?? '');
  const [link, setLink] = useState(item?.link ?? '');
  const [dataStr, setDataStr] = useState(item?.data ? JSON.stringify(item.data, null, 2) : '');
  const [cardConfigStr, setCardConfigStr] = useState(item?.cardConfig ? JSON.stringify(item.cardConfig, null, 2) : '');
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (mode === 'add') setSlug(toSlug(v));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let data: Record<string, unknown> | undefined;
      let cardConfig: Record<string, unknown> | undefined;
      try { data = dataStr.trim() ? JSON.parse(dataStr) : undefined; } catch { toast.error('Invalid JSON in Data field'); setSaving(false); return; }
      try { cardConfig = cardConfigStr.trim() ? JSON.parse(cardConfigStr) : undefined; } catch { toast.error('Invalid JSON in Card Config field'); setSaving(false); return; }

      const body: Record<string, unknown> = {
        title: title.trim(),
        slug: slug.trim() || toSlug(title),
        description: description.trim(),
        image: image.trim(),
        link: link.trim(),
        data,
        cardConfig,
        sortOrder,
        isActive,
        categoryId,
      };
      await onSave(body);
    } finally {
      setSaving(false);
    }
  };

  const valid = title.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E]">
            {mode === 'add' ? 'Add' : 'Edit'} Category Item
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Title *</label>
            <input value={title} onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Item ka naam — frontend card/list me heading ke roop me dikhega</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">URL me use hoga. Auto-generate hota hai title se. Manually bhi change kar sakte ho.</p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Card view me title ke neeche dikhega. Khas details yaha daalo.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Image URL</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Image link ho to card me dikhega. Kuchh nahi daaloge to category ke Placeholder setting use hogi ya image section chhup jayega.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Link</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/category/..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">External URL ya internal path. Card button is link par le jayega. Khali chhodo to button sirf label dikhayega, navigation nahi karega.</p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Data (JSON) — Extra Fields</label>
            <textarea rows={4} value={dataStr} onChange={(e) => setDataStr(e.target.value)} placeholder='{"key": "value"}'
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Excel/JSON import se jo extra columns aate hain wo yaha store hote hain. ListView auto-detect karega aur columns banayega. Jaise: {"material, weight, price, manufacturer"}.</p>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Card Config (JSON) — Per-Item Override</label>
            <textarea rows={3} value={cardConfigStr} onChange={(e) => setCardConfigStr(e.target.value)} placeholder='{"layout": "grid"}'
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Sirf is item ke liye display override. Category ke cardConfig ko replace karega. Zaroorat na ho to khali chhodo.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A4A6A] mb-1">Sort Order</label>
            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5">Chhota number = pehle dikhega. Items is order me sort hote hain.</p>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-[#C0C9D5] text-[#4F46E5] focus:ring-[#4F46E5]/30" />
              <span className="text-sm font-medium text-[#1A1A2E]">Active</span>
            </label>
            <p className="text-[10px] text-[#4A4A6A]/60 mt-0.5 ml-2">Uncheck karne se item frontend me chhup jayega, delete nahi hoga.</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button disabled={saving || !valid} onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] disabled:opacity-60 transition-colors">
            {saving ? 'Saving\u2026' : mode === 'add' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Import Modal ──────────────────────────────────
type ImportTab = 'json' | 'excel' | 'paste';

function BulkImportModal({ categoryId, onClose, onDone }: {
  categoryId: string; onClose: () => void; onDone: () => void;
}) {
  const [tab, setTab] = useState<ImportTab>('json');
  const [importing, setImporting] = useState(false);
  const [appendMode, setAppendMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteText, setPasteText] = useState('');

  const editor = useSpreadsheetEditor('r');

  const {
    rows, setRows,
    editingCol, setEditingCol,
    renamedCols, setRenamedCols,
    addIds, cleanRows,
    handleRowsChange,
    handleDeleteRow,
    handleDeleteColumn,
    handleRenameColumn,
    handleAddRow,
    handleAddColumn,
  } = editor;

  const handleJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Record<string, unknown>[];
      setRows(addIds(Array.isArray(parsed) ? parsed : []));
      setRenamedCols({});
    } catch { toast.error('Invalid JSON file'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await parseSpreadsheet(file);
      setRows(addIds(parsed));
      setRenamedCols({});
    } catch { toast.error('Failed to parse file'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = () => {
    try {
      setRows(addIds(parseTableText(pasteText)));
      setRenamedCols({});
    } catch { toast.error('Failed to parse pasted data'); }
  };

  const handleImport = async () => {
    if (!rows.length) { toast.error('No data to import'); return; }
    setImporting(true);
    try {
      const clean = cleanRows();
      const res = await request<{ success: boolean; data: { slug: string; action: string }[] }>('/admin/category-items/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ categoryId, items: clean, append: appendMode }),
      });
      const imported = res?.data?.length ?? 0;
      const skipped = rows.length - imported;
      const msg = `${imported} items imported${skipped > 0 ? ` (${skipped} skipped)` : ''}${appendMode ? ' (appended)' : ' (replaced all)'}`;
      toast.success(msg);
      onDone();
      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E]">Bulk Import Items</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#F5F7FA] rounded-xl border border-[#E8EDF2] w-fit mb-4">
          {([
            { key: 'json' as const,  icon: FileJson,   label: 'JSON File' },
            { key: 'excel' as const, icon: FileSpreadsheet, label: 'Excel / CSV' },
            { key: 'paste' as const, icon: FileText,   label: 'Paste Data' },
          ]).map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === key ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-[#4A4A6A] hover:text-[#1A1A2E]'
              )}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab: JSON */}
        {tab === 'json' && (
          <div className="border-2 border-dashed border-[#C0C9D5] rounded-2xl p-8 text-center hover:border-[#4F46E5] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-10 h-10 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1A2E] mb-1">Drop a JSON file or click to browse</p>
            <p className="text-xs text-[#4A4A6A]">Array of objects with title, slug, description, etc.</p>
          </div>
        )}

        {/* Tab: Excel */}
        {tab === 'excel' && (
          <div className="border-2 border-dashed border-[#C0C9D5] rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="w-10 h-10 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1A2E] mb-1">Upload .xlsx, .xls, or .csv</p>
            <p className="text-xs text-[#4A4A6A]">First row must be column headers</p>
          </div>
        )}

        {/* Tab: Paste */}
        {tab === 'paste' && (
          <div className="space-y-3">
            <textarea rows={6} value={pasteText} onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste tab-separated or comma-separated data here...&#10;title\tslug\tdescription&#10;My Item\tmy-item\tA description"
              className="w-full px-3 py-2.5 rounded-xl border border-[#C0C9D5] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 resize-none" />
            <button onClick={handlePaste}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors">
              Parse
            </button>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".json,.xlsx,.xls,.csv" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.name.endsWith('.json')) handleJsonFile(e);
            else handleExcelFile(e);
          }} />

        {/* Editable Grid */}
        {rows.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#1A1A2E]">
                {rows.length} row{rows.length !== 1 ? 's' : ''} — double-click cells/headers to edit
              </p>
            </div>
            <SpreadsheetGrid
              rows={rows}
              onRowsChange={handleRowsChange}
              editingCol={editingCol}
              setEditingCol={setEditingCol}
              renamedCols={renamedCols}
              onDeleteRow={handleDeleteRow}
              onDeleteColumn={handleDeleteColumn}
              onRenameColumn={handleRenameColumn}
              onAddRow={handleAddRow}
              onAddColumn={handleAddColumn}
              maxHeight={450}
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={appendMode} onChange={(e) => setAppendMode(e.target.checked)}
              className="w-4 h-4 rounded border-[#C0C9D5] text-[#4F46E5] focus:ring-[#4F46E5]/30" />
            <span className="text-xs font-medium text-[#1A1A2E]">Add to existing items (append)</span>
            <span className="text-[10px] text-[#4A4A6A]/60">Unchecked = replace all items in this category</span>
          </label>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="py-3 px-5 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">
              Cancel
            </button>
            <button disabled={importing || !rows.length} onClick={handleImport}
              className="py-3 px-5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              {importing ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Importing\u2026</> : `Import ${rows.length} Item${rows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Connect Live Excel Modal ───────────────────────────
function ConnectExcelModal({ categoryId, onClose, onDone }: {
  categoryId: string; onClose: () => void; onDone: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [connecting, setConnecting] = useState(false);

  const editor = useSpreadsheetEditor('c');
  const {
    rows, setRows,
    editingCol, setEditingCol,
    renamedCols, setRenamedCols,
    addIds, cleanRows,
    handleRowsChange,
    handleDeleteRow,
    handleDeleteColumn,
    handleRenameColumn,
    handleAddRow,
    handleAddColumn,
  } = editor;

  const handleFile = async (f: File) => {
    setFile(f);
    try {
      const parsed = await parseSpreadsheet(f);
      setRows(addIds(parsed));
      setRenamedCols({});
    } catch { toast.error('Failed to parse file'); }
  };

  const handleConnect = async () => {
    if (!file || !rows.length) return;
    setConnecting(true);
    try {
      const clean = cleanRows();
      await request('/admin/category-items/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ categoryId, items: clean, source: 'excel', filename: file.name }),
      });
      toast.success(`${rows.length} items from "${file.name}" connected`);
      onDone();
      onClose();
    } catch (err) {
      toast.error((err as Error).message || 'Failed to connect');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-6 my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1A1A2E]">Connect Live Excel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById('excel-connect-input')?.click()}>
            <FileSpreadsheet className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1A1A2E] mb-1">Choose an Excel or CSV file</p>
            <p className="text-xs text-[#4A4A6A]">Supported: .xlsx, .xls, .csv</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-[#1A1A2E]">{file.name}</div>
                <div className="text-xs text-[#4A4A6A]">{(file.size / 1024).toFixed(1)} KB &middot; {rows.length} rows</div>
              </div>
            </div>

            {/* Editable Grid */}
            {rows.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[#4A4A6A]">
                    {rows.length} row{rows.length !== 1 ? 's' : ''} — click cells to edit
                  </p>
                </div>
                <SpreadsheetGrid
                  rows={rows}
                  onRowsChange={handleRowsChange}
                  editingCol={editingCol}
                  setEditingCol={setEditingCol}
                  renamedCols={renamedCols}
                  onDeleteRow={handleDeleteRow}
                  onDeleteColumn={handleDeleteColumn}
                  onRenameColumn={handleRenameColumn}
                  onAddRow={handleAddRow}
                  onAddColumn={handleAddColumn}
                  maxHeight={350}
                />
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>Note:</strong> Changes to this Excel file will reflect live on frontend. The file path will be stored for live syncing.
            </div>
          </div>
        )}

        <input id="excel-connect-input" type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA]">
            Cancel
          </button>
          <button disabled={connecting || !file || !rows.length} onClick={handleConnect}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
            {connecting ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Connecting\u2026</> : 'Save & Connect'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function AdminCategoryItemsPage() {
  const [tree, setTree] = useState<NavCategoryTree | null>(null);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editItem, setEditItem] = useState<CategoryItem | undefined>(undefined);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showConnectExcel, setShowConnectExcel] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const res = await request<{ success: boolean; data: NavCategoryTree }>('/nav-categories');
      setTree(res.data || null);
    } catch { toast.error('Failed to load categories'); } finally { setLoadingTree(false); }
  }, []);

  const loadItems = useCallback(async (categoryId: string) => {
    setLoadingItems(true);
    try {
      const res = await request<{ success: boolean; data: CategoryItem[] }>(`/category-items?categoryId=${categoryId}`);
      setItems(res.data || []);
    } catch { toast.error('Failed to load items'); } finally { setLoadingItems(false); }
  }, []);

  useEffect(() => { loadTree(); }, [loadTree]);

  useEffect(() => {
    if (selectedCategoryId) loadItems(selectedCategoryId);
    else setItems([]);
  }, [selectedCategoryId, loadItems]);

  const groupedCategories = useMemo(() => {
    if (!tree) return { products: [] as NavCategory[], parts: [] as NavCategory[] };
    return {
      products: tree.productCategories.filter((c) => c.id),
      parts: tree.partCategories.filter((c) => c.id),
    };
  }, [tree]);

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId || !tree) return null;
    return [...tree.productCategories, ...tree.partCategories].find((c) => c.id === selectedCategoryId) ?? null;
  }, [selectedCategoryId, tree]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((i) =>
      i.title.toLowerCase().includes(s) ||
      i.slug.toLowerCase().includes(s) ||
      (i.description ?? '').toLowerCase().includes(s)
    );
  }, [items, search]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [filteredItems]);

  const openAdd = () => { setEditItem(undefined); setShowAddEdit(true); };

  const openEdit = (item: CategoryItem) => { setEditItem(item); setShowAddEdit(true); };

  const handleSave = async (body: Record<string, unknown>) => {
    try {
      if (editItem) {
        await request(`/admin/category-items/${editItem.id}`, { method: 'PUT', body: JSON.stringify(body) });
        toast.success('Updated');
      } else if (selectedCategoryId) {
        await request('/admin/category-items', { method: 'POST', body: JSON.stringify(body) });
        toast.success('Created');
      }
      setShowAddEdit(false);
      setEditItem(undefined);
      if (selectedCategoryId) loadItems(selectedCategoryId);
    } catch (err) {
      toast.error((err as Error).message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request(`/admin/category-items/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Deleted');
      setDeleteTarget(null);
      setSelectedIds(new Set());
      if (selectedCategoryId) loadItems(selectedCategoryId);
    } catch (err) {
      toast.error((err as Error).message || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} item${selectedIds.size !== 1 ? 's' : ''}?`)) return;
    try {
      await request('/admin/category-items/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      toast.success(`Deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      if (selectedCategoryId) loadItems(selectedCategoryId);
    } catch (err) {
      toast.error((err as Error).message || 'Bulk delete failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === sortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedItems.map((i) => i.id)));
    }
  };

  const handleReorder = async (itemId: string, direction: 'up' | 'down') => {
    const idx = sortedItems.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const newItems = [...sortedItems];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    const reorderPayload = newItems.map((item, i) => ({ id: item.id, sortOrder: i + 1 }));
    try {
      await request('/admin/category-items/reorder', {
        method: 'PUT',
        body: JSON.stringify({ categoryId: selectedCategoryId, items: reorderPayload }),
      });
      setItems(newItems);
    } catch (err) {
      toast.error((err as Error).message || 'Reorder failed');
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 bg-white rounded-2xl border border-[#E8EDF2] shadow-sm flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-[#E8EDF2]">
          <h2 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
            <List className="w-4 h-4" /> Categories
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingTree ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin" />
            </div>
          ) : (
            <>
              {/* Products group */}
              <div className="px-2 pt-2 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A4A6A]/60">Products</p>
              </div>
              {groupedCategories.products.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    selectedCategoryId === cat.id
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'text-[#4A4A6A] hover:bg-[#F5F7FA]'
                  )}>
                  <span className="truncate block">{cat.name}</span>
                </button>
              ))}
              {/* Parts group */}
              <div className="px-2 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A4A6A]/60">Parts</p>
              </div>
              {groupedCategories.parts.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    selectedCategoryId === cat.id
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'text-[#4A4A6A] hover:bg-[#F5F7FA]'
                  )}>
                  <span className="truncate block">{cat.name}</span>
                </button>
              ))}
              {!groupedCategories.products.length && !groupedCategories.parts.length && (
                <p className="text-xs text-[#4A4A6A] text-center py-8">No categories loaded</p>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedCategoryId ? (
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-[#E8EDF2] shadow-sm">
            <div className="text-center">
              <List className="w-12 h-12 text-[#C0C9D5] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-1">Select a Category</h3>
              <p className="text-sm text-[#4A4A6A]">Choose a category from the sidebar to manage its items</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-lg font-bold text-[#1A1A2E]">
                    {selectedCategory?.name ?? 'Items'}
                  </h1>
                  <p className="text-xs text-[#4A4A6A]">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedIds.size > 0 && (
                    <button onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                    </button>
                  )}
                  <button onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors">
                    <Plus className="w-4 h-4" /> Add New Item
                  </button>
                  <button onClick={() => setShowBulkImport(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#C0C9D5] text-sm font-medium text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors">
                    <Upload className="w-4 h-4" /> Bulk Import
                  </button>
                  <button onClick={() => setShowConnectExcel(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-300 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                    <FileSpreadsheet className="w-4 h-4" /> Connect Live Excel
                  </button>
                </div>
              </div>
              <div className="relative mt-3 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A4A6A]" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5]" />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-auto">
              {loadingItems ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 text-[#4F46E5] animate-spin" />
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <List className="w-10 h-10 text-[#C0C9D5] mb-2" />
                  <p className="text-sm text-[#4A4A6A]">No items found</p>
                  <button onClick={openAdd}
                    className="mt-3 flex items-center gap-1 px-4 py-2 rounded-xl bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors">
                    <Plus className="w-4 h-4" /> Add the first item
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E8EDF2] bg-[#F5F7FA] sticky top-0">
                      <th className="px-4 py-3 text-left w-10">
                        <input type="checkbox" checked={sortedItems.length > 0 && selectedIds.size === sortedItems.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-[#C0C9D5] text-[#4F46E5] focus:ring-[#4F46E5]/30 cursor-pointer" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A] w-10">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Sort</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {sortedItems.map((item, idx) => (
                      <tr key={item.id} className={cn('hover:bg-[#F9FAFB] transition-colors', selectedIds.has(item.id) && 'bg-[#EEF2FF]')}>
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 rounded border-[#C0C9D5] text-[#4F46E5] focus:ring-[#4F46E5]/30 cursor-pointer" />
                        </td>
                        <td className="px-4 py-3 text-xs text-[#4A4A6A]">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#1A1A2E] max-w-[200px]">
                          <span className="truncate block">{item.title}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#4A4A6A]">/{item.slug}</td>
                        <td className="px-4 py-3">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#E8EDF2]" />
                          ) : (
                            <span className="text-xs text-[#C0C9D5]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#4A4A6A]">{item.sortOrder ?? 0}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                            item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          )}>
                            <span className={cn('w-1.5 h-1.5 rounded-full', item.isActive ? 'bg-emerald-500' : 'bg-red-500')} />
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleReorder(item.id, 'up')} disabled={idx === 0}
                              className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A] hover:text-[#4F46E5] disabled:opacity-30 transition-colors" title="Move up">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleReorder(item.id, 'down')} disabled={idx === sortedItems.length - 1}
                              className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#4A4A6A] hover:text-[#4F46E5] disabled:opacity-30 transition-colors" title="Move down">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(item)}
                              className="p-1.5 rounded-lg hover:bg-[#EEF2FF] text-[#4A4A6A] hover:text-[#4F46E5] transition-colors" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#4A4A6A] hover:text-red-600 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showAddEdit && selectedCategoryId && (
        <AddEditItemModal
          mode={editItem ? 'edit' : 'add'}
          item={editItem}
          categoryId={selectedCategoryId}
          onClose={() => { setShowAddEdit(false); setEditItem(undefined); }}
          onSave={handleSave}
        />
      )}

      {showBulkImport && selectedCategoryId && (
        <BulkImportModal
          categoryId={selectedCategoryId}
          onClose={() => setShowBulkImport(false)}
          onDone={() => { if (selectedCategoryId) loadItems(selectedCategoryId); }}
        />
      )}

      {showConnectExcel && selectedCategoryId && (
        <ConnectExcelModal
          categoryId={selectedCategoryId}
          onClose={() => setShowConnectExcel(false)}
          onDone={() => { if (selectedCategoryId) loadItems(selectedCategoryId); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title={deleteTarget.title}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}