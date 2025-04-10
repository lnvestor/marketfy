import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Force dynamic behavior to ensure fresh data
export const dynamic = 'force-dynamic';

// Create Supabase server client
function getSupabaseServer(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: () => {}, // We don't need to set cookies in this context
        remove: () => {}, // We don't need to remove cookies in this context
      },
    }
  );
  return supabase;
}

// GET endpoint to fetch user info
// This endpoint is used in place of direct Supabase auth.getUser() calls
export async function GET(req: NextRequest) {
  try {
    // Use server client
    const supabase = getSupabaseServer(req);
    
    // Get user info from Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    // Return standard JSON response
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST endpoint for user operations like sign out
export async function POST(req: NextRequest) {
  try {
    // Get the operation from request body
    const { operation } = await req.json();
    
    switch (operation) {
      case 'signOut':
        // Create a response to modify with cookies
        const signOutResponse = NextResponse.json({ success: true });
        
        // Use server client
        const supabase = getSupabaseServer(req);
        
        // Sign out the user
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        // Clear auth cookies to ensure complete sign out
        signOutResponse.cookies.set('sb-access-token', '', { 
          path: '/',
          maxAge: 0,
          sameSite: 'lax'
        });
        
        signOutResponse.cookies.set('sb-refresh-token', '', { 
          path: '/',
          maxAge: 0,
          sameSite: 'lax'
        });
        
        return signOutResponse;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported operation' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in user operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform user operation' },
      { status: 500 }
    );
  }
}