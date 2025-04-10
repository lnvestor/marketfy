/**
 * Client-side functions to interact with the server profile API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

export interface UserProfile {
  id?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  role?: string;
  company_name?: string;
  company_size?: string;
  phone?: string;
  linkedin?: string;
  company_logo?: string;
  is_profile_completed?: boolean;
  updated_at?: string;
}

/**
 * Get profile for the current user
 */
export async function getUserProfile(fields = '*') {
  const params = new URLSearchParams();
  if (fields !== '*') {
    params.append('select', fields);
  }
  
  const response = await fetch(`/api/profile?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch profile');
  }
  
  return await response.json();
}

/**
 * Update profile for the current user
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }
  
  return await response.json();
}

/**
 * Create or update user profile (upsert)
 */
export async function upsertUserProfile(profileData: Partial<UserProfile>) {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create/update profile');
  }
  
  return await response.json();
}