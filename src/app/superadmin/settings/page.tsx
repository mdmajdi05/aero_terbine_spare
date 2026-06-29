'use client';

import { useEffect, useState } from 'react';
import { Save, RefreshCw, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { request } from '@/lib/api-client';
import type { SystemSettings } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function SAField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-purple-300/30 mt-1.5">{hint}</p>}
    </div>
  );
}

function SAToggle({ value, onChange, label, danger }: { value: boolean; onChange: (v: boolean) => void; label: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1A1A35] rounded-xl border border-purple-900/30">
      <span className={cn('text-sm font-medium', danger ? 'text-red-300' : 'text-white/80')}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={cn('w-12 h-6 rounded-full transition-colors relative focus:outline-none', value ? (danger ? 'bg-red-500' : 'bg-purple-600') : 'bg-white/10')}
      >
        <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform', value ? 'left-7' : 'left-1')} />
      </button>
    </div>
  );
}

export default function SystemSettingsPage() {
  const [settings,     setSettings]     = useState<SystemSettings | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [showSecret,   setShowSecret]   = useState(false);
  const [cloudTest,    setCloudTest]    = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    request<{ success: boolean; data: SystemSettings }>('/superadmin/settings')
      .then((res) => setSettings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await request('/superadmin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      toast.success('System settings saved');
      setSaved(true);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-purple-300/50 text-sm mt-0.5">Global platform configuration — Super Admin only</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-800/30 rounded-xl px-5 py-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">Settings saved successfully</span>
        </div>
      )}

      {/* General */}
      <section className="bg-[#13132B] rounded-2xl border border-purple-900/30 p-6 space-y-5">
        <h2 className="font-bold text-white mb-2">General</h2>

        <div className="grid grid-cols-2 gap-5">
          <SAField label="Site Name">
            <input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
          <SAField label="Site URL">
            <input value={settings.siteUrl} onChange={(e) => update('siteUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
        </div>

        <SAField label="RFQ Notification Email" hint="All new RFQs are forwarded here">
          <input type="email" value={settings.rfqEmailRecipient} onChange={(e) => update('rfqEmailRecipient', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
        </SAField>

        <div className="grid grid-cols-2 gap-5">
          <SAField label="Max RFQs Per Day" hint="Per IP address rate limit">
            <input type="number" value={settings.maxRFQsPerDay} onChange={(e) => update('maxRFQsPerDay', parseInt(e.target.value) || 50)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
          <SAField label="Session Timeout (minutes)">
            <input type="number" value={settings.sessionTimeoutMinutes} onChange={(e) => update('sessionTimeoutMinutes', parseInt(e.target.value) || 60)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SAToggle label="Allow New User Registration" value={settings.allowRegistration} onChange={(v) => update('allowRegistration', v)} />
          <SAToggle label="Enable Audit Logging" value={settings.enableAuditLogging} onChange={(v) => update('enableAuditLogging', v)} />
          <SAToggle label="Maintenance Mode" value={settings.maintenanceMode} onChange={(v) => update('maintenanceMode', v)} danger />
        </div>
      </section>

      {/* SMTP */}
      <section className="bg-[#13132B] rounded-2xl border border-purple-900/30 p-6 space-y-5">
        <h2 className="font-bold text-white mb-2">SMTP / Email</h2>
        <div className="grid grid-cols-2 gap-5">
          <SAField label="SMTP Host">
            <input value={settings.smtpHost} onChange={(e) => update('smtpHost', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
          <SAField label="SMTP Port">
            <input type="number" value={settings.smtpPort} onChange={(e) => update('smtpPort', parseInt(e.target.value) || 587)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
          <SAField label="SMTP Username / API Key">
            <input value={settings.smtpUser} onChange={(e) => update('smtpUser', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
        </div>
      </section>

      {/* Data & Backup */}
      <section className="bg-[#13132B] rounded-2xl border border-purple-900/30 p-6 space-y-5">
        <h2 className="font-bold text-white mb-2">Data & Backup</h2>
        <div className="grid grid-cols-2 gap-5">
          <SAField label="Backup Schedule">
            <select value={settings.backupSchedule} onChange={(e) => update('backupSchedule', e.target.value as SystemSettings['backupSchedule'])}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="manual">Manual Only</option>
            </select>
          </SAField>
          <SAField label="Data Retention (days)" hint="Older audit logs are purged automatically">
            <input type="number" value={settings.dataRetentionDays} onChange={(e) => update('dataRetentionDays', parseInt(e.target.value) || 365)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/50" />
          </SAField>
        </div>
      </section>

      {/* Cloudinary / Media Storage */}
      <section className="bg-[#13132B] rounded-2xl border border-purple-900/30 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-white mb-0.5">Media Storage — Cloudinary</h2>
            <p className="text-xs text-purple-300/40">
              All blog images are uploaded to Cloudinary and auto-optimised (WebP, quality auto).
              Get your keys from{' '}
              <a href="https://cloudinary.com/console" target="_blank" rel="noopener noreferrer"
                className="text-purple-400 underline underline-offset-2 hover:text-purple-300">
                cloudinary.com/console
              </a>
            </p>
          </div>
          {/* Test connection button */}
          <button
            type="button"
            disabled={cloudTest === 'testing' || !settings.cloudinaryCloudName}
            onClick={async () => {
              setCloudTest('testing');
              try {
                const res = await request<{ success: boolean }>(
                  '/superadmin/settings/cloudinary-test',
                  { method: 'POST' },
                );
                setCloudTest(res.success ? 'ok' : 'fail');
              } catch {
                setCloudTest('fail');
              }
              setTimeout(() => setCloudTest('idle'), 4000);
            }}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 ml-4',
              cloudTest === 'ok'      ? 'bg-emerald-700 text-white' :
              cloudTest === 'fail'    ? 'bg-red-700 text-white' :
              cloudTest === 'testing' ? 'bg-purple-900/40 text-purple-300' :
                                        'bg-purple-900/40 hover:bg-purple-800/50 text-purple-300',
            )}
          >
            {cloudTest === 'testing' ? 'Testing…' : cloudTest === 'ok' ? '✓ Connected' : cloudTest === 'fail' ? '✕ Failed' : 'Test Connection'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SAField label="Cloud Name" hint="e.g. my-cloud-123">
            <input
              value={settings.cloudinaryCloudName ?? ''}
              onChange={(e) => update('cloudinaryCloudName', e.target.value)}
              placeholder="your_cloud_name"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/50 placeholder:text-purple-300/20"
            />
          </SAField>

          <SAField label="API Key" hint="From Cloudinary Dashboard → API Keys">
            <input
              value={settings.cloudinaryApiKey ?? ''}
              onChange={(e) => update('cloudinaryApiKey', e.target.value)}
              placeholder="123456789012345"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/50 placeholder:text-purple-300/20"
            />
          </SAField>
        </div>

        <SAField label="API Secret" hint="Keep this private — never share it publicly">
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={settings.cloudinaryApiSecret ?? ''}
              onChange={(e) => update('cloudinaryApiSecret', e.target.value)}
              placeholder="••••••••••••••••••••••"
              className="w-full px-4 py-2.5 pr-11 rounded-xl border border-purple-900/40 bg-[#1A1A35] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-600/50 placeholder:text-purple-300/20"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/40 hover:text-purple-300 transition-colors"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </SAField>

        {/* Status pill */}
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
          settings.cloudinaryCloudName
            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30'
            : 'bg-yellow-900/20 text-yellow-500 border border-yellow-800/20',
        )}>
          <span className={cn('w-1.5 h-1.5 rounded-full', settings.cloudinaryCloudName ? 'bg-emerald-400' : 'bg-yellow-500')} />
          {settings.cloudinaryCloudName ? 'Cloudinary configured' : 'Not configured — blog image upload will fail'}
        </div>
      </section>

      {/* Meta */}
      <div className="text-xs text-purple-300/30 text-right">
        Last updated: {new Date(settings.updatedAt).toLocaleString()} by {settings.updatedBy}
      </div>

      {/* Danger zone */}
      <section className="bg-red-950/20 rounded-2xl border border-red-900/30 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold text-red-300">Danger Zone</h2>
            <p className="text-xs text-red-300/50 mt-0.5">These actions are irreversible. Proceed with caution.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-red-800/40 bg-red-900/20 text-red-300 text-sm font-medium hover:bg-red-900/40 transition-colors">
            Clear All Sessions
          </button>
          <button className="px-5 py-2.5 rounded-xl border border-red-800/40 bg-red-900/20 text-red-300 text-sm font-medium hover:bg-red-900/40 transition-colors">
            Purge Audit Logs
          </button>
        </div>
      </section>
    </div>
  );
}
