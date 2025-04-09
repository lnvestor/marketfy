import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { type User } from './supabase';

// Server-side Supabase client with service role for admin operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        get: async () => undefined,
        set: async () => {},
        remove: async () => {},
      }
    }
  );
};

// This ensures we only create one Supabase client per request
export const getServerClient = cache(() => {
  // Using the proper async cookie handler for Next.js
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => {
          const cookieStore = cookies();
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set: async (name, value, options) => {
          const cookieStore = cookies();
          cookieStore.set({ name, value, ...options });
        },
        remove: async (name, options) => {
          const cookieStore = cookies();
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
});

// Get the current user on the server side - can be used in Server Components
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = getServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }
    
    return session.user as User;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

// Get the current user using the service role key - for secure admin operations
export async function getServerUserSecure(userId: string): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching secure user data:', error);
      return null;
    }
    
    return data as User;
  } catch (error) {
    console.error('Error in getServerUserSecure:', error);
    return null;
  }
}

// A wrapper to protect server components/routes
export async function requireAuth() {
  const user = await getServerUser();
  
  if (!user) {
    // Redirect to login if no user is found
    redirect('/');
  }
  
  return user;
}

// Server-side auth utility for API routes
export async function validateAuth(headers: Headers) {
  const authHeader = headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = createServerSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }
    
    return data.user as User;
  } catch (error) {
    console.error('Error validating auth:', error);
    return null;
  }
}