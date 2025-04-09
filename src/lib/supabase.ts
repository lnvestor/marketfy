import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (with only public keys)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// For client components
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

// For older client code that hasn't been updated yet
export const createClientSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
};
