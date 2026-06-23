import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (any logged-in user)
const AUTH_ROUTES  = ['/dashboard', '/rfq'];

// Routes for Admin or SuperAdmin only
const ADMIN_ROUTES = ['/admin'];

// Routes for SuperAdmin only
const SUPER_ROUTES = ['/superadmin'];

// Routes for Trader or Admin/SuperAdmin
const TRADER_ROUTES = ['/inventory'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth   = AUTH_ROUTES.some((r)   => pathname.startsWith(r));
  const requiresAdmin  = ADMIN_ROUTES.some((r)  => pathname.startsWith(r));
  const requiresSuper  = SUPER_ROUTES.some((r)  => pathname.startsWith(r));
  const requiresTrader = TRADER_ROUTES.some((r) => pathname.startsWith(r));

  if (!requiresAuth && !requiresAdmin && !requiresSuper && !requiresTrader) {
    return NextResponse.next();
  }

  // Role is written to cookie `ats_role` on login (both mock and real modes).
  const role = request.cookies.get('ats_role')?.value;

  // Not logged in at all → redirect to login
  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // SuperAdmin-only routes
  if (requiresSuper && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Admin-only routes (Admin + SuperAdmin allowed)
  if (requiresAdmin && role !== 'Admin' && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Trader routes (Trader + Admin + SuperAdmin)
  if (requiresTrader && role !== 'Trader' && role !== 'Admin' && role !== 'SuperAdmin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Authenticated routes — any logged-in role is fine
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
