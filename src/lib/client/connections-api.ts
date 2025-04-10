/**
 * Client-side functions to interact with the server connections API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

export interface Connection {
  id?: string;
  user_id?: string;
  addon_id: string;
  token: string;
  refresh_token?: string;
  account_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get connections for the current user
 */
export async function getUserConnections(addonId?: string, fields = '*') {
  const params = new URLSearchParams();
  
  if (addonId) {
    params.append('addonId', addonId);
  }
  
  if (fields !== '*') {
    params.append('select', fields);
  }
  
  const response = await fetch(`/api/connections?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch connections');
  }
  
  return await response.json();
}

/**
 * Create a new connection
 */
export async function createConnection(connectionData: Connection) {
  const response = await fetch('/api/connections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(connectionData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create connection');
  }
  
  return await response.json();
}

/**
 * Update an existing connection
 */
export async function updateConnection(id: string, updates: Partial<Connection>) {
  const response = await fetch('/api/connections', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, ...updates }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update connection');
  }
  
  return await response.json();
}

/**
 * Delete a connection
 */
export async function deleteConnection(id: string) {
  const response = await fetch(`/api/connections?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete connection');
  }
  
  return await response.json();
}