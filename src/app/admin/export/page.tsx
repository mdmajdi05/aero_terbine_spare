'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Download, Upload, FileJson, FileText, AlertCircle, CheckCircle,
  Loader2, RefreshCw, X, Pause, Play, Link, FileSpreadsheet, Plus,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import 'react-data-grid/lib/styles.css';
import { request } from '@/lib/api-client';
import useSpreadsheetEditor from '@/app/admin/hooks/useSpreadsheetEditor';
import SpreadsheetGrid from '@/components/admin/SpreadsheetGrid';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { NavCategory, NavCategoryTree } from '@/types';

type ExportFormat = 'json' | 'csv';

interface ExportTarget {
  key: string; label: string; endpoint: string; desc: string; color: string;
}

interface ExcelFeedStatus {
  id: string;
  filename: string;
  status: 'active' | 'paused';
  rowCount: number;
  uploadedBy: string;
  uploadedAt: string;
  type?: 'product' | 'part';
  categorySlug?: string;
  categoryName?: string;
  industrySlug?: string;
  columns?: string[];
}

const EXPORT_TARGETS: ExportTarget[] = [
  { key: 'users', label: 'Users', endpoint: '/admin/export/users', desc: 'All registered user accounts (no passwords)', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { key: 'rfqs',  label: 'RFQs',  endpoint: '/admin/export/rfqs',  desc: 'All submitted requests for quotation',       color: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { key: 'parts', label: 'Parts', endpoint: '/admin/export/parts', desc: 'Full parts catalog with specs & pricing',    color: 'bg-green-50 border-green-200 text-green-800' },
];

const STOCK_TO_DB: Record<string, string> = {
  'In Stock': 'InStock', 'On Order': 'OnOrder',
  'Obsolete': 'Obsolete', 'Limited': 'Limited',
};

// ── Helpers ───────────────────────────────────────────────────
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(data: unknown, filename: string) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
}

// ── SheetJS parser — handles .xlsx / .xls / .csv with quoted commas ──
async function parseSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
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
    file.name.toLowerCase().endsWith('.csv')
      ? reader.readAsText(file)
      : reader.readAsBinaryString(file);
  });
}

// ── Column detection helper ───────────────────────────────────
function detectColumnsFromRows(rows: Record<string, unknown>[]): string[] {
  if (!rows.length) return [];
  const colSet = new Set<string>();
  for (const row of rows) Object.keys(row).forEach(k => colSet.add(k));
  return Array.from(colSet).filter(k => !['id', '_source', '_feedId'].includes(k));
}

// Flexible column-name mapper (handles PascalCase / snake_case / spaces in column headers)
function col(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return String(row[k]);
  }
  return '';
}

function normalizePart(row: Record<string, unknown>): Record<string, unknown> {
  const rawStock = col(row, 'stockStatus', 'Stock Status', 'stock_status', 'StockStatus') || 'In Stock';
  return {
    nsn:               col(row, 'nsn', 'NSN'),
    cage:              col(row, 'cage', 'CAGE', 'Cage'),
    partNumber:        col(row, 'partNumber', 'Part Number', 'part_number', 'PartNumber'),
    description:       col(row, 'description', 'Description'),
    shortDescription:  col(row, 'shortDescription', 'Short Description', 'short_description') ||
                       col(row, 'description', 'Description'),
    fsg:               col(row, 'fsg', 'FSG'),
    fsc:               col(row, 'fsc', 'FSC'),
    category:          col(row, 'category', 'Category') || 'General',
    manufacturer:      col(row, 'manufacturer', 'Manufacturer'),
    condition:         col(row, 'condition', 'Condition') || 'New',
    stockStatus:       STOCK_TO_DB[rawStock] ?? 'InStock',
    quantityAvailable: parseInt(col(row, 'quantityAvailable', 'Quantity Available', 'quantity_available') || '0', 10) || 0,
    unitPrice:         parseFloat(col(row, 'unitPrice', 'Unit Price', 'unit_price') || '0') || 0,
  };
}

