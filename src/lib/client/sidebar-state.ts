// A simple module for managing sidebar state across the app

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Get the current sidebar state
export function getSidebarState(): boolean {
  if (!isBrowser) return true; // Default to collapsed on server
  
  const state = localStorage.getItem('sidebarCollapsed');
  if (state === null) {
    // Set default to collapsed if no state exists
    localStorage.setItem('sidebarCollapsed', 'true');
    return true;
  }
  return state === 'true';
}

// Set the sidebar state
export function setSidebarState(collapsed: boolean): void {
  if (!isBrowser) return;
  
  localStorage.setItem('sidebarCollapsed', String(collapsed));
}