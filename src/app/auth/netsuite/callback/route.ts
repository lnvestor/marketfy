import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { netsuiteOAuth } from '@/lib/netsuite';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get required parameters from URL
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const accountId = searchParams.get('company');
    const error = searchParams.get('error');

    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        `${baseUrl}/connections?error=${encodeURIComponent(error)}`
      );
    }

    // Validate required parameters
    if (!code || !state || !accountId) {
      console.error('Missing required OAuth parameters');
      return NextResponse.redirect(
        `${baseUrl}/connections?error=missing_parameters`
      );
    }

    // Get stored state and code verifier from cookies
    const cookieStore = await cookies();
    const storedState = cookieStore.get('netsuite_state')?.value;
    const codeVerifier = cookieStore.get('netsuite_code_verifier')?.value;

    // Validate state to prevent CSRF
    if (!storedState || state !== storedState) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(
        `${baseUrl}/connections?error=invalid_state`
      );
    }

    // Validate code verifier
    if (!codeVerifier) {
      console.error('Missing code verifier');
      return NextResponse.redirect(
        `${baseUrl}/connections?error=missing_code_verifier`
      );
    }

    // Create server-side Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: { expires?: Date; path?: string; domain?: string; secure?: boolean }) => {
            cookieStore.set({ name, value, ...options });
          },
          remove: (name: string, options: { path?: string; domain?: string }) => {
            cookieStore.set({ name, value: '', ...options });
          },
        },
        global: {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      }
    );

    // Exchange code for tokens
    const tokens = await netsuiteOAuth.exchangeCodeForTokens(
      code,
      codeVerifier,
      accountId
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=unauthorized`);
    }

    // Get NetSuite addon ID
    const { data: addon } = await supabase
      .from('AdminAddons')
      .select('id')
      .eq('name', 'NetSuite')
      .single();

    if (!addon) {
      console.error('NetSuite addon not found');
      return NextResponse.redirect(
        `${baseUrl}/connections?error=addon_not_found`
      );
    }

    // Store connection in database
    const { error: upsertError } = await supabase
      .from('connections')
      .upsert({
        user_id: user.id,
        addon_id: addon.id,
        token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        account_id: accountId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,addon_id'
      });

    if (upsertError) {
      console.error('Failed to store connection:', upsertError);
      return NextResponse.redirect(
        `${baseUrl}/connections?error=database_error`
      );
    }

    // Clear OAuth cookies
    const response = NextResponse.redirect(`${baseUrl}/connections?success=true`);
    response.cookies.delete('netsuite_state');
    response.cookies.delete('netsuite_code_verifier');

    return response;

  } catch (error) {
    console.error('Callback error:', error);
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(
      `${baseUrl}/connections?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
  }
}
