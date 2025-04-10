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

// GET endpoint to fetch chat sessions for the current user
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get session ID from query params if provided (for single session)
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    
    if (sessionId) {
      // Get a single chat session
      const { data, error } = await supabase
        .from('chat_sessions')
        .select()
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase error fetching single chat session:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    } else {
      // Get all chat sessions for the user
      const { data, error } = await supabase
        .from('chat_sessions')
        .select()
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new chat session
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get session name from request body
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Session name is required' },
        { status: 400 }
      );
    }
    
    // Create new chat session
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        name,
        is_active: true // Add the is_active field
      })
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating chat session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update an existing chat session
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get session ID and updates from request body
    const { id, updates } = await req.json();
    
    if (!id || !updates || !updates.name) {
      return NextResponse.json(
        { error: 'Session ID and name are required' },
        { status: 400 }
      );
    }
    
    // Update chat session
    const { data, error } = await supabase
      .from('chat_sessions')
      .update({ name: updates.name })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to update chat session' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a chat session
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get session ID from URL params
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Delete chat session
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}