import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Get session user from custom cookie
  const sessionCookie = request.cookies.get('user_session')?.value;
  let user: any = null;

  if (sessionCookie) {
    try {
      let decoded = decodeURIComponent(sessionCookie);
      if (decoded.startsWith('"') && decoded.endsWith('"')) {
        decoded = decoded.slice(1, -1);
      }
      user = JSON.parse(decoded);
    } catch (e) {
      // Ignored
    }
  }

  // 1. Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Customer protected routes
  const customerProtected = ['/checkout', '/profile', '/orders'];
  const isProtectedCustomerRoute = customerProtected.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedCustomerRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Prevent authenticated users from visiting auth pages
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isRscRequest = request.nextUrl.searchParams.has('_rsc');

  if (isAuthRoute && user && !isRscRequest) {
    const isAdmin = user.role === 'admin';
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
