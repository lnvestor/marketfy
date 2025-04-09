import { ReactNode } from 'react';
import { getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get the current user server-side
  const user = await getServerUser();
  
  // If no user, redirect to login
  if (!user) {
    redirect('/auth/signin?next=/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar positioned at left edge */}
      <div className="fixed left-0 top-0 z-10 h-screen">
        <Sidebar user={user} />
      </div>

      {/* Main content container - add padding to create space from sidebar */}
      <main className="py-6 pr-6 pl-6 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
