'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/supabase';
import { NavItem } from './nav-item';
import { UserProfile } from './user-profile';
import Link from 'next/link';
import { 
  DashboardIcon, 
  ProductIcon, 
  SettingsIcon,
  CollapseIcon
} from './icons';

// Create a sidebar context to allow main layout to respond to sidebar state
import { createContext, useContext } from 'react';

// Create context with default values
export const SidebarContext = createContext({
  collapsed: true,
  toggleSidebar: () => {},
});

// Hook to use sidebar context
export const useSidebar = () => useContext(SidebarContext);

export function Sidebar({ user }: { user: User }) {
  // Always default to collapsed initially
  const [collapsed, setCollapsed] = useState(true);

  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Update document body class to allow styling based on sidebar state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (collapsed) {
        document.body.classList.remove('sidebar-expanded');
      } else {
        document.body.classList.add('sidebar-expanded');
      }
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('sidebar-expanded');
      }
    };
  }, [collapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      <aside 
        className={`h-screen border-r bg-background/95 flex flex-col ${
          collapsed ? 'w-16' : 'w-48'
        }`}
        style={{ 
          transition: 'width 300ms ease',
          willChange: 'width'
        }}
      >
      {/* Responsive logo section that changes between star icon and full logo */}
      <div className="p-4 relative">
        <Link href="/dashboard" className="block">
          {collapsed ? (
            /* Star icon when collapsed */
            <div className="w-8 h-8 mx-auto flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-primary" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
          ) : (
            /* Full logo when expanded - centered with no text */
            <div className="relative w-16 h-16 flex items-center justify-center mx-auto">
              <img 
                src="/logo.png" 
                alt="Marketfy Logo" 
                className="w-full h-full object-contain scale-125"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.2))' }}
              />
            </div>
          )}
        </Link>

        {/* Collapse toggle button on the right edge */}
        <button 
          onClick={toggleSidebar}
          className="h-5 w-5 absolute right-0 top-1/2 -translate-y-1/2 -mr-2.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground bg-background border border-border shadow-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon className="h-3 w-3" collapsed={!collapsed} />
        </button>
      </div>
      
      {/* Nav section */}
      <nav className="mt-8 flex flex-col flex-grow">
        <div className="space-y-1 px-2">
          <NavItem 
            href="/dashboard" 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            collapsed={collapsed}
          />
          <NavItem 
            href="/dashboard/products" 
            icon={<ProductIcon />} 
            label="Products" 
            collapsed={collapsed}
          />
          <NavItem 
            href="/dashboard/settings" 
            icon={<SettingsIcon />} 
            label="Settings" 
            collapsed={collapsed}
          />
        </div>
        
        {/* User profile */}
        <div className="mt-auto mb-8 px-2">
          <UserProfile user={user} collapsed={collapsed} />
        </div>
      </nav>
    </aside>
    </SidebarContext.Provider>
  );
}
