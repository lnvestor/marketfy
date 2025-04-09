import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('Auth callback handler called');
  try {
    const requestUrl = new URL(request.url);
    console.log('Full request URL:', request.url);
    
    const code = requestUrl.searchParams.get('code');
    console.log('Code present:', !!code);
    
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');
    const next = requestUrl.searchParams.get('next') || '/dashboard';
    
    console.log('Next redirect target:', next);
    
    // Always redirect to dashboard after successful login, regardless of 'next' parameter
    const safeNext = '/dashboard';
    
    // For debugging, let's add a clear path to check if the handler is called properly
    if (requestUrl.searchParams.get('test') === 'true') {
      return new NextResponse(JSON.stringify({
        message: 'Auth callback handler test successful',
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle OAuth error
    if (error) {
      console.error(`Auth error: ${error}`, error_description);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error_description || 'Authentication failed')}`, requestUrl.origin)
      );
    }

    // Exchange code for session
    if (code) {
      // Create a direct response manually to avoid sync/async issues
      const response = NextResponse.redirect(
        new URL(safeNext, requestUrl.origin)
      );
      
      try {
        console.log('Attempting to exchange code for session...');
        
        // Create client with manual cookie handling to avoid the Next.js async cookies warning
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get: (name) => {
                // Instead of using cookies() API which needs to be awaited,
                // access request cookies directly which is synchronous
                return request.cookies.get(name)?.value;
              },
              set: (name, value, options) => {
                // Set cookies directly on the response
                response.cookies.set({ name, value, ...options });
              },
              remove: (name, options) => {
                // Remove cookies by setting empty value
                response.cookies.set({ name, value: '', ...options });
              },
            },
          }
        );
        
        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError);
          return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent('Failed to complete authentication: ' + exchangeError.message)}`, requestUrl.origin)
          );
        }
        
        console.log('Exchange successful! Session created.');
        
        // Log session details (only for debugging)
        if (data?.session) {
          console.log('Session obtained, user ID:', data.session.user.id);
          console.log('Provider tokens available:', !!data.session.provider_token, !!data.session.provider_refresh_token);
          
          // Securely handle tokens if needed
          if (data.session.provider_token) {
            console.log('Successfully obtained Google provider token');
          }
        } else {
          console.log('Data returned but no session found');
        }
        
        // Log where we're redirecting to
        console.log('Authentication successful! Redirecting to:', safeNext);
        
        // Return the response with any cookies that were set
        return response;
      } catch (exchangeCodeError) {
        console.error('Unexpected error during code exchange:', exchangeCodeError);
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent('Error during authentication: ' + (exchangeCodeError as Error).message)}`, requestUrl.origin)
        );
      }
    }

    // If no code is present, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL('/?error=Something+went+wrong', new URL(request.url).origin));
  }
}