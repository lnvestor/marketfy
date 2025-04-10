/**
 * Client-side functions to interact with the server addon features API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

export interface AddonFeature {
  id: string;
  addon_id: string;
  feature: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get features for a specific addon
 * @param addonId The ID of the addon to fetch features for
 * @param select Optional fields to select (default: '*')
 */
export async function getAddonFeatures(addonId: string, select = '*') {
  const params = new URLSearchParams();
  
  params.append('addon_id', addonId);
  
  if (select !== '*') {
    params.append('select', select);
  }
  
  const response = await fetch(`/api/adminaddonsfeatures?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch addon features');
  }
  
  return await response.json() as AddonFeature[];
}