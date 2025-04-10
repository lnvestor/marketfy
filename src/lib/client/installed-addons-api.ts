/**
 * Client-side functions to interact with installed addons
 */

export interface InstalledAddon {
  id: string;
  user_id: string;
  addon_id: string;
  installed_at: string;
  version: string;
  is_active: boolean;
}

/**
 * Get addons installed by the current user
 */
export async function getUserInstalledAddons() {
  const response = await fetch('/api/installed-addons', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch installed addons');
  }
  
  return await response.json() as InstalledAddon[];
}

/**
 * Install an addon for the current user
 */
export async function installAddon(addonId: string, version: string) {
  const response = await fetch('/api/installed-addons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ addon_id: addonId, version }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to install addon');
  }
  
  return await response.json() as InstalledAddon;
}

/**
 * Uninstall an addon for the current user
 */
export async function uninstallAddon(addonId: string) {
  const response = await fetch(`/api/installed-addons?addon_id=${addonId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to uninstall addon');
  }
  
  return await response.json();
}