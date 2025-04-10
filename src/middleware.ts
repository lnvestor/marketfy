import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase server client for auth checks
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getSession();

  // For protected routes, verify user is authenticated
  const protectedPaths = ['/multiverse', '/addons', '/settings', '/connections', '/dashboard'];
  const url = new URL(request.url);
  
  if (protectedPaths.some(path => url.pathname.startsWith(path))) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Redirect unauthenticated users to login page
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Authentication successful, allow access to protected route
  }

  return response;
}

// Only run this middleware on specific routes
export const config = {
  matcher: [
    '/multiverse/:path*',
    '/addons/:path*',
    '/settings/:path*',
    '/connections/:path*',
    '/dashboard/:path*',
  ],
};