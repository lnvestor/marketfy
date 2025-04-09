import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Sign out route handler
export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Create supabase server client with synchronous cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          // Parse cookies from the request headers
          const cookieHeader = request.headers.get('cookie') || '';
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key) acc[key] = value || '';
            return acc;
          }, {} as Record<string, string>);
          
          return cookies[name];
        },
        set: (name, value, options) => {
          // Set cookies directly on the response
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          // Remove cookies by setting empty value and expiring them
          response.cookies.set({ 
            name, 
            value: '', 
            ...options, 
            expires: new Date(0)
          });
        },
      },
    }
  );

  try {
    // Sign the user out
    await supabase.auth.signOut();
    console.log('User signed out successfully');

    // Redirect to the home page
    return response;
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.redirect(new URL('/?error=Failed+to+sign+out', request.url));
  }
}