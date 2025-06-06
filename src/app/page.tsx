"use client"

// Remove Supabase client imports entirely
import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
// Also remove Supabase types
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight, Settings, Puzzle, Sparkles, Slack, GitMerge, Clock, TrendingUp, BarChart3, ShoppingBag } from "lucide-react"
import Image from "next/image"
import ClientOnly from "@/components/client-only"

// Simple grid background component with larger grid
const GridBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
      {/* Main grid with slightly larger spacing */}
      <div className="w-full h-full" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center center',
             opacity: 0.4
           }}>
      </div>
      
      {/* Accent lines (slightly darker, spaced further apart) */}
      <div className="absolute inset-0 w-full h-full" 
           style={{ 
             backgroundImage: `
               linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
               linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
             `,
             backgroundSize: '160px 160px',
             backgroundPosition: 'center center',
             opacity: 0.5
           }}>
      </div>
    </div>
  );
};

// Simple component to display the star.png image
const StarLogo = () => {
  return (
    <div className="relative z-10 w-[260px] h-[260px] flex items-center justify-center">
      <Image
        src="/integriverse/star.png"
        alt="Marketfy Logo"
        width={260}
        height={260}
        className="relative z-10"
      />
    </div>
  );
};

export default function Home() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [showAuth, setShowAuth] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Function to validate email domain
  const validateEmailDomain = useCallback((email: string): boolean => {
    const allowedDomains = ['lysi.co', 'webloo.com']
    return allowedDomains.some(domain => email.toLowerCase().endsWith(`@${domain}`))
  }, [])

  // Email domain validation is now handled server-side

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Use server API route to get session
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        
        if (data.session) {
          const userEmail = data.session.user.email
          // Validate existing session emails
          if (userEmail && !validateEmailDomain(userEmail)) {
            // Sign out using server API instead of client Supabase
            await fetch('/api/auth/signout', { method: 'POST' })
            setError("Only @lysi.co and @webloo.com email addresses are allowed")
            return
          }
          router.push("/multiverse")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    }
    
    // Check auth status on mount
    checkUser()
    
    // No need for Supabase onAuthStateChange - use polling instead for simpler implementation
    const interval = setInterval(checkUser, 5000) // Check every 5 seconds (optional)
    
    return () => {
      clearInterval(interval)
    }
  }, [router, validateEmailDomain])

  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-24 bg-white/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <Image
                src="/integriverse/logo.png"
                alt="Marketfy Logo"
                width={140}
                height={140}
                className="rounded-xl"
              />
            </div>
          </div>
          <button
            className="rounded-full text-sm h-9 px-6 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-all duration-300 group flex items-center shadow-sm"
            onClick={() => setShowAuth(true)}
          >
            <span className="font-normal text-gray-800 group-hover:text-gray-800">Get Started</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-8 space-y-6 rounded-xl bg-white dark:bg-neutral-900 shadow-lg border border-emerald-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/40 to-white/0 pointer-events-none"></div>
            <div className="relative mb-6 z-10">              
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-medium text-gray-800 flex items-center gap-2">
                    Sign In <Sparkles className="w-5 h-5 text-emerald-500" />
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAuth(false)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  ✕
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <ClientOnly>
              <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-emerald-800">Sign in with email</h3>
                  <form 
                    className="space-y-4" 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const email = formData.get('email') as string;
                      const password = formData.get('password') as string;
                      
                      // Set signing in state to true
                      setIsSigningIn(true);
                      
                      // Remove domain validation
                      // if (!validateEmailDomain(email)) {
                      //   setError("Only @lysi.co and @webloo.com email addresses are allowed");
                      //   setIsSigningIn(false);
                      //   return;
                      // }
                      
                      try {
                        // Use server route for authentication
                        const response = await fetch('/api/auth/signin', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ email, password }),
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Failed to sign in');
                        }
                        
                        // On success, redirect to the multiverse page
                        router.push('/multiverse');
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "An error occurred during sign in");
                        setIsSigningIn(false);
                      }
                    }}
                  >
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs text-gray-700">Email address</label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        className="w-full px-3 py-2 rounded-full border border-emerald-100 text-gray-800 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none text-sm" 
                        required
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowAuth(true);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="password" className="text-xs text-gray-700">Password</label>
                      <input 
                        id="password"
                        name="password"
                        type="password" 
                        className="w-full px-3 py-2 rounded-full border border-emerald-100 text-gray-800 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 focus:outline-none text-sm" 
                        required 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSigningIn}
                      className="w-full h-11 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-all flex items-center justify-center shadow-sm"
                    >
                      {isSigningIn ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-emerald-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsSigningIn(true);
                      setShowAuth(true);
                      window.location.href = '/api/auth/signin/google';
                    }}
                    disabled={isSigningIn}
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-full border border-emerald-100 hover:bg-emerald-50 transition-colors disabled:opacity-70"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
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
                    </svg>
                    <span className="text-sm text-gray-800 font-medium">Google</span>
                  </button>
                </div>
              </div>
            </ClientOnly>
          </div>
        </div>
      )}

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center">
          {/* Simple grid background */}
          <GridBackground />
          
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              {/* Text Content - Left */}
              <div className="flex-1 flex flex-col items-start text-left gap-8">
                {/* Pill Tag with Glassy Green Look */}
                <div className="mb-2 inline-block">
                  <span className="px-4 py-1.5 text-xs font-medium rounded-full flex items-center gap-1.5 bg-emerald-50/70 border border-emerald-200/50 text-emerald-700 shadow-sm backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/10 via-emerald-200/20 to-green-300/10 backdrop-blur-sm"></div>
                    <Sparkles className="w-4 h-4 text-emerald-500 relative z-10" />
                    <span className="relative z-10">AI-Powered Product Research</span>
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black -mt-1">
                  Uncover Hidden <span className="relative inline-flex items-center underline decoration-emerald-500 decoration-4 underline-offset-4 text-emerald-500">Gems <Sparkles className="ml-1 w-7 h-7 text-emerald-500" /></span> for Your E-Commerce Empire
                </h1>
                
                {/* Description */}
                <p className="text-base text-gray-400 max-w-xl leading-relaxed -mt-4">
                  Stop wasting hours on manual research. Identify <span className="underline decoration-gray-400 text-black">winning products</span> before they explode. Get precise intelligence for <span className="underline decoration-gray-400 text-black">dropshipping</span> and FBA.
                </p>
                
                {/* Get Started Button */}
                <button
                  className="rounded-full text-base h-12 px-10 bg-white border border-gray-200 text-gray-800 -mt-4 flex items-center shadow-sm hover:bg-gray-50 transition-all duration-300 group"
                  onClick={() => setShowAuth(true)}
                >
                  <span className="font-normal text-gray-800 group-hover:text-gray-800">Find <span className="font-bold text-emerald-500 underline decoration-emerald-500 decoration-2 underline-offset-2">Winning</span> Products</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              
              {/* Logo with Product Research Icons - Right */}
              <div className="flex-1 flex justify-center md:justify-end">
                <div className="relative -mt-20">
                  {/* Simple subtle background spacing only */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]"></div>
                
                  <div className="flex flex-col items-center relative">
                    {/* Main Logo - Closer to Grid */}
                    <div className="mb-1 relative">
                      <StarLogo />
                    </div>
                    
                    {/* Simple platform logo display */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-lg mb-5">
                      {/* First Row */}
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <TrendingUp className="w-9 h-9 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Trend Analysis</span>
                      </div>
                      
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <ShoppingBag className="w-9 h-9 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Amazon FBA</span>
                      </div>
                      
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <BarChart3 className="w-9 h-9 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Ad Research</span>
                      </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="rgb(107, 114, 128)">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Influencer Data</span>
                      </div>
                      
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="rgb(107, 114, 128)">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Video Trends</span>
                      </div>
                      
                      <div className="flex flex-col items-center platform-icon">
                        <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                          <Sparkles className="w-9 h-9 text-gray-700" />
                        </div>
                        <span className="text-xs text-gray-600 text-center font-medium">Market Analysis</span>
                      </div>
                    </div>

                    {/* Third Row with Fade Effect */}
                    <div className="relative w-full max-w-lg mt-5">
                      {/* Bottom fade overlay */}
                      <div className="absolute -bottom-10 left-0 w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                      
                      {/* Grid content */}
                      <div className="grid grid-cols-3 gap-4 w-full relative z-0">
                        <div className="flex flex-col items-center platform-icon">
                          <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-9 h-9" fill="rgb(107, 114, 128)">
                              <path d="M15.5 3.5c-.1-.7-.5-1.5-1.3-1.5-.1 0-.2 0-.3.1-.4.2-.5.5-.6.9v.2c-.1.6-.1 1.9-.7 2.1-.6.1-1.4-2-1.7-2.4-.1-.2-.3-.4-.5-.5-.1-.1-.3-.2-.5-.3-.1-.1-.3 0-.4 0-.9.4-1.9 1.3-2.1 2.9-.1.6-.2 1.1-.2 1.5-.6.1-1.2.2-1.7.4-1.1.3-1.1.3-1.2 1.2C4.1 8.9 3 19.8 3 19.8l10.8 2 5.9-1.3S16.3 6.7 16 5.3c-.1-.6-.3-.9-.5-1.8zm-2.9.9c-.3.1-.6.1-.9.1 0-.5.1-1.2.3-1.5.3.5.5 1 .6 1.4zM12 7.5l-.8 2.6s-.8-.4-1.8-.3c-1.5 0-1.5.9-1.5 1.1.1 1.1 2.9 1.4 3.1 4 .2 2.1-1.1 3.6-2.9 3.7-2.2.1-3.3-1.2-3.3-1.2l.5-1.8s1.2.8 2.1.7c.6 0 .8-.5.8-.9 0-1.4-2.4-1.4-2.6-3.6-.2-1.9 1.1-3.8 3.8-4 1-.1 1.6.3 1.6.3z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-600 text-center font-medium">Shopify</span>
                        </div>
                        
                        <div className="flex flex-col items-center platform-icon">
                          <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="rgb(107, 114, 128)">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.094.379-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-600 text-center font-medium">Pinterest</span>
                        </div>
                        
                        <div className="flex flex-col items-center platform-icon">
                          <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center mb-2 border border-gray-100 shadow-sm">
                            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="rgb(107, 114, 128)">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-600 text-center font-medium">TikTok</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}