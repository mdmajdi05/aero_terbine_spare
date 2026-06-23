'use client';

import { useEffect, useState } from 'react';
import { Database, Download, RefreshCw, CheckCircle, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { request } from '@/lib/api-client';
import type { BackupRecord } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const STATUS_STYLES: Record<string, string> = {
  Complete: 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/30',
  Running:  'bg-blue-900/30 text-blue-300 border border-blue-700/30',
  Failed:   'bg-red-900/30 text-red-300 border border-red-700/30',
};

export default function BackupPage() {
  const [backups,   setBackups]   = useState<BackupRecord[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [triggering, setTriggering] = useState(false);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await request<{ success: boolean; data: BackupRecord[] }>('/superadmin/backup/list');
      setBackups(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBackups(); }, []);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await request<{ success: boolean; data: BackupRecord; message: string }>('/superadmin/backup/trigger', { method: 'POST' });
      toast.success(res.message || 'Backup completed');
      await loadBackups();
    } catch {
      toast.error('Backup failed');
    } finally {
      setTriggering(false);
    }
  };

  const handleDownload = (backup: BackupRecord) => {
    // In mock mode generate a JSON blob of placeholder data
    const blob = new Blob([JSON.stringify({ backupId: backup.id, createdAt: backup.createdAt, note: 'Mock backup export' }, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `backup_${backup.id}_${backup.createdAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup file downloaded');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Database Backup</h1>
        <p className="text-purple-300/50 text-sm mt-0.5">Trigger manual backups and manage your backup history</p>
      </div>

      {/* Trigger card */}
      <div className="bg-[#13132B] rounded-2xl border border-purple-900/30 p-8 flex flex-col items-center text-center gap-5">
        <div className="w-20 h-20 rounded-full bg-purple-600/20 border border-purple-600/30 flex items-center justify-center">
          <Database className="w-10 h-10 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Trigger Manual Backup</h2>
          <p className="text-purple-300/50 text-sm mt-1 max-w-sm">
            Creates a full snapshot of all database tables — users, parts, RFQs, orders, inventory, and audit logs.
          </p>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="flex items-center gap-2.5 px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60 transition-all shadow-lg shadow-purple-900/30"
        >
          {triggering ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Creating Backup…</>
          ) : (
            <><Database className="w-5 h-5" /> Start Backup Now</>
          )}
        </button>
        <p className="text-xs text-purple-300/30">
          Backup is compressed and encrypted at rest. Estimated size: 3–6 MB.
        </p>
      </div>

      {/* Schedule info */}
      <div className="flex items-start gap-4 bg-purple-900/20 border border-purple-900/30 rounded-2xl px-6 py-4">
        <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-purple-200 text-sm">Automated Schedule</p>
          <p className="text-xs text-purple-300/50 mt-0.5">
            Configured in System Settings — currently set to <strong className="text-purple-300">Daily</strong>.
            Change under <a href="/superadmin/settings" className="text-purple-400 hover:text-purple-300 underline">System Settings → Backup Schedule</a>.
          </p>
        </div>
      </div>

      {/* Backup history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-sm uppercase tracking-widest">Backup History</h2>
          <button onClick={loadBackups} className="p-2 rounded-lg border border-purple-900/40 bg-[#1A1A35] text-purple-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-purple-900/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="py-12 text-center bg-[#13132B] rounded-2xl border border-purple-900/30">
            <Database className="w-12 h-12 text-purple-900/40 mx-auto mb-3" />
            <p className="text-purple-300/40 text-sm">No backups yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="bg-[#13132B] border border-purple-900/30 rounded-xl px-5 py-4 flex items-center gap-4">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                  backup.status === 'Complete' ? 'bg-emerald-900/30' :
                  backup.status === 'Running'  ? 'bg-blue-900/30'    : 'bg-red-900/30'
                )}>
                  {backup.status === 'Complete' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                   backup.status === 'Running'  ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> :
                                                  <AlertTriangle className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-300/60">{backup.id}</span>
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', STATUS_STYLES[backup.status])}>
                      {backup.status}
                    </span>
                    <span className="text-xs text-purple-300/30 capitalize">{backup.type}</span>
                  </div>
                  <div className="text-xs text-purple-300/40 mt-0.5">
                    Triggered by {backup.triggeredBy} · {new Date(backup.createdAt).toLocaleString()}
                    {backup.sizeBytes && ` · ${formatBytes(backup.sizeBytes)}`}
                  </div>
                </div>
                {backup.status === 'Complete' && (
                  <button
                    onClick={() => handleDownload(backup)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/20 border border-purple-600/30 text-purple-300 rounded-xl text-xs font-medium hover:bg-purple-600/40 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-yellow-900/15 border border-yellow-800/25 rounded-2xl px-5 py-4">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-300/60">
          Backup files are temporary links valid for 24 hours. Store your downloaded backups in a secure location. In production, configure S3 or equivalent cloud storage.
        </p>
      </div>
    </div>
  );
}
