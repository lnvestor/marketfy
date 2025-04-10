/**
 * Client-side functions to interact with the server user API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

export interface User {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
  created_at: string;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const response = await fetch('/api/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user');
  }
  
  const data = await response.json();
  return data.user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const response = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ operation: 'signOut' }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign out');
  }
  
  return await response.json();
}