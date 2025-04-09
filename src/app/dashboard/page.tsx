import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-auth';
import Link from 'next/link';
import { cookies } from 'next/headers';
import EnhancedChatWrapper from '@/components/chat/enhanced-chat-wrapper';

export default async function DashboardPage() {
  // Get all cookies for debugging using proper async pattern
  const cookieStore = cookies();
  // Using Promise to properly await the async operation
  const allCookies = await Promise.resolve(cookieStore.getAll());
  const cookieNames = allCookies.map(c => c.name).join(', ');
  
  // Try to get the user directly instead of through requireAuth
  const user = await getServerUser();
  
  // Simple debugging display if no user detected
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold mb-8">Authentication Debug</h1>
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 mb-8">
          <h2 className="text-2xl font-semibold text-red-700 mb-4">Not Authenticated</h2>
          <p className="mb-4">You are not currently authenticated. This could be due to:</p>
          <ul className="list-disc ml-6 mb-6 space-y-2">
            <li>The Google authentication process didn't complete successfully</li>
            <li>The session token wasn't properly saved in cookies</li>
            <li>The session has expired</li>
          </ul>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Available Cookies:</h3>
            <p className="font-mono text-sm bg-white p-3 rounded border">{cookieNames || "No cookies found"}</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Return Home
            </Link>
            <Link 
              href="/auth/callback?next=/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Auth Callback
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Welcome, {user.full_name?.split(' ')[0] || user.email.split('@')[0]}</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last login: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* AI Chatbot with dynamic height */}
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="border-b px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-lg font-medium text-white">Market Research Assistant</h2>
          </div>
          <div className="h-[700px]">
            <div className="h-full">
              {/* Using enhanced chat component */}
              <EnhancedChatWrapper />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}