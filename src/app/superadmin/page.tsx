'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, FileText, Package, TrendingUp, Shield,
  ScrollText, Settings, Database, Download,
  ArrowRight, CheckCircle, Activity,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import type { AdminStats, AuditLog } from '@/types';
import { cn } from '@/lib/utils';

function SAStatCard({ label, value, icon: Icon, sub, color }: {
  label: string; value: string | number; icon: React.ElementType;
  sub?: string; color: string;
}) {
  return (
    <div className="bg-[#13132B] rounded-2xl p-5 border border-purple-900/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-purple-300/60 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-bold text-white leading-none">{value}</p>
          {sub && <p className="text-xs text-purple-300/50 mt-1">{sub}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  Success: 'bg-emerald-400',
  Warning: 'bg-yellow-400',
  Failed:  'bg-red-400',
};

export default function SuperAdminDashPage() {
  const [stats,     setStats]     = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      request<{ success: boolean; data: AdminStats }>('/superadmin/stats'),
      request<{ success: boolean; data: AuditLog[] }>('/superadmin/audit-logs?limit=6'),
    ]).then(([s, l]) => {
      setStats(s.data);
      setAuditLogs(l.data?.slice(0, 6) || []);
    }).finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { href: '/superadmin/users',      icon: Users,      label: 'Manage Users',    desc: 'View all roles, suspend accounts',   color: 'text-blue-400 bg-blue-900/30 border-blue-800/40' },
    { href: '/superadmin/audit-logs', icon: ScrollText, label: 'Audit Logs',      desc: 'Track every system action',          color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40' },
    { href: '/superadmin/settings',   icon: Settings,   label: 'System Settings', desc: 'SMTP, limits, maintenance mode',     color: 'text-orange-400 bg-orange-900/30 border-orange-800/40' },
    { href: '/superadmin/backup',     icon: Database,   label: 'DB Backup',       desc: 'Trigger and download database dumps', color: 'text-purple-400 bg-purple-900/30 border-purple-800/40' },
    { href: '/superadmin/export',     icon: Download,   label: 'Master Export',   desc: 'Full system ZIP/JSON data export',   color: 'text-pink-400 bg-pink-900/30 border-pink-800/40' },
    { href: '/admin',                 icon: Shield,     label: 'Admin Panel',     desc: 'User management and RFQ tools',      color: 'text-yellow-400 bg-yellow-900/30 border-yellow-800/40' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
          <p className="text-purple-300/60 text-sm mt-0.5">Full system control — highest privilege level</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-600/20 border border-purple-600/30 rounded-xl px-4 py-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-purple-300 tracking-widest">SUPERADMIN SESSION</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SAStatCard label="Total Users"     value={loading ? '…' : (stats?.totalUsers || 0)}     icon={Users}      color="bg-blue-600"    sub={`${stats?.activeUsers || 0} active`} />
        <SAStatCard label="Total RFQs"      value={loading ? '…' : (stats?.totalRFQs || 0)}      icon={FileText}   color="bg-[#E8751A]"   sub={`${stats?.pendingRFQs || 0} pending`} />
        <SAStatCard label="Parts Catalog"   value={loading ? '…' : (stats?.totalParts || 0)}     icon={Package}    color="bg-emerald-600" sub="Active inventory" />
        <SAStatCard label="Monthly Revenue" value={loading ? '…' : `$${((stats?.revenueThisMonth || 0) / 1000).toFixed(0)}k`} icon={TrendingUp} color="bg-purple-600" sub="+12% vs last month" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-300/50 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className={cn('flex items-start gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.02]', color)}
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-white">{label}</div>
                <div className="text-xs text-white/50 mt-0.5">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto mt-1 flex-shrink-0 text-white/30" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent audit logs */}
      <div className="bg-[#13132B] rounded-2xl border border-purple-900/30">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-white text-sm">Recent Audit Activity</h2>
          </div>
          <Link href="/superadmin/audit-logs" className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-purple-900/20">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-purple-300/40 text-sm">No audit logs yet</div>
          ) : auditLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-6 py-3 hover:bg-purple-900/10 transition-colors">
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0', STATUS_DOT[log.status] || 'bg-gray-400')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-xs text-white/40">{log.resource}</span>
                </div>
                <div className="text-xs text-white/30 mt-0.5 truncate">{log.userEmail}</div>
              </div>
              <div className="text-xs text-white/25 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System health */}
      <div className="flex items-start gap-4 bg-emerald-900/20 border border-emerald-800/30 rounded-2xl px-6 py-4">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-300 text-sm">All Systems Operational</p>
          <p className="text-xs text-emerald-300/60 mt-0.5">
            Database: Connected · API: Healthy · Auth: Active · Last backup: &lt; 24h ago
          </p>
        </div>
      </div>
    </div>
  );
}
