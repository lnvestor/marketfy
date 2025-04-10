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

// Interface for chat messages
interface ChatMessage {
  id?: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  reasoning?: string;
  annotations?: string;
}

// GET endpoint to retrieve chat messages for a session
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get session ID from query params
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Verify user has access to this session
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 403 }
      );
    }
    
    // Fetch messages for the session
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error && error.code !== '22P02') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}

// POST endpoint to save a new chat message
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get message data from request body
    const message: ChatMessage = await req.json();
    
    if (!message.session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Verify user has access to this session
    const { data: sessionData, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', message.session_id)
      .eq('user_id', user.id)
      .single();
      
    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found or access denied' },
        { status: 403 }
      );
    }
    
    // Save the message
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
      
    if (error && error.code !== '22P02') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save chat message' },
      { status: 500 }
    );
  }
}