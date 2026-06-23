'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, Package,
  Download, Settings, ChevronRight, LogOut,
  Shield, Bell, Palette,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ADMIN_NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard',      exact: true },
  { href: '/admin/users',      icon: Users,           label: 'User Management' },
  { href: '/admin/rfqs',       icon: FileText,        label: 'RFQ Management'  },
  { href: '/admin/parts',      icon: Package,         label: 'Parts Catalog'   },
  { href: '/admin/branding',   icon: Palette,         label: 'Branding & Hero' },
  { href: '/admin/export',     icon: Download,        label: 'Import / Export' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isSuperAdmin, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (!isAdmin() && !isSuperAdmin()))) {
      router.replace('/unauthorized');
    }
  }, [user, loading, isAdmin, isSuperAdmin, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin() && !isSuperAdmin()) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/');
  };

  const currentNavLabel = ADMIN_NAV.find(
    (n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href))
  )?.label || 'Admin';

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-[#0A1628] text-white flex flex-col fixed top-0 left-0 h-full z-30">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">AeroTurbineSpare</div>
              <div className="text-[10px] text-white/50 uppercase tracking-widest">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* User badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-xs font-bold">
              {user.fullName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user.fullName}</div>
              <div className="text-[10px] text-white/50">{user.role}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#4F46E5] text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}

          {/* Super admin link if applicable */}
          {isSuperAdmin() && (
            <>
              <div className="pt-3 pb-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-3">
                  Super Admin
                </div>
              </div>
              <Link
                href="/superadmin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-900/30 hover:text-purple-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Super Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-white/10 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E8EDF2] px-8 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[#4A4A6A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
            {currentNavLabel}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-[#4A4A6A] hover:text-[#4F46E5] transition-colors">
              ← Back to Site
            </Link>
          </div>
        </div>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
