'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  Bookmark,
  User,
  LogOut,
  Menu,
  X,
  Newspaper,
  ImageIcon,
  FolderOpen,
  Tag,
  GitFork,
  MessageSquare,
  ArrowRightLeft,
  BarChart3,
  Search,
  FileJson,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { UserRole } from '@/types';

type NavItem =
  | { type?: 'link'; label: string; href: string; icon: React.ElementType; roles?: UserRole[] }
  | { type: 'divider'; label: string; roles: UserRole[] };

const CONTENT_ROLES: UserRole[] = ['ContentManager', 'Admin', 'SuperAdmin'];

const NAV_ITEMS: NavItem[] = [
  // ── Standard dashboard ──────────────────────────────────────
  { label: 'Overview',    href: '/dashboard',         icon: LayoutDashboard },
  { label: 'My RFQs',    href: '/dashboard/rfqs',    icon: FileText },
  { label: 'My Orders',  href: '/dashboard/orders',  icon: Package },
  { label: 'My Listings',href: '/dashboard/parts',   icon: Package,     roles: ['Trader'] },
  { label: 'Saved Parts',href: '/dashboard/saved',   icon: Bookmark },
  { label: 'Profile',    href: '/dashboard/profile', icon: User },
  // ── Content Manager section ─────────────────────────────────
  { type: 'divider', label: 'Content', roles: CONTENT_ROLES },
  { label: 'Blog Posts',  href: '/dashboard/posts',      icon: Newspaper,   roles: CONTENT_ROLES },
  { label: 'Media',       href: '/dashboard/media',      icon: ImageIcon,   roles: CONTENT_ROLES },
  { label: 'Categories',  href: '/dashboard/categories', icon: FolderOpen,  roles: CONTENT_ROLES },
  { label: 'Tags',        href: '/dashboard/tags',       icon: Tag,         roles: CONTENT_ROLES },
  { label: 'Sitemap',     href: '/dashboard/sitemap',   icon: GitFork,     roles: CONTENT_ROLES },
  { label: 'Comments',     href: '/dashboard/comments',     icon: MessageSquare,     roles: CONTENT_ROLES },
  { label: 'Redirects',    href: '/dashboard/redirects',     icon: ArrowRightLeft,     roles: CONTENT_ROLES },
  { type: 'divider', label: 'SEO', roles: CONTENT_ROLES },
  { label: 'Link Equity',  href: '/dashboard/seo/link-equity',  icon: BarChart3,    roles: CONTENT_ROLES },
  { label: 'Link Checker', href: '/dashboard/seo/link-checker', icon: Search,       roles: CONTENT_ROLES },
  { label: 'Schema Manager', href: '/dashboard/schemas',        icon: FileJson,     roles: CONTENT_ROLES },
];

function SidebarContent({
  pathname,
  user,
  userRole,
  onSignOut,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: {
  pathname: string;
  user: { fullName: string; company: string; email: string };
  userRole?: UserRole;
  onSignOut: () => void;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex flex-col h-full ${collapsed ? 'items-center' : ''}`}>
      {/* Collapse toggle */}
      <div className={`w-full ${collapsed ? 'px-2 py-3' : 'px-3 pt-2 pb-1'} flex justify-${collapsed ? 'center' : 'end'}`}>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-silver transition-colors text-text-muted hover:text-navy"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User info */}
      <div className={`${collapsed ? 'px-2 py-3' : 'px-4 py-5'} border-b border-silver w-full`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold text-text truncate">{user.fullName}</div>
              <div className="text-xs text-text-muted truncate">{user.company}</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? 'px-2 py-4' : 'px-3 py-4'} space-y-0.5 w-full`}>
        {NAV_ITEMS
          .filter((item) => !item.roles || (userRole && item.roles.includes(userRole)))
          .map((item, idx) => {
            if (item.type === 'divider') {
              if (collapsed) return null;
              return (
                <div key={`divider-${idx}`} className="pt-3 pb-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
                    {item.label}
                  </p>
                </div>
              );
            }
            const { label, href, icon: Icon } = item as { label: string; href: string; icon: React.ElementType };
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-navy text-white border-l-[3px] border-orange rounded-l-none'
                    : 'text-text-muted hover:bg-silver hover:text-navy'
                )}
              >
                <Icon className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                {!collapsed && label}
              </Link>
            );
          })}
      </nav>

      {/* Sign out */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} pb-4 border-t border-silver pt-3 w-full`}>
        <button
          onClick={onSignOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-text-muted hover:bg-red-50 hover:text-red-600 transition-all w-full ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}`}
        >
          <LogOut className={`flex-shrink-0 ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('dashboard_sidebar_collapsed');
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('dashboard_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out successfully');
    router.push('/');
  };

  /* ---- Loading spinner ---- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin w-10 h-10 text-orange"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-text-muted font-medium">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  /* ---- Not authenticated (redirect pending) ---- */
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header />

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6 overflow-hidden min-h-0">
        {/* ---- Desktop sidebar ---- */}
        <aside className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 overflow-x-auto ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="bg-white rounded-xl border border-silver shadow-sm h-full sticky top-24">
            <SidebarContent
              pathname={pathname}
              user={user}
              userRole={user.role}
              onSignOut={handleSignOut}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((v: boolean) => !v)}
            />
          </div>
        </aside>

        {/* ---- Mobile sidebar overlay ---- */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-silver">
            <span className="font-bold text-navy text-sm">Dashboard</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-silver transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent
              pathname={pathname}
              user={user}
              userRole={user.role}
              onSignOut={handleSignOut}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </aside>

        {/* ---- Main content ---- */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Mobile hamburger */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-silver text-sm font-medium text-text hover:bg-silver transition-colors shadow-sm"
            >
              <Menu className="w-4 h-4" />
              Dashboard Menu
            </button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
