'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Settings,
  Download, Shield, ChevronRight, LogOut,
  Bell, Database, ScrollText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import AeroLogo from '@/components/branding/AeroLogo';

const SA_NAV = [
  { href: '/superadmin',             icon: LayoutDashboard, label: 'SA Dashboard',   exact: true },
  { href: '/superadmin/users',       icon: Users,           label: 'All Users'       },
  { href: '/superadmin/audit-logs',  icon: ScrollText,      label: 'Audit Logs'      },
  { href: '/superadmin/settings',    icon: Settings,        label: 'System Settings' },
  { href: '/superadmin/backup',      icon: Database,        label: 'DB Backup'       },
  { href: '/superadmin/export',      icon: Download,        label: 'Master Export'   },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin())) {
      router.replace('/unauthorized');
    }
  }, [user, loading, isSuperAdmin, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin()) return null;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D20] flex">
      <aside className="w-64 bg-[#13132B] text-white flex flex-col fixed top-0 left-0 h-full z-30 border-r border-purple-900/30">
        <div className="px-5 py-4 border-b border-purple-900/30">
          <Link href="/" className="flex items-center gap-2.5">
            <AeroLogo variant="white" size={32} showText={false} />
            <div>
              <div className="text-sm font-bold leading-tight">AeroTurbineSpare</div>
              <div className="text-[10px] text-purple-400 uppercase tracking-widest">Super Admin</div>
            </div>
          </Link>
        </div>

        <div className="px-5 py-3 border-b border-purple-900/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
              {user.fullName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{user.fullName}</div>
              <div className="text-[10px] text-purple-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                Super Administrator
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SA_NAV.map(({ href, icon: Icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200/70 hover:bg-purple-900/30 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-400/50 px-3">Also Access</div>
          </div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Admin Panel
          </Link>
        </nav>

        <div className="px-3 py-3 border-t border-purple-900/30 space-y-1">
          <Link href="/superadmin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-purple-300/50 hover:text-white hover:bg-purple-900/20 transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-purple-300/50 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 min-h-screen">
        <div className="sticky top-0 z-20 bg-[#13132B] border-b border-purple-900/30 px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-200">
              {SA_NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label || 'Super Admin'}
            </span>
          </div>
          <Link href="/" className="text-xs text-purple-400 hover:text-white transition-colors">
            ← Back to Site
          </Link>
        </div>
        <main className="p-8 bg-[#0D0D20] min-h-screen">{children}</main>
      </div>
    </div>
  );
}
