import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase variables are not set yet, skip routing logic
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Get session user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Admin route protection
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check user role from metadata or fallback to database query
    let isAdmin = user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      // Fallback query to customers table
      const { data: customer } = await supabase
        .from('customers_shop')
        .select('role')
        .eq('id', user.id)
        .single();
      
      isAdmin = customer?.role === 'admin';
    }

    if (!isAdmin) {
      // If user is not admin, redirect to home page
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

  if (isAuthRoute && user) {
    let isAdmin = user.user_metadata?.role === 'admin';

    if (!isAdmin) {
      const { data: customer } = await supabase
        .from('customers_shop')
        .select('role')
        .eq('id', user.id)
        .single();
      
      isAdmin = customer?.role === 'admin';
    }

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
