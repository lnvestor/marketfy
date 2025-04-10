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

// GET endpoint to fetch user profile
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const fields = searchParams.get('select') || '*';
    
    // Fetch profile data
    const { data, error } = await supabase
      .from('profiles')
      .select(fields)
      .eq('id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update user profile
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get profile data from request body
    const profileData = await req.json();
    
    // Ensure we don't try to update the user ID
    if (profileData.id) {
      delete profileData.id;
    }
    
    // Add updated_at timestamp
    const updates = {
      ...profileData,
      updated_at: new Date().toISOString(),
    };
    
    // Update the profile
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// POST endpoint to create/upsert user profile
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get profile data from request body
    const profileData = await req.json();
    
    // Ensure we use the correct user ID
    const updates = {
      ...profileData,
      id: user.id,
      updated_at: new Date().toISOString(),
    };
    
    // Upsert the profile (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create/update profile' },
      { status: 500 }
    );
  }
}