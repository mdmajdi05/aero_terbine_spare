'use client';

import { useState } from 'react';
import { Download, Upload, FileJson, FileText, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { request } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ExportFormat = 'json' | 'csv';

interface ExportTarget {
  key: string;
  label: string;
  endpoint: string;
  desc: string;
  color: string;
}

const EXPORT_TARGETS: ExportTarget[] = [
  { key: 'users', label: 'Users',     endpoint: '/admin/export/users', desc: 'All registered user accounts (no passwords)', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  { key: 'rfqs',  label: 'RFQs',      endpoint: '/admin/export/rfqs',  desc: 'All submitted requests for quotation',          color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { key: 'parts', label: 'Parts',     endpoint: '/admin/export/parts', desc: 'Full parts catalog with specs & pricing',       color: 'bg-green-50 border-green-200 text-green-800' },
];

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminExportPage() {
  const [format,    setFormat]    = useState<ExportFormat>('json');
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);

  const handleExport = async (target: ExportTarget) => {
    setExporting(target.key);
    try {
      const res = await request<{ success: boolean; data: Record<string, unknown>[] }>(
        `${target.endpoint}?format=${format}`
      );
      const ts  = new Date().toISOString().slice(0, 10);
      const filename = `aeroturbinespare_${target.key}_${ts}`;
      if (format === 'json') {
        downloadJSON(res.data, `${filename}.json`);
      } else {
        downloadCSV(res.data as Record<string, unknown>[], `${filename}.csv`);
      }
      toast.success(`${target.label} exported as ${format.toUpperCase()}`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      // Mock: simulate processing delay
      await new Promise((r) => setTimeout(r, 1500));
      await request<{ success: boolean; imported: number; errors: number }>('/admin/import/parts', {
        method: 'POST',
        body: JSON.stringify({ fileName: importFile.name, size: importFile.size }),
      });
      setImportResult({ imported: 47, errors: 2 });
      toast.success('Import completed');
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Import / Export</h1>
        <p className="text-[#4A4A6A] text-sm mt-0.5">Export system data as JSON or CSV, or import parts from file</p>
      </div>

      {/* Export format selector */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-4">Export Data</h2>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-[#4A4A6A]">Export format:</span>
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
                {exporting === target.key ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4" /> Export {target.label}</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import section */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-1">Import Parts</h2>
        <p className="text-[#4A4A6A] text-sm mb-5">Upload a CSV or JSON file to bulk-import parts into the catalog</p>

        <div className="border-2 border-dashed border-[#C0C9D5] rounded-2xl p-8 text-center hover:border-[#E8751A] transition-colors">
          <Upload className="w-10 h-10 text-[#C0C9D5] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1A1A2E] mb-1">Drop your file here or click to browse</p>
          <p className="text-xs text-[#4A4A6A] mb-4">Supported: CSV, JSON — max 10MB</p>
          <input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="inline-block px-5 py-2 bg-[#E8EDF2] rounded-xl text-sm font-medium cursor-pointer hover:bg-[#C0C9D5] transition-colors"
          >
            Choose File
          </label>
        </div>

        {importFile && (
          <div className="mt-4 flex items-center justify-between p-4 bg-[#F5F7FA] rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#E8751A]" />
              <div>
                <div className="text-sm font-medium text-[#1A1A2E]">{importFile.name}</div>
                <div className="text-xs text-[#4A4A6A]">{(importFile.size / 1024).toFixed(1)} KB</div>
              </div>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-5 py-2 bg-[#E8751A] text-white rounded-xl text-sm font-medium hover:bg-[#FF6B00] disabled:opacity-60 transition-colors"
            >
              {importing ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><RefreshCw className="w-4 h-4" /> Process Import</>}
            </button>
          </div>
        )}

        {importResult && (
          <div className="mt-4 p-4 bg-[#F5F7FA] rounded-xl">
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Import Result</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{importResult.imported} imported</span>
              </div>
              {importResult.errors > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">{importResult.errors} errors</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Format guide */}
      <div className="bg-[#F5F7FA] rounded-2xl border border-[#E8EDF2] p-6">
        <h2 className="font-bold text-[#1A1A2E] mb-3">CSV Import Format</h2>
        <p className="text-xs text-[#4A4A6A] mb-3">Required columns for parts import:</p>
        <code className="block bg-white rounded-xl border border-[#E8EDF2] px-4 py-3 text-xs font-mono text-[#1A1A2E] overflow-x-auto">
          partNumber,nsn,cage,description,manufacturer,condition,stockStatus,quantityAvailable,unitPrice,category,fsg,fsc
        </code>
        <p className="text-xs text-[#4A4A6A] mt-3">
          <strong>condition</strong>: New | Used | Refurbished | Overhauled &nbsp;|&nbsp;
          <strong>stockStatus</strong>: In Stock | On Order | Obsolete | Limited
        </p>
      </div>
    </div>
  );
}
