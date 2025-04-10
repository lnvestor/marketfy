import { createBrowserClient } from '@supabase/ssr'

// Create a client-side Supabase client safely
// This uses environment variables which are injected at build time
// The NEXT_PUBLIC_ prefix allows these variables to be safely exposed to the browser
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// Add a helper function to safely get auth token through our server API
export async function getAuthToken() {
  try {
    // Use our server API endpoint instead of direct Supabase calls
    const response = await fetch('/api/auth/token');
    
    if (!response.ok) {
      throw new Error(`Token API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.error) {
      console.error('Auth error:', data?.error);
      return null;
    }
    
    return data.token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}
