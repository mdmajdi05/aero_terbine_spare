'use client';

import { useState } from 'react';
import { Download, FileJson, FileText, Archive, Loader2, CheckCircle, Shield } from 'lucide-react';
import { request } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const rows    = data.map((row) =>
    headers.map((h) => {
      const v   = row[h];
      const str = typeof v === 'object' ? JSON.stringify(v) : String(v ?? '');
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

interface ExportItem {
  key: string;
  label: string;
  endpoint: string;
  desc: string;
  color: string;
  rowKey?: string;
}

const EXPORT_ITEMS: ExportItem[] = [
  { key: 'users',     label: 'Users',      endpoint: '/admin/export/users',  desc: 'All accounts (no passwords)',              color: 'border-blue-800/40 bg-blue-900/20',    rowKey: 'data' },
  { key: 'rfqs',      label: 'RFQs',       endpoint: '/admin/export/rfqs',   desc: 'All quotation requests with status',       color: 'border-orange-800/40 bg-orange-900/20', rowKey: 'data' },
  { key: 'parts',     label: 'Parts',      endpoint: '/admin/export/parts',  desc: 'Full catalog with specs & pricing',         color: 'border-emerald-800/40 bg-emerald-900/20', rowKey: 'data' },
];

export default function MasterExportPage() {
  const [format,       setFormat]       = useState<'json' | 'csv'>('json');
  const [exporting,    setExporting]    = useState<string | null>(null);
  const [masterBusy,   setMasterBusy]   = useState(false);
  const [masterDone,   setMasterDone]   = useState(false);

  const handleSingle = async (item: ExportItem) => {
    setExporting(item.key);
    try {
      const res = await request<{ success: boolean; data: Record<string, unknown>[] }>(`${item.endpoint}?format=${format}`);
      const ts  = new Date().toISOString().slice(0, 10);
      const rows = Array.isArray(res.data) ? res.data : [];
      if (format === 'json') downloadJSON(rows, `ats_${item.key}_${ts}.json`);
      else downloadCSV(rows as Record<string, unknown>[], `ats_${item.key}_${ts}.csv`);
      toast.success(`${item.label} exported`);
    } catch {
      toast.error(`Export failed: ${item.label}`);
    } finally {
      setExporting(null);
    }
  };

  const handleMasterExport = async () => {
    setMasterBusy(true);
    setMasterDone(false);
    try {
      const res = await request<{ success: boolean; data: Record<string, unknown> }>('/superadmin/export/master');
      const ts  = new Date().toISOString().slice(0, 10);
      downloadJSON(res.data, `aeroturbinespare_MASTER_EXPORT_${ts}.json`);
      setMasterDone(true);
      toast.success('Master export complete — JSON downloaded');
    } catch {
      toast.error('Master export failed');
    } finally {
      setMasterBusy(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Master Export</h1>
        <p className="text-purple-300/50 text-sm mt-0.5">
          Download a complete dump of all system data — restricted to Super Admin
        </p>
      </div>

      {/* Master export hero */}
      <div className="bg-gradient-to-br from-purple-900/40 to-[#13132B] rounded-2xl border border-purple-600/30 p-8 flex flex-col items-center text-center gap-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Super Admin Only</span>
        </div>
        <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center">
          <Archive className="w-10 h-10 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Full System Data Export</h2>
          <p className="text-purple-300/50 text-sm mt-1 max-w-md">
            Downloads all users, parts, RFQs, orders, inventory submissions, and audit logs into a single structured JSON file.
          </p>
        </div>

        {masterDone ? (
          <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/30 rounded-xl px-6 py-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Export downloaded successfully</span>
          </div>
        ) : (
          <button
            onClick={handleMasterExport}
            disabled={masterBusy}
            className="flex items-center gap-2.5 px-10 py-3.5 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-60 transition-all shadow-xl shadow-purple-900/40"
          >
            {masterBusy ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Export…</>
            ) : (
              <><Download className="w-5 h-5" /> Download Master Export (JSON)</>
            )}
          </button>
        )}

        <div className="grid grid-cols-3 gap-4 w-full mt-2">
          {[
            { label: 'Users',       value: '7 accounts'    },
            { label: 'Parts',       value: '55 products'   },
            { label: 'Audit Logs',  value: '40+ entries'   },
          ].map(({ label, value }) => (
            <div key={label} className="bg-purple-900/20 rounded-xl px-3 py-2.5 text-center">
              <div className="text-xs text-purple-300/40">{label}</div>
              <div className="text-sm font-bold text-purple-200 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual exports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300/50">Individual Exports</h2>
          <div className="flex items-center gap-2">
            {(['json', 'csv'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  format === f
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-[#1A1A35] border-purple-900/40 text-purple-300/60 hover:text-white'
                )}
              >
                {f === 'json' ? <FileJson className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {EXPORT_ITEMS.map((item) => (
            <div
              key={item.key}
              className={cn('flex items-center justify-between px-5 py-4 rounded-2xl border', item.color)}
            >
              <div>
                <div className="font-semibold text-white text-sm">{item.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
              </div>
              <button
                onClick={() => handleSingle(item)}
                disabled={exporting === item.key}
                className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-xs font-semibold disabled:opacity-60 transition-all"
              >
                {exporting === item.key ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                ) : (
                  <><Download className="w-4 h-4" /> Export {item.label} {format.toUpperCase()}</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 bg-yellow-900/15 border border-yellow-800/25 rounded-2xl px-5 py-4">
        <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/60">
          All exports are logged in the Audit Log. Master exports contain sensitive business data — store securely and share only with authorized personnel. User passwords are never included in any export.
        </p>
      </div>
    </div>
  );
}
