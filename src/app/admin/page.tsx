'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, FileText, Package, TrendingUp, Clock,
  CheckCircle, AlertTriangle, ArrowRight, RefreshCw,
} from 'lucide-react';
import { request } from '@/lib/api-client';
import type { AdminStats, RFQ } from '@/types';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

function StatCard({
  label, value, icon: Icon, color, sub, loading,
}: {
  label: string; value: string | number; icon: React.ElementType;
  color: string; sub?: string; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E8EDF2] shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-[#4A4A6A] uppercase tracking-widest mb-1">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-24 mb-1" />
          ) : (
            <p className="text-3xl font-bold text-[#1A1A2E] leading-none">{value}</p>
          )}
          {sub && <p className="text-xs text-[#4A4A6A] mt-1">{sub}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function RFQStatusBadge({ status }: { status: RFQ['status'] }) {
  const map: Record<string, string> = {
    Pending:      'bg-yellow-100 text-yellow-800',
    'Under Review':'bg-blue-100 text-blue-800',
    Quoted:       'bg-purple-100 text-purple-800',
    Accepted:     'bg-emerald-100 text-emerald-800',
    Ordered:      'bg-green-100 text-green-800',
    Cancelled:    'bg-red-100 text-red-800',
  };
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', map[status] || 'bg-gray-100 text-gray-600')}>
      {status}
    </span>
  );
}

export default function AdminDashboardPage() {
  const [stats,       setStats]       = useState<AdminStats | null>(null);
  const [recentRFQs,  setRecentRFQs]  = useState<RFQ[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [statsRes, rfqsRes] = await Promise.all([
        request<{ success: boolean; data: AdminStats }>('/admin/stats'),
        request<{ success: boolean; data: RFQ[] }>('/admin/rfqs?limit=8'),
      ]);
      setStats(statsRes.data);
      setRecentRFQs(rfqsRes.data?.slice(0, 8) || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Admin Dashboard</h1>
          <p className="text-[#4A4A6A] text-sm mt-0.5">Platform overview and management</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8EDF2] rounded-xl text-sm font-medium text-[#4A4A6A] hover:border-[#C0C9D5] transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={stats?.totalUsers || 0}     icon={Users}      color="bg-[#0A1628]" sub={`${stats?.activeUsers || 0} active`}        loading={loading} />
        <StatCard label="Total RFQs"      value={stats?.totalRFQs  || 0}     icon={FileText}   color="bg-[#E8751A]" sub={`${stats?.pendingRFQs || 0} pending`}       loading={loading} />
        <StatCard label="Parts in Catalog"value={stats?.totalParts || 0}     icon={Package}    color="bg-[#00A651]" sub="Active inventory"                            loading={loading} />
        <StatCard label="Monthly Revenue" value={`$${((stats?.revenueThisMonth || 0) / 1000).toFixed(0)}k`} icon={TrendingUp} color="bg-purple-600" sub="+12% vs last month" loading={loading} />
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/users',  icon: Users,    label: 'Manage Users',    desc: 'View, edit, suspend accounts',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
          { href: '/admin/rfqs',   icon: FileText, label: 'Review RFQs',     desc: 'Update statuses & quotes',      color: 'bg-orange-50 text-[#E8751A] border-orange-200' },
          { href: '/admin/export', icon: TrendingUp,label:'Export Data',     desc: 'CSV/JSON export & bulk import', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            className={cn('flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-md', color)}
          >
            <div className="w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-xs opacity-75 mt-0.5">{desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent RFQs */}
      <div className="bg-white rounded-2xl border border-[#E8EDF2] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EDF2]">
          <h2 className="font-bold text-[#1A1A2E]">Recent RFQs</h2>
          <Link href="/admin/rfqs" className="text-xs font-medium text-[#E8751A] hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : recentRFQs.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle className="w-10 h-10 text-[#C0C9D5] mx-auto mb-3" />
            <p className="text-[#4A4A6A]">No RFQs yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EDF2]">
                  {['RFQ ID', 'Company', 'Contact', 'Items', 'Urgency', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-widest text-[#4A4A6A]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map((rfq) => (
                  <tr key={rfq.id} className="border-b border-[#E8EDF2] hover:bg-[#F5F7FA] transition-colors">
                    <td className="px-6 py-3 font-mono text-xs text-[#E8751A] font-medium">{rfq.id}</td>
                    <td className="px-6 py-3 font-medium text-[#1A1A2E] max-w-32 truncate">{rfq.companyName}</td>
                    <td className="px-6 py-3 text-[#4A4A6A] max-w-32 truncate">{rfq.contactName}</td>
                    <td className="px-6 py-3 text-[#4A4A6A]">{rfq.items?.length || 0} part(s)</td>
                    <td className="px-6 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        rfq.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                        rfq.urgency === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {rfq.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-3"><RFQStatusBadge status={rfq.status} /></td>
                    <td className="px-6 py-3 text-[#4A4A6A] text-xs whitespace-nowrap">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/rfqs`} className="text-xs text-[#E8751A] hover:underline font-medium">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts */}
      {stats && stats.pendingRFQs > 0 && (
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Action Required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              {stats.pendingRFQs} RFQ{stats.pendingRFQs > 1 ? 's' : ''} awaiting review.{' '}
              <Link href="/admin/rfqs" className="underline font-medium">Review now</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
