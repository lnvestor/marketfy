'use client';

import { LogoutIcon } from './icons';
import { User } from '@/lib/supabase';

export function UserProfile({ 
  user, 
  collapsed = false 
}: { 
  user: User;
  collapsed?: boolean;
}) {
  return (
    <div className="relative w-full">
      {/* User profile button */}
      <div className="relative group">
        <div className={`py-2 px-2 my-2 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-md transition-all duration-200 cursor-pointer hover:bg-muted/50`}>
          {/* User avatar/initial */}
          <div className="h-8 w-8 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || user.email} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Username - only show when not collapsed */}
          {!collapsed && (
            <div className="truncate text-left">
              <div className="text-sm font-medium truncate text-left">
                {user.email.split('@')[0]}
              </div>
            </div>
          )}
        </div>
        
        {/* Sign Out that appears on hover */}
        <form action="/auth/signout" method="post" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            type="submit"
            className="w-full h-full rounded-md flex items-center justify-center gap-2 transition-all duration-200 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-destructive"
            title="Sign Out"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}