/**
 * Client-side functions to interact with the server addon connections API
 * Use these instead of direct Supabase client calls to avoid exposing the anon key
 */

import { getAddons } from './addons-api';
import { getUserConnections } from './connections-api';

export interface AddonConnection {
  addon_id: string;
  addon_name: string;
  token: string;
  account_id?: string;
}

/**
 * Gets a specific addon by name
 */
export async function getAddonByName(name: string) {
  const addons = await getAddons();
  return addons.find(addon => addon.name === name) || null;
}

/**
 * Gets connection for a specific addon
 */
export async function getConnectionForAddon(addonName: string) {
  try {
    // Get the addon ID for this addon name
    const addon = await getAddonByName(addonName);
    if (!addon) {
      return null;
    }
    
    // Get all user connections
    const connections = await getUserConnections();
    
    // Find the connection for this addon
    const connection = connections.find(conn => conn.addon_id === addon.id);
    if (!connection) {
      return null;
    }
    
    return {
      addon_id: connection.addon_id,
      addon_name: addonName,
      token: connection.token,
      account_id: connection.account_id
    };
  } catch (error) {
    console.error(`Error getting connection for ${addonName}:`, error);
    return null;
  }
}

/**
 * Gets all addon connections for the user
 */
export async function getAllAddonConnections() {
  try {
    // Get all addon information
    const addons = await getAddons();
    
    // Get all user connections
    const connections = await getUserConnections();
    
    // Map connections to addon names
    return connections.map(connection => {
      const addon = addons.find(a => a.id === connection.addon_id);
      return {
        addon_id: connection.addon_id,
        addon_name: addon?.name || 'Unknown',
        token: connection.token,
        account_id: connection.account_id
      };
    });
  } catch (error) {
    console.error('Error getting all addon connections:', error);
    return [];
  }
}