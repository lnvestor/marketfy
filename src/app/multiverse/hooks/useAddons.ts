import { create } from 'zustand';
import { setNetSuiteCredentials, setCredentials } from '../../../../tools';
import { getAllAddonConnections, getConnectionForAddon } from '@/lib/client/addons-connections-api';

interface AddonConnection {
  token: string;
  account_id?: string;
}

interface AddonsState {
  isEnabled: boolean;
  availableAddons: string[];
  enabledAddons: string[];
  connectingAddons: string[];
  connections: Partial<Record<string, AddonConnection>>;
  toggleEnabled: () => void;
  toggleAddon: (addon: string) => Promise<void>;
  getConnection: (addon: string) => AddonConnection | null;
}

// Import functions needed for addons
import { getUserInstalledAddons } from '@/lib/client/installed-addons-api';

// Helper function to initialize addon connections on startup
const initializeAddonConnections = async () => {
  const connections: Partial<Record<string, AddonConnection>> = {};
  const initializedAddons: string[] = [];
  
  try {
    // First, check which addons the user has installed
    const installedAddons = await getUserInstalledAddons();
    const installedAddonNames = new Set<string>();
    
    // Map the installed addon IDs to addon names
    for (const addon of installedAddons) {
      try {
        // Map the addon ID directly to the name
        if (addon.addon_id) {
          // Check the actual ID value in the database
          if (addon.addon_id === 'e21b0366-b245-42fc-9d49-1e74c7103632' || 
              addon.addon_id.toLowerCase() === 'netsuite') {
            installedAddonNames.add('NetSuite');
          } else if (addon.addon_id === '1e31438f-fcee-4c4a-9188-cf58c7b47c2e' || 
                    addon.addon_id.toLowerCase() === 'celigo') {
            installedAddonNames.add('Celigo');
          }
        }
      } catch (err) {
        console.error(`Error getting details for addon ID ${addon.addon_id}:`, err);
      }
    }
    
    console.log('User has installed these addons:', [...installedAddonNames]);
    
    // Only load connections for installed addons
    if (installedAddonNames.size > 0) {
      // Get all addon connections using our API
      const addonConnections = await getAllAddonConnections();
      
      // Process each addon connection, but only for installed addons
      for (const connection of addonConnections) {
        if (connection.addon_name === 'NetSuite' && installedAddonNames.has('NetSuite')) {
          connections['NetSuite'] = {
            token: connection.token,
            account_id: connection.account_id
          };
          initializedAddons.push('NetSuite');
          setNetSuiteCredentials({
            token: connection.token,
            account_id: connection.account_id
          });
          console.log('NetSuite credentials loaded during initialization');
        } else if (connection.addon_name === 'Celigo' && installedAddonNames.has('Celigo')) {
          connections['Celigo'] = {
            token: connection.token
          };
          initializedAddons.push('Celigo');
          setCredentials(connection.token);
          console.log('Celigo credentials loaded during initialization');
        }
      }
    } else {
      console.log('User has no installed addons, skipping credential loading');
    }
  } catch (err) {
    console.error('Error initializing addon connections:', err);
  }
  
  return { connections, initializedAddons };
};

// Initialize with empty state first
const initialState = { connections: {}, initializedAddons: [] };

// No placeholder connections - we'll only load installed addons
try {
  // Start with empty state
  initialState.connections = {};
  initialState.initializedAddons = [];
} catch (error) {
  console.error('Error in synchronous initialization:', error);
}

// Run the full initialization asynchronously and update the store when done
initializeAddonConnections().then(result => {
  // Update the Zustand store with real connections when they're available
  console.log('Updating store with loaded connections');
  window.setTimeout(() => {
    useAddons.setState({ 
      connections: result.connections,
      enabledAddons: result.initializedAddons
    });
  }, 500);
  
  console.log('Addon initialization complete:', {
    addons: result.initializedAddons,
    hasConnections: Object.keys(result.connections).length > 0
  });
});