// ── Page component ────────────────────────────────────────────
export default function AdminExportPage() {
  const [format,         setFormat]         = useState<ExportFormat>('json');
  const [exporting,      setExporting]      = useState<string | null>(null);
  const [importing,      setImporting]      = useState(false);
  const [importFile,     setImportFile]     = useState<File | null>(null);
  const [importResult,   setImportResult]   = useState<{ imported: number; errors: number; errorRows?: string[] } | null>(null);
  const [importIndustry, setImportIndustry] = useState('');
  const [importType,     setImportType]     = useState<'product' | 'part'>('part');
  const [importCategory, setImportCategory] = useState('');

  // Multi-feed state
  const [feeds, setFeeds] = useState<ExcelFeedStatus[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);

  // Connect flow state
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingColumns, setPendingColumns] = useState<string[]>([]);
  const [pendingPreview, setPendingPreview] = useState<Record<string, unknown>[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedType, setSelectedType] = useState<'product' | 'part'>('product');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryManufacturer, setNewCategoryManufacturer] = useState('');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Category data
  const [categoryTree, setCategoryTree] = useState<NavCategoryTree | null>(null);

  // Preview for individual feed
  const [previewFeedId, setPreviewFeedId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const feedEditor = useSpreadsheetEditor('feed');

  // Local Connect state (no backend required)
  const [localFeed, setLocalFeed] = useState<{ filename: string; rowCount: number; status: string } | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localConnecting, setLocalConnecting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const localFileInputRef = useRef<HTMLInputElement>(null);

  // ── Load feeds ──────────────────────────────────────────────
  const loadFeeds = useCallback(async () => {
    setFeedsLoading(true);
    try {
      const res = await request<{ success: boolean; data: ExcelFeedStatus[] }>('/admin/excel/list');
      setFeeds(res.data ?? []);
    } catch {
      setFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  }, []);

  useEffect(() => { void loadFeeds(); }, [loadFeeds]);

  // ── Load categories from backend ────────────────────────────
  useEffect(() => {
    request<{ success: boolean; data: NavCategoryTree }>('/nav-categories')
      .then((res) => { if (res.success && res.data) setCategoryTree(res.data); })
      .catch(() => {});
  }, []);

  // ── Load local-feed metadata on mount ───────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/excel-feed.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { feeds?: Array<{ filename: string; rowCount: number; status: string }> };
        if (data.feeds?.length) {
          const f = data.feeds[0];
          setLocalFeed({ filename: f.filename, rowCount: f.rowCount, status: f.status });
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // ── Export ───────────────────────────────────────────────────
  const handleExport = async (target: ExportTarget) => {
    setExporting(target.key);
    try {
      const session = JSON.parse(localStorage.getItem('ats_session') || '{}') as { token?: string };
      const apiUrl  = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/admin/export/${target.key}?format=${format}`, {
        headers: { Authorization: `Bearer ${session.token || ''}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const ts = new Date().toISOString().slice(0, 10);
      const filename = `aeroturbinespare_${target.key}_${ts}`;
      if (format === 'csv') {
        downloadBlob(new Blob([await res.text()], { type: 'text/csv' }), `${filename}.csv`);
      } else {
        const json = await res.json() as { success: boolean; data: unknown };
        downloadJSON(json.data, `${filename}.json`);
      }
      toast.success(`${target.label} exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error((err as Error).message || 'Export failed');
    } finally {
      setExporting(null);
    }
  };

  // ── Bulk Import (CSV / JSON → permanent DB) ──────────────────
  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    let imported = 0;
    const errorRows: string[] = [];
    const overrideCategoryName = importCategory
      ? (importFilteredCategories.find(c => c.slug === importCategory)?.name ?? importCategory)
      : '';
    try {
      let rows: Record<string, unknown>[] = [];
      if (importFile.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(await importFile.text()) as unknown;
        rows = Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : [];
      } else {
        rows = await parseSpreadsheet(importFile);
      }
      if (!rows.length) { toast.error('File is empty or unreadable'); return; }
      const normalized = rows.map((r) => ({
        ...normalizePart(r),
        ...(overrideCategoryName ? { category: overrideCategoryName } : {}),
      }));
      const BATCH = 50;
      for (let i = 0; i < normalized.length; i += BATCH) {
        const batch = normalized.slice(i, i + BATCH);
        try {
          const res = await request<{ success: boolean; data: { imported: number } }>(
            '/admin/import/parts', { method: 'POST', body: JSON.stringify(batch) }
          );
          imported += res.data?.imported ?? batch.length;
        } catch (batchErr) {
          errorRows.push(`Rows ${i + 1}–${Math.min(i + BATCH, normalized.length)}: ${(batchErr as Error).message}`);
        }
      }
      setImportResult({ imported, errors: errorRows.length, errorRows });
      toast[errorRows.length === 0 ? 'success' : 'success'](
        errorRows.length === 0
          ? `${imported} parts imported successfully`
          : `${imported} imported, ${errorRows.length} batch(es) had errors`
      );
    } catch (err) {
      toast.error((err as Error).message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  // ── Save rows to local JSON (multi-feed) ─────────────────────
  const saveLocalFeed = async (
    rows: Record<string, unknown>[],
    filename: string,
    status: 'active' | 'paused' | null,
    extra?: Record<string, unknown>
  ) => {
    try {
      const existing = await fetch('/api/excel-feed', { cache: 'no-store' }).then(r => r.json()).catch(() => ({}));
      const currentFeeds = existing.feeds ?? [];
      const entry = { filename, rowCount: rows.length, status, rows, connectedAt: new Date().toISOString(), ...extra };
      const merged = currentFeeds.filter((f: { filename: string }) => f.filename !== filename).concat(entry);
      await fetch('/api/excel-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeds: merged, source: 'local' }),
      });
    } catch { /* non-critical */ }
  };

  // ── Connect flow: file selected ───────────────────────────────
  const handleFileSelected = async (file: File) => {
    try {
      const rows = await parseSpreadsheet(file);
      if (!rows.length) { toast.error('File has no readable rows'); return; }
      const columns = detectColumnsFromRows(rows);
      setPendingFile(file);
      setPendingColumns(columns);
      setPendingPreview(rows);
      setSelectedIndustry('');
      setSelectedType('product');
      setSelectedCategory('');
      setShowAddCategory(false);
      setNewCategoryName('');
      setNewCategoryManufacturer('');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to parse file');
    }
  };

  // ── Connect flow: submit connect ──────────────────────────────
  const handleConnect = async () => {
    if (!pendingFile || !pendingPreview.length) return;
    setConnectingId('new');
    try {
      const catList = selectedType === 'product' ? categoryTree?.productCategories : categoryTree?.partCategories;
      const category = catList?.find(c => c.slug === selectedCategory);
      const res = await request<{ success: boolean; data: ExcelFeedStatus; message: string }>(
        '/admin/excel/connect',
        {
          method: 'POST',
          body: JSON.stringify({
            filename: pendingFile.name,
            rows: pendingPreview,
            type: selectedType,
            categorySlug: selectedCategory || undefined,
            categoryName: category?.name,
            industrySlug: selectedIndustry || undefined,
            columns: pendingColumns,
          }),
        }
      );
      await saveLocalFeed(pendingPreview, pendingFile.name, 'active', {
        type: selectedType,
        categorySlug: selectedCategory || '',
        categoryName: category?.name || '',
        industrySlug: selectedIndustry || '',
        columns: pendingColumns,
      });
      setPendingFile(null);
      setPendingColumns([]);
      setPendingPreview([]);
      setConnectingId(null);
      await loadFeeds();
      toast.success(res.message || `${pendingPreview.length} rows connected`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to connect feed');
      setConnectingId(null);
    }
  };

  // ── Connect flow: cancel ──────────────────────────────────────
  const cancelConnect = () => {
    setPendingFile(null);
    setPendingColumns([]);
    setPendingPreview([]);
    setConnectingId(null);
    setSelectedIndustry('');
    setSelectedType('product');
    setSelectedCategory('');
    setShowAddCategory(false);
  };

  // ── Per-feed: toggle pause/resume ─────────────────────────────
  const handleFeedToggle = async (feedId: string, currentStatus: string) => {
    try {
      const res = await request<{ success: boolean; data: ExcelFeedStatus; message: string }>(
        '/admin/excel/toggle',
        { method: 'PATCH', body: JSON.stringify({ feedId }) }
      );
      setFeeds(prev => prev.map(f => f.id === feedId ? res.data : f));
      toast.success(res.message || 'Feed updated');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to toggle feed');
    }
  };

  // ── Per-feed: disconnect ──────────────────────────────────────
  const handleFeedDisconnect = async (feedId: string) => {
    if (!confirm('Remove this feed and its data from the catalog?')) return;
    try {
      await request(`/admin/excel/disconnect/${feedId}`, { method: 'DELETE' });
      setFeeds(prev => prev.filter(f => f.id !== feedId));
      if (previewFeedId === feedId) { setPreviewFeedId(null); feedEditor.setRows([]); }
      toast.success('Feed disconnected');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to disconnect');
    }
  };

  // ── Per-feed: preview rows (editable) ─────────────────────────
  const handleFeedPreview = async (feedId: string) => {
    if (previewFeedId === feedId) { setPreviewFeedId(null); feedEditor.setRows([]); feedEditor.setRenamedCols({}); return; }
    setPreviewLoading(true);
    try {
      const res = await request<{ success: boolean; data: Record<string, unknown>[]; total: number }>(
        `/admin/excel/rows/${feedId}?page=1&limit=10000`
      );
      const loaded = (res.data || []).map((row, i) => ({ ...row, _rid: `feed_${i}` }));
      setPreviewFeedId(feedId);
      feedEditor.setRows(loaded);
      feedEditor.setRenamedCols({});
    } catch (err) {
      toast.error((err as Error).message || 'Failed to load preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveFeedRows = async () => {
    if (!previewFeedId || feedEditor.rows.length === 0) return;
    try {
      const cleanRows = feedEditor.cleanRows();
      await request(`/admin/excel/update/${previewFeedId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rows: cleanRows }),
      });
      toast.success(`${cleanRows.length} rows saved`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save rows');
    }
  };

  // ── Per-feed: change category ─────────────────────────────────
  const handleFeedCategoryChange = (feedId: string, categorySlug: string, currentType?: string, currentIndustry?: string) => {
    const catList = categoryTree?.productCategories?.concat(categoryTree?.partCategories ?? []) ?? [];
    const matched = catList.find(c => c.slug === categorySlug);
    const name = matched?.name ?? '';
    const type = matched?.type ?? (currentType || 'product');
    const industrySlug = matched?.industryIds?.[0]
      ? categoryTree?.industries.find(i => i.id === matched.industryIds![0])?.slug
      : currentIndustry;
    (async () => {
      try {
        const res = await request<{ success: boolean; data: ExcelFeedStatus }>(
          `/admin/excel/update/${feedId}`,
          { method: 'PATCH', body: JSON.stringify({ categorySlug: categorySlug || null, categoryName: name || null, type, industrySlug }) }
        );
        setFeeds(prev => prev.map(f => f.id === feedId ? { ...res.data, categoryName: name, type: type as 'product' | 'part' } : f));
        if (name) toast.success(`Category changed to "${name}"`);
      } catch (err) {
        toast.error((err as Error).message || 'Failed to update category');
      }
    })();
  };

  // ── Add new category inline ──────────────────────────────────
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) { toast.error('Category name is required'); return; }
    if (selectedType === 'part' && !newCategoryManufacturer.trim()) {
      toast.error('Manufacturer is required for part categories'); return;
    }
    try {
      const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await request('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug,
          type: selectedType,
          manufacturer: selectedType === 'part' ? newCategoryManufacturer.trim() : undefined,
          industryIds: selectedIndustry ? [categoryTree?.industries.find(i => i.slug === selectedIndustry)?.id].filter(Boolean) : [],
        }),
      });
      const res = await request<{ success: boolean; data: NavCategoryTree }>('/nav-categories');
      if (res.success && res.data) setCategoryTree(res.data);
      setShowAddCategory(false);
      setNewCategoryName('');
      setNewCategoryManufacturer('');
      setSelectedCategory(slug);
      toast.success('Category added');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to add category');
    }
  };

  // ── Local Connect: Connect directly (no backend needed) ──────
  const handleLocalConnect = async () => {
    if (!localFile) return;
    setLocalConnecting(true);
    try {
      const rows = await parseSpreadsheet(localFile);
      if (!rows.length) { toast.error('File has no readable rows'); return; }
      const columns = detectColumnsFromRows(rows);
      await saveLocalFeed(rows, localFile.name, 'active', { type: 'product', columns, connectedAt: new Date().toISOString() });
      const existing = await fetch('/api/excel-feed', { cache: 'no-store' }).then(r => r.json()).catch(() => ({}));
      const currentFeeds = existing.feeds ?? [];
      const firstFeed = currentFeeds.find((f: { filename: string }) => f.filename === localFile.name) ?? currentFeeds[0];
      setLocalFeed(firstFeed ? { filename: firstFeed.filename, rowCount: firstFeed.rowCount, status: firstFeed.status } : { filename: localFile.name, rowCount: rows.length, status: 'active' });
      setLocalFile(null);
      if (localFileInputRef.current) localFileInputRef.current.value = '';
      toast.success(`${rows.length} rows saved locally — catalog will use this feed when backend is offline`);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to save local feed');
    } finally {
      setLocalConnecting(false);
    }
  };

  // ── Local Connect: Disconnect ─────────────────────────────────
  const handleLocalDisconnect = async () => {
    if (!confirm('Clear the local fallback feed?')) return;
    try {
      await fetch('/api/excel-feed', { method: 'DELETE' });
      setLocalFeed(null);
      toast.success('Local fallback feed cleared');
    } catch {
      toast.error('Failed to clear local feed');
    }
  };

  // ── Computed category list ──────────────────────────────────
  const filteredCategories = useMemo(() => {
    if (!categoryTree) return [];
    const list = selectedType === 'product' ? categoryTree.productCategories : categoryTree.partCategories;
    if (!selectedIndustry) return list;
    const industryId = categoryTree.industries.find(i => i.slug === selectedIndustry)?.id;
    return industryId ? list.filter(c => c.industryIds?.includes(industryId)) : list;
  }, [categoryTree, selectedType, selectedIndustry]);

  const importFilteredCategories = useMemo(() => {
    if (!categoryTree) return [];
    const list = importType === 'product' ? categoryTree.productCategories : categoryTree.partCategories;
    if (!importIndustry) return list;
    const industryId = categoryTree.industries.find(i => i.slug === importIndustry)?.id;
    return industryId ? list.filter(c => c.industryIds?.includes(industryId)) : list;
  }, [categoryTree, importType, importIndustry]);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Import / Export</h1>
        <p className="text-[#4A4A6A] text-sm mt-0.5">
          Export data, bulk-import parts from CSV/JSON, or connect a live Excel feed to the catalog
        </p>
      </div>

      {/* ── Excel Live Feed ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-[#1A1A2E] flex items-center gap-2 text-base">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Excel Live Feed
            </h2>
            <p className="text-[#4A4A6A] text-sm mt-0.5">
              Upload .xlsx / .xls / .csv — rows appear live in the parts catalog instantly
            </p>
          </div>
          {!feedsLoading && feeds.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 flex-shrink-0">
              ● {feeds.length} Feed{feeds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {feedsLoading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-[#4A4A6A]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Checking feed status…</span>
          </div>

        ) : pendingFile ? (
          /* ── Connect flow: file selected, show category selection ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-[#1A1A2E]">{pendingFile.name}</div>
                  <div className="text-xs text-[#4A4A6A]">{(pendingFile.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>
            </div>

            {/* Column chips */}
            {pendingColumns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#4A4A6A] mb-2">
                  Detected {pendingColumns.length} column{pendingColumns.length !== 1 ? 's' : ''}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pendingColumns.slice(0, 12).map(col => (
                    <span key={col} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                      {col}
                    </span>
                  ))}
                  {pendingColumns.length > 12 && (
                    <span className="px-2.5 py-1 bg-[#F5F7FA] text-[#4A4A6A] border border-[#E8EDF2] rounded-lg text-xs font-medium">
                      +{pendingColumns.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Category selection */}
            <div className="border-t border-[#E8EDF2] pt-4">
              <p className="text-xs font-semibold text-[#4A4A6A] uppercase tracking-widest mb-3">
                Select Category
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Industry */}
                <div>
                  <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Industry</label>
                  <select
                    value={selectedIndustry}
                    onChange={e => { setSelectedIndustry(e.target.value); setSelectedCategory(''); }}
                    className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
                  >
                    <option value="">Select Industry…</option>
                    {categoryTree?.industries.map(ind => (
                      <option key={ind.id} value={ind.slug}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Type</label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="connect-type"
                        checked={selectedType === 'product'}
                        onChange={() => { setSelectedType('product'); setSelectedCategory(''); }}
                        className="accent-emerald-600"
                      />
                      Product
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="connect-type"
                        checked={selectedType === 'part'}
                        onChange={() => { setSelectedType('part'); setSelectedCategory(''); }}
                        className="accent-emerald-600"
                      />
                      Part
                    </label>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Category</label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
                  >
                    <option value="">Select Category…</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:border-emerald-400 hover:text-emerald-700 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>
              </div>

              {/* Add New Category inline form */}
              {showAddCategory && (
                <div className="mt-3 p-4 bg-[#F5F7FA] rounded-xl border border-[#E8EDF2] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="e.g. GE 6FA Turbine Parts"
                      className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
                    />
                  </div>
                  {selectedType === 'part' && (
                    <div>
                      <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={newCategoryManufacturer}
                        onChange={e => setNewCategoryManufacturer(e.target.value)}
                        placeholder="e.g. General Electric"
                        className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowAddCategory(false); setNewCategoryName(''); setNewCategoryManufacturer(''); }}
                      className="px-4 py-2 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#E8EDF2] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Connect / Cancel buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E8EDF2]">
              <button
                onClick={cancelConnect}
                className="px-5 py-2 rounded-xl border border-[#C0C9D5] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={connectingId === 'new'}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
              >
                {connectingId === 'new'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                  : <><Link className="w-4 h-4" /> Connect Feed</>}
              </button>
            </div>
          </div>

        ) : feeds.length > 0 ? (
          /* ── Connected feeds ── */
          <div className="space-y-4">
            {feeds.map(feed => (
              <div key={feed.id}>
                {/* Feed card */}
                <div className="border border-[#E8EDF2] rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileSpreadsheet className="w-8 h-8 flex-shrink-0 text-emerald-600" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1A1A2E] truncate">{feed.filename}</div>
                        <div className="text-xs text-[#4A4A6A] mt-0.5">
                          {feed.rowCount.toLocaleString()} rows · by {feed.uploadedBy} · {new Date(feed.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                        feed.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      )}>
                        {feed.status === 'active' ? '● Active' : '⏸ Paused'}
                      </span>
                      <button
                        onClick={() => handleFeedToggle(feed.id, feed.status)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
                          feed.status === 'active'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        )}
                      >
                        {feed.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {feed.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>

                  {/* Category dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#4A4A6A] whitespace-nowrap">Category:</span>
                    <select
                      value={feed.categorySlug || ''}
                      onChange={e => handleFeedCategoryChange(feed.id, e.target.value, feed.type, feed.industrySlug)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#C0C9D5] text-xs bg-white text-[#1A1A2E] max-w-[260px]"
                    >
                      <option value="">No category</option>
                      {(feed.type === 'part' ? categoryTree?.partCategories : categoryTree?.productCategories)?.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Column chips */}
                  {feed.columns && feed.columns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {feed.columns.slice(0, 8).map(col => (
                        <span key={col} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium">
                          {col}
                        </span>
                      ))}
                      {feed.columns.length > 8 && (
                        <span className="px-2.5 py-1 bg-[#F5F7FA] text-[#4A4A6A] border border-[#E8EDF2] rounded-lg text-xs font-medium">
                          +{feed.columns.length - 8} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedPreview(feed.id)}
                      disabled={previewLoading && previewFeedId === feed.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-60 transition-all"
                    >
                      {previewLoading && previewFeedId === feed.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <FileText className="w-3 h-3" />}
                      {previewFeedId === feed.id ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      onClick={() => handleFeedDisconnect(feed.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
                    >
                      <X className="w-3 h-3" />
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Editable preview for this feed */}
                {previewFeedId === feed.id && feedEditor.rows.length > 0 && (
                  <div className="mt-3">
                    <SpreadsheetGrid
                      rows={feedEditor.rows}
                      onRowsChange={feedEditor.handleRowsChange}
                      editingCol={feedEditor.editingCol}
                      setEditingCol={feedEditor.setEditingCol}
                      renamedCols={feedEditor.renamedCols}
                      onDeleteRow={feedEditor.handleDeleteRow}
                      onDeleteColumn={feedEditor.handleDeleteColumn}
                      onRenameColumn={feedEditor.handleRenameColumn}
                      onAddRow={feedEditor.handleAddRow}
                      onAddColumn={feedEditor.handleAddColumn}
                      maxHeight={350}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#4A4A6A]">
                        {feedEditor.rows.length} row{feedEditor.rows.length !== 1 ? 's' : ''} — double-click cells/headers to edit &middot; Ctrl+Z to undo
                      </span>
                      <button
                        onClick={handleSaveFeedRows}
                        className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Another Feed button */}
            <div
              className="border-2 border-dashed border-[#C0C9D5] rounded-xl p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls,.csv';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) await handleFileSelected(file);
                };
                input.click();
              }}
            >
              <Plus className="w-5 h-5 text-[#C0C9D5] mx-auto mb-1" />
              <span className="text-sm font-medium text-[#4A4A6A]">Add Another Feed</span>
            </div>
          </div>

        ) : (
          /* ── No feeds — connect prompt ── */
          <div>
            <div
              className="border-2 border-dashed border-[#C0C9D5] rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls,.csv';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) await handleFileSelected(file);
                };
                input.click();
              }}
            >
              <FileSpreadsheet className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1A1A2E] mb-1">Drop an Excel or CSV file here</p>
              <p className="text-xs text-[#4A4A6A] mb-4">
                Supported: .xlsx, .xls, .csv · Rows appear live in the parts catalog
              </p>
              <span className="inline-block px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                Choose File to Connect
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Local Connect (offline fallback) ──────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="font-bold text-[#1A1A2E] flex items-center gap-2 text-base">
              <FileSpreadsheet className="w-5 h-5 text-violet-600" />
              Local Connect
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full border border-violet-200">
                Offline Fallback
              </span>
            </h2>
            <p className="text-[#4A4A6A] text-sm mt-0.5">
              Connect an Excel/CSV file directly — no backend required. The catalog automatically uses this when the backend is offline.
            </p>
          </div>
          {localFeed && (
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0',
              localFeed.status === 'active'
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            )}>
              {localFeed.status === 'active' ? '● Saved' : '⏸ Paused'}
            </span>
          )}
        </div>

        {/* Info banner */}
        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 text-xs text-violet-800 mb-4 mt-3">
          <strong>How it works:</strong> Upload a file here to save a local snapshot. When the backend is online, the catalog loads from the database. When offline, it automatically reads this saved feed instead — no manual switching needed.
        </div>

        {localFeed ? (
          /* ── Has local feed ── */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border bg-violet-50 border-violet-200">
              <FileSpreadsheet className="w-8 h-8 flex-shrink-0 text-violet-600" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#1A1A2E] truncate">{localFeed.filename}</div>
                <div className="text-xs text-[#4A4A6A] mt-0.5">
                  {localFeed.rowCount.toLocaleString()} rows · stored in <code className="bg-white/70 px-1 rounded">public/data/excel-feed.json</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => localFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Replace
                </button>
                <button
                  onClick={handleLocalDisconnect}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
            {localFile && (
              <div className="flex items-center gap-3 p-3 bg-[#F5F7FA] rounded-xl border border-[#E8EDF2]">
                <FileSpreadsheet className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <span className="text-sm text-[#1A1A2E] flex-1 truncate">{localFile.name}</span>
                <button
                  onClick={handleLocalConnect}
                  disabled={localConnecting}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-60 transition-colors"
                >
                  {localConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {localConnecting ? 'Saving…' : 'Save as fallback'}
                </button>
                <button
                  onClick={() => { setLocalFile(null); if (localFileInputRef.current) localFileInputRef.current.value = ''; }}
                  className="p-1.5 rounded-lg hover:bg-[#E8EDF2] text-[#4A4A6A]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── No local feed — upload prompt ── */
          <div>
            <div
              className="border-2 border-dashed border-violet-200 rounded-2xl p-8 text-center hover:border-violet-400 transition-colors cursor-pointer"
              onClick={() => localFileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-10 h-10 text-violet-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1A1A2E] mb-1">Save a local fallback file</p>
              <p className="text-xs text-[#4A4A6A] mb-4">
                Supported: .xlsx, .xls, .csv · Stored offline in the frontend
              </p>
              <span className="inline-block px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors">
                Choose File
              </span>
            </div>
            {localFile && (
              <div className="mt-4 flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-violet-600" />
                  <div>
                    <div className="text-sm font-medium text-[#1A1A2E]">{localFile.name}</div>
                    <div className="text-xs text-[#4A4A6A]">{(localFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setLocalFile(null); if (localFileInputRef.current) localFileInputRef.current.value = ''; }}
                    className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleLocalConnect}
                    disabled={localConnecting}
                    className="flex items-center gap-2 px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-60 transition-colors"
                  >
                    {localConnecting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                      : <><Link className="w-4 h-4" /> Save as Fallback</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <input
          ref={localFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => setLocalFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* ── Export ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-4">Export Data</h2>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-[#4A4A6A]">Format:</span>
          {(['json', 'csv'] as ExportFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                format === f
                  ? 'bg-[#0A1628] text-white border-[#0A1628]'
                  : 'bg-white text-[#4A4A6A] border-[#C0C9D5] hover:border-[#0A1628]'
              )}
            >
              {f === 'json' ? <FileJson className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {EXPORT_TARGETS.map((target) => (
            <div key={target.key} className={cn('flex items-center justify-between p-5 rounded-2xl border', target.color)}>
              <div>
                <div className="font-semibold text-sm">{target.label}</div>
                <div className="text-xs opacity-75 mt-0.5">{target.desc}</div>
              </div>
              <button
                onClick={() => handleExport(target)}
                disabled={exporting === target.key}
                className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-semibold shadow-sm hover:shadow-md disabled:opacity-60 transition-all border border-current/20"
              >
                {exporting === target.key
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                  : <><Download className="w-4 h-4" /> Export {target.label}</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bulk Import (permanent DB write) ───────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-1">Bulk Import Parts</h2>
        <p className="text-[#4A4A6A] text-sm mb-5">
          Import CSV or JSON directly into the database (permanent)
        </p>

        {/* Industry filter */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Industry</label>
          <select
            value={importIndustry}
            onChange={e => { setImportIndustry(e.target.value); setImportCategory(''); }}
            className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
          >
            <option value="">All Industries</option>
            {categoryTree?.industries.map(ind => (
              <option key={ind.id} value={ind.slug}>{ind.name}</option>
            ))}
          </select>
        </div>

        {/* Type + Category */}
        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Type</label>
            <div className="flex gap-2">
              {(['part', 'product'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setImportType(t); setImportCategory(''); }}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium border transition-colors capitalize flex-1',
                    importType === t
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-white text-[#4A4A6A] border-[#C0C9D5] hover:border-[#4F46E5]'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-[2]">
            <label className="block text-xs font-medium text-[#4A4A6A] mb-1">Category (override)</label>
            <select
              value={importCategory}
              onChange={e => setImportCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm bg-white text-[#1A1A2E]"
            >
              <option value="">Use file&apos;s category</option>
              {importFilteredCategories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="border-2 border-dashed border-[#C0C9D5] rounded-2xl p-8 text-center hover:border-[#4F46E5] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-[#C0C9D5] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1A1A2E] mb-1">Drop your file here or click to browse</p>
          <p className="text-xs text-[#4A4A6A] mb-4">CSV or JSON — max 10 MB</p>
          <span className="inline-block px-5 py-2 bg-[#E8EDF2] rounded-xl text-sm font-medium hover:bg-[#C0C9D5] transition-colors">
            Choose File
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportResult(null); }}
          />
        </div>

        {importFile && (
          <div className="mt-4 flex items-center justify-between p-4 bg-[#F5F7FA] rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#4F46E5]" />
              <div>
                <div className="text-sm font-medium text-[#1A1A2E]">{importFile.name}</div>
                <div className="text-xs text-[#4A4A6A]">{(importFile.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setImportFile(null); setImportResult(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="p-1.5 rounded-lg hover:bg-[#E8EDF2] text-[#4A4A6A]"
              ><X className="w-4 h-4" /></button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-[#4338CA] disabled:opacity-60 transition-colors"
              >
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                  : <><RefreshCw className="w-4 h-4" /> Process Import</>}
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-4 p-4 bg-[#F5F7FA] rounded-xl space-y-3">
            <h3 className="font-semibold text-[#1A1A2E]">Import Result</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{importResult.imported} imported</span>
              </div>
              {importResult.errors > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">{importResult.errors} batch(es) failed</span>
                </div>
              )}
            </div>
            {importResult.errorRows?.length ? (
              <div className="text-xs text-red-600 space-y-1 bg-red-50 rounded-xl p-3 border border-red-100">
                {importResult.errorRows.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── Format guide ────────────────────────────────────────── */}
      <div className="bg-[#F5F7FA] rounded-2xl border border-[#E8EDF2] p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-3">File Format Guide</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-[#4A4A6A] uppercase tracking-widest mb-2">CSV / Excel — column headers:</p>
            <code className="block bg-white rounded-xl border border-[#E8EDF2] px-4 py-3 text-xs font-mono text-[#1A1A2E] overflow-x-auto">
              partNumber, nsn, cage, description, manufacturer, condition, stockStatus, quantityAvailable, unitPrice, category, fsg, fsc
            </code>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A4A6A] uppercase tracking-widest mb-2">JSON — array of objects:</p>
            <code className="block bg-white rounded-xl border border-[#E8EDF2] px-4 py-3 text-xs font-mono text-[#1A1A2E] overflow-x-auto whitespace-pre">{`[
  {
    "partNumber": "CFM56-7B-FAN-01",
    "nsn": "2840-01-123-4567",
    "cage": "81205",
    "description": "Fan blade assembly",
    "manufacturer": "CFM International",
    "condition": "New",
    "stockStatus": "In Stock",
    "quantityAvailable": 4,
    "unitPrice": 15750,
    "category": "Turbofan Engines",
    "fsg": "28",
    "fsc": "2840"
  }
]`}</code>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-[#4A4A6A]">
            <span><strong>condition:</strong> New | Used | Refurbished | Overhauled</span>
            <span>·</span>
            <span><strong>stockStatus:</strong> In Stock | On Order | Obsolete | Limited</span>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 text-xs text-blue-800">
            <strong>💡 Excel Live Feed vs Bulk Import:</strong><br />
            <span className="opacity-90">
              Live Feed — rows appear instantly in catalog, can be paused/removed, great for dynamic inventory.
              Bulk Import — permanently writes to DB, ideal for one-time migrations or final data.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
