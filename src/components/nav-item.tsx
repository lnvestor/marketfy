'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavItem({ 
  href, 
  icon, 
  label,
  collapsed = false
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 p-2 rounded-md transition-all duration-200 group relative ${
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
      }`}
      title={collapsed ? label : undefined}
    >
      <div className={`h-5 w-5 transition-all ${
        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
      }`}>
        {icon}
      </div>
      
      {/* Label - only show when not collapsed */}
      {!collapsed && (
        <span className="text-sm">
          {label}
        </span>
      )}
      
      {/* Indicator for active item */}
      {isActive && (
        <div className="absolute left-0 h-6 w-1 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}