export const useAddons = create<AddonsState>()((set, get) => ({
  isEnabled: true,
  availableAddons: ['NetSuite', 'Celigo'],
  // Start with empty enabled addons - we'll only load installed ones
  enabledAddons: [],
  connectingAddons: [],
  connections: initialState.connections,
  toggleEnabled: () => {
    set((state) => {
      const newIsEnabled = !state.isEnabled;
      
      // Clear credentials when disabling
      if (!newIsEnabled) {
        setNetSuiteCredentials(null);
        setCredentials(null);
      }
      
      return { 
        ...state,
        isEnabled: newIsEnabled,
        // Clear enabled addons when disabling
        enabledAddons: newIsEnabled ? state.enabledAddons : [],
        connections: newIsEnabled ? state.connections : {}
      };
    });
    
    // Emit event for chat to refresh
    window.dispatchEvent(new Event('addonStateChanged'));
  },
  toggleAddon: async (addon: string) => {
    const state = get();
    
    // If already enabled, just disable
    if (state.enabledAddons.includes(addon)) {
      set((state) => {
        // Clear credentials when disabling addon
        if (addon === 'NetSuite') {
          setNetSuiteCredentials(null);
        } else if (addon === 'Celigo') {
          setCredentials(null);
        }
        
        // Create new connections object without the disabled addon
        const newConnections = { ...state.connections };
        delete newConnections[addon];
        
        return {
          ...state,
          enabledAddons: state.enabledAddons.filter((a) => a !== addon),
          connections: newConnections
        };
      });
      
      // Emit event for chat to refresh
      window.dispatchEvent(new Event('addonStateChanged'));
      return;
    }

    // Set connecting state
    set((state) => ({
      ...state,
      connectingAddons: [...state.connectingAddons, addon]
    }));

    try {
      // Check if the addon is installed first
      const installedAddons = await getUserInstalledAddons();
      const isInstalled = installedAddons.some(installedAddon => {
        // Map the addon ID to the name (NetSuite or Celigo)
        let addonName = '';
        if (installedAddon.addon_id === 'e21b0366-b245-42fc-9d49-1e74c7103632' || 
            installedAddon.addon_id.toLowerCase() === 'netsuite') {
          addonName = 'NetSuite';
        } else if (installedAddon.addon_id === '1e31438f-fcee-4c4a-9188-cf58c7b47c2e' || 
                 installedAddon.addon_id.toLowerCase() === 'celigo') {
          addonName = 'Celigo';
        }
        return addonName.toLowerCase() === addon.toLowerCase() && installedAddon.is_active;
      });

      if (!isInstalled) {
        throw new Error(`${addon} is not installed. Please install it from the Addons page first.`);
      }

      // If enabling NetSuite, fetch credentials
      if (addon === 'NetSuite') {
        // Use our API to get the NetSuite connection
        const connection = await getConnectionForAddon('NetSuite');
        
        if (!connection) {
          throw new Error('Failed to fetch NetSuite connection');
        }

        // Store credentials in state
        set((state) => ({
          ...state,
          connections: {
            ...state.connections,
            NetSuite: {
              token: connection.token,
              account_id: connection.account_id
            }
          }
        }));

        // Set credentials for the tool
        setNetSuiteCredentials({
          token: connection.token,
          account_id: connection.account_id
        });
      }

      // If enabling Celigo, fetch credentials
      if (addon === 'Celigo') {
        // Use our API to get the Celigo connection
        const connection = await getConnectionForAddon('Celigo');
        
        if (!connection) {
          throw new Error('Failed to fetch Celigo connection');
        }

        // Store credentials in state
        set((state) => ({
          ...state,
          connections: {
            ...state.connections,
            Celigo: {
              token: connection.token
            }
          }
        }));

        // Set credentials for the tool
        setCredentials(connection.token);
      }

      // Toggle addon state and remove from connecting state
      set((state) => ({
        ...state,
        enabledAddons: [...state.enabledAddons, addon],
        connectingAddons: state.connectingAddons.filter(a => a !== addon)
      }));
    } catch (error) {
      console.error(`Error connecting ${addon}:`, error);
      // Show notification to user - using console log for now to avoid annoying alerts
      console.warn(`Error: ${error instanceof Error ? error.message : 'Failed to enable addon'}`);
      
      // If it's specifically about not being installed, show a more helpful message in the console
      if (error instanceof Error && error.message.includes('not installed')) {
        console.info('Please install the addon from the Addons page before using it.');
      }
      // Remove from connecting state on error
      set((state) => ({
        ...state,
        connectingAddons: state.connectingAddons.filter(a => a !== addon)
      }));
    }
  },
  getConnection: (addon: string) => {
    const state = get();
    return state.connections[addon] || null;
  }
}));
