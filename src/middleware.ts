import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES  = ['/dashboard', '/rfq'];
const ADMIN_ROUTES = ['/admin'];
const SUPER_ROUTES = ['/superadmin'];
const TRADER_ROUTES = ['/inventory'];
const CONTENT_MANAGER_BLOCKED = ['/dashboard/settings', '/dashboard/users'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth   = AUTH_ROUTES.some((r)   => pathname.startsWith(r));
  const requiresAdmin  = ADMIN_ROUTES.some((r)  => pathname.startsWith(r));
  const requiresSuper  = SUPER_ROUTES.some((r)  => pathname.startsWith(r));
  const requiresTrader = TRADER_ROUTES.some((r) => pathname.startsWith(r));

  if (!requiresAuth && !requiresAdmin && !requiresSuper && !requiresTrader) {
    return NextResponse.next();
  }

  const role = request.cookies.get('ats_role')?.value;

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresSuper && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (requiresAdmin && role !== 'Admin' && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (requiresTrader && role !== 'Trader' && role !== 'Admin' && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (role === 'ContentManager' && CONTENT_MANAGER_BLOCKED.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/superadmin/:path*',
    '/rfq',
    '/inventory',
  ],
};
