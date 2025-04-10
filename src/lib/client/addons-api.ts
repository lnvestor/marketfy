/**
 * Client-side functions to interact with the server addons API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

export interface Addon {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  logo?: string;
  enabled?: boolean;
  version?: string;
  install_count?: number;
  has_connection?: boolean;
  has_tools?: boolean;
  [key: string]: unknown;
}

/**
 * Get available addons
 */
export async function getAddons(name?: string, fields = '*') {
  const params = new URLSearchParams();
  
  if (name) {
    params.append('name', name);
  }
  
  if (fields !== '*') {
    params.append('select', fields);
  }
  
  const response = await fetch(`/api/addons?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch addons');
  }
  
  return await response.json();
}

/**
 * Get addon counts (available and connected)
 */
export async function getAddonCounts() {
  const response = await fetch('/api/addons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch addon counts');
  }
  
  return await response.json();
}