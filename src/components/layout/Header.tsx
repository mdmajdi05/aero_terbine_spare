'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Menu, X, ChevronDown, LogOut, User, LayoutDashboard,
  Phone, Shield, Settings, BookOpen, Package, Plane, Zap,
  Truck, Wrench, Star, Award, FileText, Factory, Radio,
  HelpCircle, ArrowRight, Layers, Clock,
  ShieldCheck, Globe, BadgeCheck, ChevronRight,
  LucidePlaneTakeoff,
  ShoppingBasketIcon,                      
  Plug,         
  Cpu,
  Rocket, Anchor, Grid3X3, List, Hash,              
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import Button from '@/components/ui/Button';
import AeroLogo from '@/components/branding/AeroLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { NavCategory, Industry, NavCategoryTree } from '@/types';
import { request } from '@/lib/api-client';

const COMPANY_MENU = {
  label: 'Company',
  href: '/about',
  sections: [
    {
      title: 'About AeroTurbineSpare',
      items: [
        { label: 'About Us', href: '/about', icon: Factory, desc: 'Our story, mission & global reach' },
        { label: 'Quality Assurance', href: '/quality', icon: ShieldCheck, desc: 'ISO 9001 & AS9120 certified processes' },
        { label: 'Contact Us', href: '/contact', icon: Phone, desc: 'Talk to a parts specialist today' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { label: 'Industry Blog', href: '/blog', icon: BookOpen, desc: 'Aerospace insights & MRO guides' },
        { label: 'Terms & Conditions', href: '/terms', icon: FileText, desc: 'Legal terms of service' },
        { label: 'Privacy Policy', href: '/privacy', icon: Shield, desc: 'How we protect your data' },
        { label: 'FAQ / Help', href: '/contact', icon: HelpCircle, desc: 'Common questions answered' },
      ],
    },
  ],
  featured: {
    label: '24-Hr Quote Guarantee',
    desc: 'Every RFQ receives a quoted price within 24 business hours — or your next order ships free.',
    href: '/quality',
    cta: 'See Our Guarantee',
    badge: 'SLA Backed',
  },
};

const SIMPLE_NAV = [
  { label: 'Request Quote', href: '/rfq', highlight: false },
  { label: 'Sell Inventory', href: '/inventory', highlight: false },
];

// ─────────────────────────────────────────────────────────────

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [logoImgError, setLogoImgError] = useState(false);
  const [navTree, setNavTree] = useState<NavCategoryTree | null>(null);
  const [navLoading, setNavLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { config: siteConfig } = useSiteConfig();

  // Reset error flag whenever the logo URL changes
  useEffect(() => { setLogoImgError(false); }, [siteConfig.logoImageUrl]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setUserMenuOpen(false);
  }, [pathname]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fetch nav category tree
  useEffect(() => {
    (async () => {
      try {
        const res = await request<{ success: boolean; data: NavCategoryTree }>('/nav-categories');
        if (res?.data) setNavTree(res.data);
      } catch { /* use fallback */ }
      finally { setNavLoading(false); }
    })();
  }, []);

  // Outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const toggleMobileSection = (label: string) =>
    setOpenMobile((prev) => (prev === label ? null : label));

  // ── Compute mega menus from navTree or fallback ──────────────
  const hasDynamic = !!(navTree?.productCategories?.length || navTree?.partCategories?.length);

  const CATALOG_MENU = {
    label: 'Parts & Products',
    href: '/catalog',
    sections: [
      {
        title: 'Products',
        items: hasDynamic
          ? (navTree?.productCategories ?? []).map((cat) => ({
              label: cat.name,
              href: `/products/${cat.slug}`,
              icon: Package,
              desc: cat.description || 'Product category',
            }))
          : [
              { label: 'Hot Stock', href: '/catalog?category=hot-stock&type=product', icon: Zap, desc: 'High-demand turbine parts ready for immediate dispatch' },
              { label: 'General Electric 6FA Turbine Parts', href: '/catalog?category=ge-6fa-turbine-parts&type=product', icon: Settings, desc: '6FA gas turbine components, nozzles, buckets & shrouds' },
              { label: 'Turbine Parts', href: '/catalog?category=turbine-parts&type=product', icon: Package, desc: 'Industrial and aero-derivative turbine spare parts' },
              { label: 'Gas Turbines Parts', href: '/catalog?category=gas-turbines-parts&type=product', icon: Wrench, desc: 'Gas turbine components for power generation' },
              { label: 'Bently Nevada', href: '/catalog?category=bently-nevada&type=product', icon: Radio, desc: 'Vibration monitoring and protection systems' },
              { label: 'GE Modules', href: '/catalog?category=ge-modules&type=product', icon: Cpu, desc: 'GE turbine control modules and accessory components' },
              { label: 'Engine Portfolio', href: '/catalog?category=engine-portfolio&type=product', icon: Plane, desc: 'Complete engine portfolio covering multiple platforms' },
            ],
      },
      {
        title: 'Parts by Manufacturer',
        items: hasDynamic
          ? (navTree?.partCategories ?? []).map((cat) => ({
              label: cat.name,
              href: `/parts/${cat.slug}`,
              icon: Settings,
              desc: cat.description || (cat.manufacturer ? `${cat.manufacturer}` : 'Part category'),
            }))
          : [
              { label: 'GE Power Services', href: '/catalog?category=ge-power-services&type=part', icon: Settings, desc: 'General Electric' },
              { label: 'PW/MPA FT8', href: '/catalog?category=pw-mpa-ft8&type=part', icon: Settings, desc: 'Pratt & Whitney' },
              { label: 'GE LM6000', href: '/catalog?category=ge-lm6000&type=part', icon: Settings, desc: 'General Electric' },
              { label: 'GE Turbine', href: '/catalog?category=ge-turbine&type=part', icon: Settings, desc: 'General Electric' },
              { label: 'GE Frame 5 6 7 9', href: '/catalog?category=ge-frame-5-6-7-9&type=part', icon: Settings, desc: 'General Electric' },
              { label: 'Alstom', href: '/catalog?category=alstom&type=part', icon: Settings, desc: 'Alstom' },
              { label: 'Ansaldo', href: '/catalog?category=ansaldo&type=part', icon: Settings, desc: 'Ansaldo Energia' },
              { label: 'Rolls Royce', href: '/catalog?category=rolls-royce&type=part', icon: Settings, desc: 'Rolls-Royce' },
              { label: 'Solar Turbines', href: '/catalog?category=solar-turbines&type=part', icon: Settings, desc: 'Solar Turbines' },
              { label: 'Siemens', href: '/catalog?category=siemens&type=part', icon: Settings, desc: 'Siemens' },
            ],
      },
      {
        title: 'Quick Search',
        items: [
          { label: 'Browse All Parts', href: '/catalog', icon: Grid3X3, desc: 'Full inventory of 55,000+ parts' },
          { label: 'By NSN Number', href: '/catalog?filter=nsn', icon: Hash, desc: '13-digit NATO stock numbers' },
          { label: 'By CAGE Code', href: '/catalog?filter=cage', icon: BadgeCheck, desc: 'Manufacturer cage identifiers' },
          { label: 'Advanced Search', href: '/catalog?advanced=1', icon: Search, desc: 'Multi-field filter & boolean search' },
        ],
      },
    ],
    featured: {
      label: 'Urgent Need?',
      desc: 'Skip the queue. Flag your RFQ as urgent for priority 4-hour response.',
      href: '/rfq?urgency=urgent',
      cta: 'Submit Urgent RFQ',
      badge: '4-hr Response',
    },
  };

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    plane: Plane, shield: Shield, car: Package, heart: Package,
    cpu: Cpu, radio: Radio, settings: Settings, landing: LucidePlaneTakeoff,
    anchor: Anchor, turbine: Wrench, plug: Plug, zap: Zap,
    wrench: Wrench, circle: Package, crosshair: Radio, sun: Package,
    tool: Wrench, activity: Package,
  };

  const INDUSTRIES_MENU = {
    label: 'Industries',
    href: '/industries',
    sections: [
      {
        title: 'Sectors We Serve',
        items: hasDynamic && navTree?.industries?.length
          ? navTree.industries.slice(0, 8).map((ind) => {
              const IconComp = iconMap[ind.icon ?? ''] || Package;
              return {
                label: ind.name,
                href: `/industries/${ind.slug}`,
                icon: IconComp,
                desc: ind.description || 'Industry vertical',
              };
            })
          : [
              { label: 'Aerospace & Aviation', href: '/industries/aerospace', icon: Plane, desc: 'Commercial & military aviation parts' },
              { label: 'Aircraft Components & Accessories', href: '/industries/aircraft-components-accessories', icon: ShoppingBasketIcon, desc: 'High-grade structural components, actuation systems, and avionics accessories for fixed-wing and rotary-wing aircraft.' },
            ],
      },
    ],
    featured: {
      label: 'Manufacturing Partners',
      desc: 'Over 1,200 certified OEM manufacturers in our global supplier network.',
      href: '/about',
      cta: 'Our Supplier Network',
      badge: '1,200+ OEMs',
    },
  };

  const MEGA_MENUS = [CATALOG_MENU, INDUSTRIES_MENU, COMPANY_MENU] as const;
  type MegaMenuData = typeof CATALOG_MENU | typeof INDUSTRIES_MENU | typeof COMPANY_MENU;

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="bg-[#060F1A] text-[#C0C9D5] text-[11px] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8">
          <div className="flex items-center gap-4 xl:gap-6">
            <a
              href="tel:+17138425500"
              className="flex items-center gap-1.5 hover:text-[#4F46E5] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3 h-3" />
              +1-713-842-5500
            </a>
            <span className="hidden xl:inline">
              CAGE Code: <strong className="text-[#4F46E5] font-mono tracking-widest">8ATR9</strong>
            </span>
            <span className="hidden xl:flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              24-Hr Quote Response Guarantee
            </span>
          </div>
          <div className="flex items-center gap-4 xl:gap-5">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] animate-pulse flex-shrink-0" />
              <span className="hidden xl:inline">ISO 9001 &amp; AS9120</span>
              <span className="xl:hidden">Certified</span>
            </span>
            <span className="hidden xl:flex items-center gap-1.5 whitespace-nowrap">
              <Truck className="w-3 h-3 flex-shrink-0" />
              Ships to 150+ Countries
            </span>
            <span className="hidden xl:flex items-center gap-1.5 whitespace-nowrap">
              <Star className="w-3 h-3 fill-[#4F46E5] text-[#4F46E5] flex-shrink-0" />
              AS9120B Accredited
            </span>
          </div>
        </div>
      </div>

      {/* ── Main header ───────────────────────────────────── */}
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-50 bg-white border-b border-[#E8EDF2] transition-shadow duration-200',
          scrolled && 'shadow-lg'
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-[70px] gap-4">

            {/* Logo — dimensions + image controlled by Admin Branding panel */}
            <Link
              href={siteConfig.logoLink || '/'}
              className="flex items-center gap-2.5 flex-shrink-0"
              style={{
                paddingLeft:  siteConfig.logoPaddingX,
                paddingRight: siteConfig.logoPaddingX,
                paddingTop:   siteConfig.logoPaddingY,
                paddingBottom:siteConfig.logoPaddingY,
                marginLeft:   siteConfig.logoMarginX,
                marginRight:  siteConfig.logoMarginX,
                marginTop:    siteConfig.logoMarginY,
                marginBottom: siteConfig.logoMarginY,
              }}
            >
              {siteConfig.logoImageUrl && !logoImgError ? (
                /* Custom logo image */
                <img
                  src={siteConfig.logoImageUrl}
                  alt={siteConfig.logoText || 'Logo'}
                  style={{
                    height: siteConfig.logoHeight,
                    width:  siteConfig.logoWidth || 'auto',
                    objectFit: 'contain',
                  }}
                  className="flex-shrink-0"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <AeroLogo size={Math.min(siteConfig.logoHeight || 42, 48)} variant="full" />
              )}
            </Link>

            {/* Search — desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl">
              <div className="relative w-full">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Part Number, NSN, CAGE Code, or Description..."
                  className="w-full pl-5 pr-14 py-3 rounded-xl border border-silver-dark bg-bg text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30 focus:border-[#4F46E5] transition-all placeholder:text-text-muted/60"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 bg-[#4F46E5] text-white rounded-r-xl hover:bg-[#4338CA] transition-colors flex items-center gap-1.5 text-xs font-medium"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Desktop auth + CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#E8EDF2] transition-colors text-sm font-medium text-[#1A1A2E]"
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white',
                      isSuperAdmin() ? 'bg-purple-600' : isAdmin() ? 'bg-[#0A1628]' : 'bg-[#4F46E5]'
                    )}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-semibold max-w-28 truncate">{user.fullName}</div>
                      <div className={cn(
                        'text-[10px] font-medium',
                        isSuperAdmin() ? 'text-purple-600' : isAdmin() ? 'text-[#0A1628]' : 'text-[#4F46E5]'
                      )}>
                        {user.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#4A4A6A]" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-[#E8EDF2] py-2 z-50">
                      <div className="px-4 py-3 border-b border-[#E8EDF2]">
                        <div className="text-sm font-semibold text-[#1A1A2E]">{user.fullName}</div>
                        <div className="text-xs text-[#4A4A6A] truncate">{user.email}</div>
                        <span className={cn(
                          'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                          isSuperAdmin() ? 'bg-purple-100 text-purple-700' :
                            isAdmin() ? 'bg-[#0A1628]/10 text-[#0A1628]' :
                              'bg-[#4F46E5]/10 text-[#4F46E5]'
                        )}>
                          {user.role}
                        </span>
                      </div>

                      <UserMenuItem href="/dashboard" icon={LayoutDashboard} label="My Dashboard" />
                      <UserMenuItem href="/dashboard/profile" icon={User} label="Profile Settings" />

                      {(isAdmin() || isSuperAdmin()) && (
                        <>
                          <div className="my-1 border-t border-[#E8EDF2]" />
                          <div className="px-4 py-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A4A6A]">Administration</span>
                          </div>
                          <UserMenuItem href="/admin" icon={Settings} label="Admin Dashboard" accent />
                        </>
                      )}

                      {isSuperAdmin() && (
                        <UserMenuItem href="/superadmin" icon={Shield} label="Super Admin Panel" superAccent />
                      )}

                      <div className="my-1 border-t border-[#E8EDF2]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-600 transition-colors text-[#4A4A6A] w-full text-left rounded-xl mx-0"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-[#4A4A6A] hover:text-[#0A1628] transition-colors">
                    Sign In
                  </Link>
                  <Link href="/rfq">
                    <Button variant="orange" size="md">Get Quote</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
          className="lg:hidden p-3 rounded-xl text-text-muted hover:bg-silver transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* ── Desktop mega-nav bar ──────────────────────── */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5 h-11 border-t border-[#E8EDF2]/70">
<Link href="/" className="px-4 h-11 flex items-center text-sm font-medium transition-colors rounded-t-lg text-text-muted hover:text-navy hover:bg-silver/60">Home</Link>
            {/* Mega menu items */}
            {MEGA_MENUS.map((menu) => (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => { cancelClose(); setOpenMenu(menu.label); }}
                onMouseLeave={scheduleClose}
                onClick={(e) => {
                  // Only trigger on direct button clicks, not when clicking inside the dropdown
                  if ((e.target as HTMLElement).closest('button')) {
                    setOpenMenu((prev) => (prev === menu.label ? null : menu.label));
                  }
                }}
              >
                <button
                  className={cn(
                    'flex items-center gap-1 px-4 h-11 text-sm font-medium transition-colors rounded-t-lg',
                    openMenu === menu.label
                      ? 'text-[#4F46E5] bg-[#FFF5EE]'
                      : 'text-text-muted hover:text-navy hover:bg-silver/60'
                  )}
                >
                  {menu.label}
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', openMenu === menu.label && 'rotate-180')} />
                </button>

                {/* Mega dropdown panel */}
                <div
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  className={cn(
                    'absolute top-full left-0 bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl border border-[#E8EDF2] z-50',
                    'transition-all duration-200 origin-top-left',
                    openMenu === menu.label
                      ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
                      : 'opacity-0 scale-95 pointer-events-none -translate-y-2'
                  )}
                  style={{ minWidth: 'min(920px, calc(100vw - 2rem))' }}
                >
                  <div className="flex">
                    {/* Sections */}
                    <div className="flex gap-0 flex-1 p-6 overflow-scroll max-h-[500px]">
                      {(menu as MegaMenuData).sections.map((section) => (
                        <div key={section.title} className="flex-1 min-w-0 px-4 first:pl-0 last:pr-0 border-r border-[#E8EDF2] last:border-r-0 ">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#4A4A6A] mb-3">
                            {section.title}
                          </h3>
                          <ul className="space-y-0.5">
                            {section.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F5F7FA] group transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-[#E8EDF2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4F46E5]/10 transition-colors">
                                    <item.icon className="w-4 h-4 text-[#4A4A6A] group-hover:text-[#4F46E5] transition-colors" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-[#1A1A2E] group-hover:text-[#4F46E5] transition-colors leading-tight truncate max-w-52">
                                      {item.label}
                                    </div>
                                    <div className="text-xs text-[#4A4A6A] mt-0.5 leading-snug truncate max-w-52">{item.desc}</div>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* Featured promo panel */}
                    <div className="w-52 bg-gradient-to-br from-[#0A1628] to-[#0B1A33] rounded-r-2xl rounded-bl-none p-5 flex flex-col justify-between">
                      <div>
                        <span className="inline-block bg-[#4F46E5] text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                          {(menu as MegaMenuData).featured.badge}
                        </span>
                        <h4 className="text-white font-bold text-sm leading-snug mb-2">
                          {(menu as MegaMenuData).featured.label}
                        </h4>
                        <p className="text-[#C0C9D5] text-xs leading-relaxed">
                          {(menu as MegaMenuData).featured.desc}
                        </p>
                      </div>
                      <Link
                        href={(menu as MegaMenuData).featured.href}
                        className="mt-4 flex items-center gap-1.5 text-[#4F46E5] text-xs font-semibold hover:text-white transition-colors group"
                      >
                        {(menu as MegaMenuData).featured.cta}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom trust bar */}
                  <div className="px-6 py-3 bg-[#F5F7FA] rounded-b-2xl border-t border-[#E8EDF2] flex items-center gap-6">
                    {[
                      { icon: ShieldCheck, label: 'ISO 9001 Certified' },
                      { icon: Award, label: 'AS9120B Accredited' },
                      { icon: Clock, label: '24-Hr Quote Guarantee' },
                      { icon: Globe, label: '150+ Countries Shipped' },
                    ].map(({ icon: Icon, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-[10px] text-[#4A4A6A] font-medium">
                        <Icon className="w-3.5 h-3.5 text-[#00A651]" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Simple nav links */}
            {SIMPLE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 h-11 flex items-center text-sm font-medium transition-colors rounded-t-lg',
                  item.highlight
                    ? 'text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg'
                    : 'text-text-muted hover:text-navy hover:bg-silver/60'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/about" className={cn(
                  'px-4 h-11 flex items-center text-sm font-medium transition-colors rounded-t-lg text-text-muted hover:text-navy hover:bg-silver/60'
                )}>About</Link>
            <Link href="/blog" className={cn(
                  'px-4 h-11 flex items-center text-sm font-medium transition-colors rounded-t-lg text-text-muted hover:text-navy hover:bg-silver/60'
                )}>Blog</Link>

                

            <Link href="/contact" className={cn(
                  'px-4 h-11 flex items-center text-sm font-medium transition-colors rounded-t-lg text-text-muted hover:text-navy hover:bg-silver/60'
                )}>Contact</Link>

            {/* Admin shortcuts (visible to admin+) */}
            {user && isAdmin() && (
              <div className="ml-auto flex items-center gap-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-[#0A1628] bg-[#E8EDF2] hover:bg-[#C0C9D5] rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </Link>
                {isSuperAdmin() && (
                  <Link
                    href="/superadmin"
                    className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    SuperAdmin
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* ── Mobile menu ───────────────────────────────────── */}
        <div
          className={cn(
            'lg:hidden border-t border-[#E8EDF2] bg-white overflow-hidden transition-all duration-300',
            mobileOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 pb-4 pt-3 space-y-1 overflow-y-auto max-h-[80vh]">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search parts..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-silver-dark text-sm text-text focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-[#4F46E5] text-white rounded-r-xl">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mega menu items — accordion */}
            {MEGA_MENUS.map((menu) => (
              <div key={menu.label} className="border border-[#E8EDF2] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleMobileSection(menu.label)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] hover:bg-[#F5F7FA] transition-colors min-h-[44px]"
                >
                  {menu.label}
                  <ChevronRight className={cn('w-4 h-4 text-[#4A4A6A] transition-transform duration-200', openMobile === menu.label && 'rotate-90')} />
                </button>

                <div className={cn(
                  'overflow-hidden transition-all duration-300',
                  openMobile === menu.label ? 'max-h-[600px]' : 'max-h-0'
                )}>
                  <div className="px-3 pb-3 space-y-3 bg-[#F5F7FA]">
                    {(menu as MegaMenuData).sections.map((section) => (
                      <div key={section.title}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#4A4A6A] px-2 pt-3 pb-1">
                          {section.title}
                        </div>
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white transition-colors group min-h-[44px]"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#E8EDF2] flex items-center justify-center flex-shrink-0 group-hover:bg-[#4F46E5]/10">
                              <item.icon className="w-3.5 h-3.5 text-[#4A4A6A] group-hover:text-[#4F46E5]" />
                            </div>
                            <span className="text-sm text-[#1A1A2E] font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Simple nav */}
            {SIMPLE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3.5 text-sm font-semibold text-[#1A1A2E] hover:bg-[#F5F7FA] rounded-xl border border-[#E8EDF2] transition-colors min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}

            {/* Auth section */}
            <div className="pt-2 border-t border-[#E8EDF2] space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#F5F7FA] rounded-xl">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white',
                      isSuperAdmin() ? 'bg-purple-600' : isAdmin() ? 'bg-[#0A1628]' : 'bg-[#4F46E5]'
                    )}>
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1A1A2E]">{user.fullName}</div>
                      <div className="text-xs text-[#4A4A6A]">{user.role}</div>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F5F7FA] rounded-xl transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-[#4A4A6A]" /> My Dashboard
                  </Link>
                  {isAdmin() && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0A1628] hover:bg-[#E8EDF2] rounded-xl transition-colors">
                      <Settings className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  {isSuperAdmin() && (
                    <Link href="/superadmin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors">
                      <Shield className="w-4 h-4" /> Super Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-center text-[#4A4A6A] hover:bg-[#F5F7FA] rounded-xl border border-[#E8EDF2] transition-colors">
                    Sign In
                  </Link>
                  <Link href="/rfq" onClick={() => setMobileOpen(false)}>
                    <Button variant="orange" size="md" className="w-full">Get Quote</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

// ── Utility sub-component ─────────────────────────────────────
function UserMenuItem({
  href, icon: Icon, label, accent, superAccent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  accent?: boolean;
  superAccent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
        superAccent ? 'hover:bg-purple-50 hover:text-purple-700 text-purple-600' :
          accent ? 'hover:bg-[#E8EDF2] hover:text-[#0A1628] text-[#0A1628]' :
            'hover:bg-[#E8EDF2] transition-colors text-[#1A1A2E]'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
