'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function LoginPage() {
  const { signInWithGoogle, isLoading, user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      window.location.href = '/dashboard';
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const autoLogin = urlParams.get('auto');
    
    if (autoLogin === 'true') {
      handleGoogleSignIn();
    }
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Redirect happens automatically
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">Sign In</h1>
      
      <div className="max-w-md mx-auto p-6 bg-card rounded-lg border shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Google Authentication</h2>
          <p className="text-muted-foreground mb-4">
            Click the button below to sign in with your Google account.
          </p>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border rounded-md shadow text-gray-800 hover:shadow-md transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </div>
        
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium">Troubleshooting</h3>
          <ul className="space-y-1">
            <li>
              <Link href="/auth/callback?test=true" className="text-primary hover:underline">
                Test Auth Callback
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </Link>
            </li>
            <li>
              <Link href="/" className="text-primary hover:underline">
                Go to Home
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}