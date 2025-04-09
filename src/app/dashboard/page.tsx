import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/server-auth';
import Link from 'next/link';
import { cookies } from 'next/headers';

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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Products Analyzed</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
              +24% 
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">5,342</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Last 30 days
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Potential Revenue</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
              +16%
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold">$24,890</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on current selection
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Trending Categories</h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary">
              Updated
            </span>
          </div>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center justify-between">
              <span>Home & Kitchen</span>
              <span className="text-sm font-medium text-primary">32%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Beauty & Personal Care</span>
              <span className="text-sm font-medium text-primary">28%</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Sports & Outdoors</span>
              <span className="text-sm font-medium text-primary">24%</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recommended Products</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-lg border bg-background p-4">
              <div className="mb-3 aspect-video rounded-md bg-muted"></div>
              <h3 className="font-medium">Smart Water Bottle</h3>
              <div className="mt-1 flex items-center text-sm">
                <span className="font-medium text-green-600">89% Match</span>
                <span className="mx-2 text-muted-foreground">|</span>
                <span className="text-muted-foreground">Est. Profit: $12.40</span>
              </div>
              <Link
                href="/products/details"
                className="mt-3 inline-flex w-full items-center justify-center rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent Market Insights</h2>
        <ul className="space-y-4">
          {[1, 2, 3].map((item) => (
            <li key={item} className="flex items-start gap-4 rounded-lg border bg-background p-4">
              <div className="rounded-md bg-primary/10 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M2 22V12C2 7.5 5 4 12 4C19 4 22 7.5 22 12V22"></path>
                  <path d="M11 14.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z"></path>
                  <path d="M6 13h1"></path>
                  <path d="M17 13h1"></path>
                  <path d="M8 17l.5.5"></path>
                  <path d="M15.5 17l.5.5"></path>
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Major Shift in Eco-friendly Products</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our AI has detected a 34% increase in consumer interest for sustainable alternatives in the home goods category.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary"
                  >
                    Explore Trend
                  </Link>
                  <span className="text-xs text-muted-foreground">3 days ago</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}