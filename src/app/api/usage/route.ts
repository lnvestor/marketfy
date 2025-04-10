import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Force dynamic behavior to ensure fresh data
export const dynamic = 'force-dynamic';

// Claude 3.7 Sonnet pricing constants
const PROMPT_PRICE_PER_MILLION = 3; // $3 per million tokens
const COMPLETION_PRICE_PER_MILLION = 15; // $15 per million tokens

// Create Supabase server client
async function getSupabaseServer(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name) {
          const cookie = req.cookies.get(name)
          return cookie?.value
        },
        async set() {}, // We don't need to set cookies in this context
        async remove() {}, // We don't need to remove cookies in this context
      },
    }
  );
  return supabase;
}

// GET endpoint to retrieve balance or token usage
export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get parameters from query
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'history';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    // Handle different types of requests
    switch (type) {
      case 'balance':
        // Get user balance from the database
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_balance')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (balanceError && balanceError.code !== 'PGRST116') {
          return NextResponse.json({ error: balanceError.message }, { status: 500 });
        }
        
        return NextResponse.json({
          balance: balanceData?.balance || 0
        });
        
      case 'history':
        // Get token usage history
        const { data: historyData, error: historyError } = await supabase
          .from('user_token_usage')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
          
        if (historyError) {
          console.error('Error fetching usage history:', historyError);
          return NextResponse.json({ error: historyError.message }, { status: 500 });
        }
        
        return NextResponse.json(historyData || []);
        
      case 'summary':
        // Calculate date range for summary
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Query with date filter
        const { data: summaryData, error: summaryError } = await supabase
          .from('user_token_usage')
          .select('prompt_tokens, completion_tokens, total_tokens, prompt_cost, completion_cost, total_cost')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());
          
        if (summaryError) {
          console.error('Error fetching usage summary:', summaryError);
          return NextResponse.json({ error: summaryError.message }, { status: 500 });
        }
        
        // Aggregate the data
        const summary = summaryData.reduce((acc, record) => {
          acc.promptTokens += record.prompt_tokens;
          acc.completionTokens += record.completion_tokens;
          acc.totalTokens += record.total_tokens;
          acc.promptCost += record.prompt_cost;
          acc.completionCost += record.completion_cost;
          acc.totalCost += record.total_cost;
          return acc;
        }, {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          promptCost: 0,
          completionCost: 0,
          totalCost: 0
        });
        
        return NextResponse.json(summary);
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

// POST endpoint to track token usage (without balance deduction)
export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServer(req);
    
    // Validate user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get token usage data from request body
    const { promptTokens, completionTokens } = await req.json();
    
    if (typeof promptTokens !== 'number' || typeof completionTokens !== 'number') {
      return NextResponse.json(
        { error: 'Invalid token values' },
        { status: 400 }
      );
    }
    
    // Calculate costs based on token counts
    const promptCost = (promptTokens / 1000000) * PROMPT_PRICE_PER_MILLION;
    const completionCost = (completionTokens / 1000000) * COMPLETION_PRICE_PER_MILLION;
    
    // Insert token usage record (no balance checking/deduction)
    const { error: insertError } = await supabase
      .from('user_token_usage')
      .insert({
        user_id: user.id,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        prompt_cost: promptCost,
        completion_cost: completionCost,
        total_cost: promptCost + completionCost
      });
    
    if (insertError) {
      console.error('Error recording token usage:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: promptTokens + completionTokens
      },
      costs: {
        prompt: promptCost,
        completion: completionCost,
        total: promptCost + completionCost
      }
    });
  } catch (error) {
    console.error('Error tracking token usage:', error);
    return NextResponse.json(
      { error: 'Failed to track token usage' },
      { status: 500 }
    );
  }
}