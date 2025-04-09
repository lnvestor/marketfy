import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// List of paths that should be protected (require authentication)
const PROTECTED_ROUTES = [
  '/profile',
  '/dashboard',
  '/products/create',
  '/settings',
];

// List of paths that are only for non-authenticated users
const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
];

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files (.svg, .jpg, .png, etc.)
     * - auth callback route (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Skip the middleware for callback routes to avoid conflicts
  if (pathname.includes('/auth/callback')) {
    return res;
  }
  
  // Create supabase middleware client with synchronous cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          return req.cookies.get(name)?.value;
        },
        set: (name, value, options) => {
          // Set the cookie on the response
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  try {
    // Check if there is an active session
    const { data: { session } } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    // Handle protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isAuthenticated) {
      // Store the URL they were trying to visit for redirect after login
      const redirectUrl = new URL('/', req.url);
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle auth routes - redirect to home if already logged in
    if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue the request in case of an error
    return res;
  }
}