'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Filter, ScrollText } from 'lucide-react';
import { request } from '@/lib/api-client';
import type { AuditLog } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<string, string> = {
  Success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/30',
  Warning: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/30',
  Failed:  'bg-red-900/40 text-red-300 border border-red-700/30',
};

const ACTION_BADGE: Record<string, string> = {
  LOGIN:          'bg-blue-900/30 text-blue-300',
  LOGOUT:         'bg-gray-900/30 text-gray-400',
  REGISTER:       'bg-teal-900/30 text-teal-300',
  SUBMIT_RFQ:     'bg-orange-900/30 text-orange-300',
  UPDATE_USER:    'bg-purple-900/30 text-purple-300',
  SUSPEND_USER:   'bg-red-900/30 text-red-300',
  MASTER_EXPORT:  'bg-pink-900/30 text-pink-300',
  UPDATE_SETTINGS:'bg-indigo-900/30 text-indigo-300',
  TRIGGER_BACKUP: 'bg-cyan-900/30 text-cyan-300',
  CHANGE_ROLE:    'bg-violet-900/30 text-violet-300',
};

const ACTIONS = ['', 'LOGIN', 'LOGOUT', 'REGISTER', 'SUBMIT_RFQ', 'UPDATE_USER', 'SUSPEND_USER',
  'MASTER_EXPORT', 'UPDATE_SETTINGS', 'TRIGGER_BACKUP', 'CHANGE_ROLE'];

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [action,  setAction]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), ...(action && { action }) });
      const res = await request<{ success: boolean; data: AuditLog[]; pagination: { total: number } }>(`/superadmin/audit-logs?${qs}`);
      let data = res.data || [];
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((l) => l.userEmail.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q));
      }
      if (status) data = data.filter((l) => l.status === status);
      setLogs(data);
      setTotal(res.pagination?.total || data.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, action, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-purple-300/50 text-sm mt-0.5">
            {total} total log entries — every user action tracked
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-600/30 rounded-xl text-xs font-medium text-purple-300 hover:bg-purple-600/30 transition-colors"
        >
          Export JSON
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Successful',  value: logs.filter((l) => l.status === 'Success').length, color: 'text-emerald-400' },
          { label: 'Warnings',    value: logs.filter((l) => l.status === 'Warning').length, color: 'text-yellow-400' },
          { label: 'Failed',      value: logs.filter((l) => l.status === 'Failed').length,  color: 'text-red-400'    },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#13132B] border border-purple-900/30 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-purple-300/50">{label}</span>
            <span className={cn('text-2xl font-bold', color)}>{value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/40" />
          <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by email, action, resource…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm placeholder:text-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-600/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400/40" />
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/50">
            {ACTIONS.map((a) => <option key={a} value={a}>{a || 'All Actions'}</option>)}
          </select>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600/50">
            <option value="">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-purple-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Log table */}
      <div className="bg-[#13132B] rounded-2xl border border-purple-900/30 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 bg-purple-900/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <ScrollText className="w-12 h-12 text-purple-900/40 mx-auto mb-3" />
            <p className="text-purple-300/40 text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-900/30 bg-purple-900/20">
                  {['Timestamp', 'User', 'Role', 'Action', 'Resource', 'IP', 'Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-purple-300/40">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                    <td className="px-5 py-2.5 text-purple-200/40 text-xs whitespace-nowrap font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="text-xs text-white/70 truncate max-w-36">{log.userEmail}</div>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="text-xs text-purple-300/60">{log.userRole}</span>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={cn('text-xs font-mono font-bold px-2 py-0.5 rounded', ACTION_BADGE[log.action] || 'bg-gray-900/30 text-gray-400')}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-purple-200/50 text-xs">{log.resource}</td>
                    <td className="px-5 py-2.5 text-purple-200/30 text-xs font-mono">{log.ipAddress}</td>
                    <td className="px-5 py-2.5">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', STATUS_BADGE[log.status] || 'bg-gray-900/30 text-gray-400')}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-purple-900/30">
            <span className="text-xs text-purple-300/40">
              Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
            </span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-purple-900/30 disabled:opacity-30 text-purple-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-purple-900/30 disabled:opacity-30 text-purple-400">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
