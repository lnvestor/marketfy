"use client"

// Remove Supabase client imports entirely
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
// Also remove Supabase types
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight, Settings, Puzzle, Sparkles, Slack, GitMerge, Clock } from "lucide-react"
import Image from "next/image"
import ClientOnly from "@/components/client-only"

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-xl border-b border-zinc-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:8px_8px] rounded-xl"></div>
              <Image
                src="/integriverse/logo.png"
                alt="Integriverse Logo"
                width={40}
                height={40}
                className="rounded-xl relative z-10"
              />
            </div>
            <span className="text-xl font-medium text-black">
              Integriverse
            </span>
          </div>
          <div className="flex items-center">
            <Button
              className="relative group overflow-hidden rounded-md bg-white text-black border border-zinc-200 hover:bg-gray-50 transition-all duration-300"
              onClick={() => setShowAuth(true)}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:4px_4px] transition-opacity duration-300" />
              <span className="relative z-10 px-3 text-black">App</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md p-8 space-y-6 rounded-xl bg-white dark:bg-neutral-900 shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all duration-300">
            <div className="relative mb-6">              
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-medium text-black dark:text-white">Sign In</h2>
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
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-black">Sign in with email</h3>
                  <form 
                    className="space-y-4" 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const email = formData.get('email') as string;
                      const password = formData.get('password') as string;
                      
                      // Set signing in state to true
                      setIsSigningIn(true);
                      
                      // Validate email domain
                      if (!validateEmailDomain(email)) {
                        setError("Only @lysi.co and @webloo.com email addresses are allowed");
                        setIsSigningIn(false);
                        return;
                      }
                      
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
                      <label htmlFor="email" className="text-xs text-black">Email (@lysi.co or @webloo.com only)</label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        className="w-full px-3 py-2 rounded-md border border-zinc-200 text-black focus:border-gray-400 focus:outline-none text-sm" 
                        required
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowAuth(true);
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="password" className="text-xs text-black">Password</label>
                      <input 
                        id="password"
                        name="password"
                        type="password" 
                        className="w-full px-3 py-2 rounded-md border border-zinc-200 text-black focus:border-gray-400 focus:outline-none text-sm" 
                        required 
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSigningIn}
                      className="w-full h-11 rounded-md bg-black text-white font-medium hover:opacity-90 transition-all flex items-center justify-center"
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
                    <div className="w-full border-t border-zinc-200"></div>
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
                    className="w-full flex items-center justify-center gap-2 h-11 rounded-md border border-zinc-200 hover:bg-gray-50 transition-colors disabled:opacity-70"
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
                    <span className="text-sm text-black font-medium">Google</span>
                  </button>
                </div>
              </div>
            </ClientOnly>
          </div>
        </div>
      )}

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Grid Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Base Grid Pattern */}
            <div className="absolute inset-0 cosmic-grid" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            
            {/* Larger Grid Pattern */}
            <div className="absolute inset-0 cosmic-grid" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)", backgroundSize: "80px 80px", animationDelay: "-4s" }} />
            
            {/* Ambient Glow */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.03) 0%, transparent 60%)" }} />
            
            {/* Minimal Node Animation */}
            <svg className="w-full h-full absolute" xmlns="http://www.w3.org/2000/svg">
              {/* Nodes */}
              <circle cx="15%" cy="15%" r="1.2" fill="rgba(0, 0, 0, 0.15)" className="star" />
              <circle cx="25%" cy="25%" r="0.8" fill="rgba(0, 0, 0, 0.12)" className="star" />
              <circle cx="85%" cy="20%" r="1" fill="rgba(0, 0, 0, 0.10)" className="star" />
              <circle cx="75%" cy="75%" r="1.5" fill="rgba(0, 0, 0, 0.12)" className="star" />
              <circle cx="30%" cy="65%" r="0.9" fill="rgba(0, 0, 0, 0.10)" className="star" />
              <circle cx="60%" cy="30%" r="1.1" fill="rgba(0, 0, 0, 0.12)" className="star" />
              <circle cx="90%" cy="55%" r="0.7" fill="rgba(0, 0, 0, 0.15)" className="star" />
              <circle cx="10%" cy="85%" r="1.3" fill="rgba(0, 0, 0, 0.10)" className="star" />
              <circle cx="45%" cy="90%" r="0.8" fill="rgba(0, 0, 0, 0.12)" className="star" />
              <circle cx="70%" cy="10%" r="1" fill="rgba(0, 0, 0, 0.15)" className="star" />
              <circle cx="38%" cy="42%" r="1.2" fill="rgba(0, 0, 0, 0.10)" className="star" />
              <circle cx="80%" cy="40%" r="0.9" fill="rgba(0, 0, 0, 0.12)" className="star" />
              
              {/* Connection Lines */}
              <path d="M 20% 20% Q 35% 30%, 50% 40%" className="cosmic-connection" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="1" fill="none" />
              <path d="M 80% 15% Q 70% 30%, 60% 45%" className="cosmic-connection" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="1" fill="none" />
              <path d="M 30% 65% Q 40% 50%, 50% 40%" className="cosmic-connection" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="1" fill="none" />
              <path d="M 75% 75% Q 65% 60%, 55% 45%" className="cosmic-connection" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="1" fill="none" />
              <path d="M 45% 40% C 50% 50%, 55% 35%, 60% 45%" className="cosmic-connection" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="1" fill="none" />
              
              {/* Main Node */}
              <g className="cosmic-object">
                <circle cx="50%" cy="40%" r="15" fill="rgba(0, 0, 0, 0.04)" className="cosmic-node" />
                <circle cx="50%" cy="40%" r="25" fill="none" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="1" />
                <circle cx="50%" cy="40%" r="35" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.5" />
              </g>
              
              {/* Secondary Nodes */}
              <g className="cosmic-object" style={{animationDelay: "-5s"}}>
                <circle cx="25%" cy="22%" r="8" fill="rgba(0, 0, 0, 0.03)" className="cosmic-node" />
                <circle cx="25%" cy="22%" r="12" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.8" />
              </g>
              
              <g className="cosmic-object" style={{animationDelay: "-10s"}}>
                <circle cx="80%" cy="18%" r="10" fill="rgba(0, 0, 0, 0.03)" className="cosmic-node" />
                <circle cx="80%" cy="18%" r="15" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.8" />
              </g>
              
              <g className="cosmic-object" style={{animationDelay: "-15s"}}>
                <circle cx="30%" cy="70%" r="9" fill="rgba(0, 0, 0, 0.03)" className="cosmic-node" />
                <circle cx="30%" cy="70%" r="14" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.8" />
              </g>
              
              <g className="cosmic-object" style={{animationDelay: "-7s"}}>
                <circle cx="75%" cy="68%" r="7" fill="rgba(0, 0, 0, 0.03)" className="cosmic-node" />
                <circle cx="75%" cy="68%" r="11" fill="none" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="0.8" />
              </g>
            </svg>
          </div>
          
          {/* Subtle Glow Effects */}
          <div className="absolute right-0 top-20 w-96 h-96 bg-black/[0.015] rounded-full blur-3xl" />
          <div className="absolute left-20 bottom-20 w-64 h-64 bg-black/[0.015] rounded-full blur-3xl" />
          <div className="absolute right-40 bottom-40 w-48 h-48 bg-black/[0.015] rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-black text-sm font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                  </span>
                  AI-Powered Integration Platform
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold">
                  <span className="text-black">
                    Build integrations with
                  </span>
                  <br />
                  <span className="text-black">
                    AI assistance
                  </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-2xl">
                  Create powerful integrations effortlessly with our AI-powered platform. Connect your favorite tools and automate your workflows with intelligent assistance.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="rounded-md text-base h-12 px-8 bg-black text-white hover:opacity-90"
                    onClick={() => setShowAuth(true)}
                  >
                    <span className="text-white">Sign In</span>
                    <ArrowRight className="ml-2 h-5 w-5 text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-md text-base h-12 px-8 border-zinc-200 bg-white hover:bg-white"
                  >
                    <span className="text-black">Watch Demo</span>
                    <ChevronRight className="ml-2 h-5 w-5 text-black" />
                  </Button>
                </div>

                <div className="pt-10 flex justify-center w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
                    {/* App Card 1 */}
                    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 p-6 transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-zinc-200 dark:border-zinc-700">
                          <Puzzle className="w-7 h-7 text-black dark:text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white text-xl">100+</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Integrations</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with popular platforms and build powerful automations across your tech stack.</p>
                      
                      <div className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-black dark:bg-white opacity-30"></span>
                        <span className="relative rounded-full h-2 w-2 bg-black dark:bg-white"></span>
                      </div>
                    </div>
                    
                    {/* App Card 2 */}
                    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 p-6 transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-zinc-200 dark:border-zinc-700">
                          <Settings className="w-7 h-7 text-black dark:text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white text-xl">1M+</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Automation Tasks</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Automate repetitive tasks and workflows with AI assistance to boost productivity.</p>
                      
                      <div className="absolute top-3 right-3 w-12 h-3 rounded-full bg-gray-200 dark:bg-neutral-700"></div>
                    </div>
                    
                    {/* App Card 3 */}
                    <div className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-zinc-800 p-6 transition-all duration-300 hover:-translate-y-1">
                      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 dark:bg-neutral-800 border border-zinc-200 dark:border-zinc-700">
                          <Clock className="w-7 h-7 text-black dark:text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black dark:text-white text-xl">10K+</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Hours Saved</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Save thousands of hours with automated workflows and intelligent integrations.</p>
                      
                      <div className="absolute top-3 right-3 flex space-x-1">
                        <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-neutral-700"></div>
                        <div className="h-3 w-3 rounded-full bg-gray-400 dark:bg-neutral-600"></div>
                        <div className="h-3 w-3 rounded-full bg-gray-500 dark:bg-neutral-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex justify-center items-center">
                <div className="relative w-[400px] h-[400px] group mt-[-180px]">
                  {/* Modern Grid Pattern */}
                  <div className="absolute inset-0">
                    {/* Base Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:16px_16px] opacity-10" />
                    {/* Larger Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
                    {/* Center Glow */}
                    <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.03) 0%, transparent 70%)" }} />
                  </div>
                  
                  {/* Logo with Animation */}
                  <div className="relative w-full h-full transition-all duration-500 group-hover:scale-105">
                    <Image
                      src="/integriverse/logo.png"
                      alt="Integriverse"
                      fill
                      className="object-contain"
                      priority
                      quality={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Dashboard Showcase */}
        <section className="py-32 relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Dashboard Showcase with SVG Annotations */}
            <div className="relative flex flex-col items-center mb-32">
              <div className="relative w-full transform perspective-1000 hover:-translate-y-2 transition-all duration-700 z-10">
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
                <div className="relative z-20 rounded-2xl overflow-hidden border border-zinc-200 shadow-2xl hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-700">
                  {/* Dashboard image */}
                  <Image
                    src="/integriverse/dashbaod.png"
                    alt="Integriverse Dashboard"
                    width={1200}
                    height={700}
                    className="w-full h-auto"
                    priority
                  />
                  
                  {/* Interactive overlay points */}
                  <button 
                    className="absolute z-30 group"
                    style={{ top: '35%', left: '25%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-7 left-3 transition-opacity duration-300 pointer-events-none">
                      <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:8px_8px] rounded-lg"></div>
                        <div className="relative z-10 px-4 py-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
                          <span className="text-black font-medium block whitespace-nowrap">Ready Prompts</span>
                          <span className="text-gray-600 text-xs block mt-1 max-w-[220px]">Pre-built templates for common tasks like querying saved searches or creating Celigo integrations.</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    className="absolute z-30 group"
                    style={{ bottom: '5.5%', left: '76%', transform: 'translate(-50%, 50%)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-7 left-3 transition-opacity duration-300 pointer-events-none">
                      <div className="relative inline-block mb-2">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:8px_8px] rounded-lg"></div>
                        <div className="relative z-10 px-4 py-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
                          <span className="text-black font-medium block whitespace-nowrap">Step-by-Step Reasoning</span>
                          <span className="text-gray-600 text-xs block mt-1 max-w-[200px]">AI explains its thinking process, showing each logical step for transparent decision making.</span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button 
                    className="absolute z-30 group"
                    style={{ top: '4%', right: '2%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-lg">
                      <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 absolute top-7 right-3 transition-opacity duration-300 pointer-events-none">
                      <div className="relative inline-block mt-2">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:8px_8px] rounded-lg"></div>
                        <div className="relative z-10 px-4 py-2 bg-white border border-zinc-200 rounded-lg shadow-sm">
                          <span className="text-black font-medium block whitespace-nowrap">Connect Addons</span>
                          <span className="text-gray-600 text-xs block mt-1 max-w-[220px]">Choose which integrations to chat with. Currently NetSuite and Celigo are available.</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Feature List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="relative group rounded-2xl p-6 bg-white border border-zinc-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px] opacity-50" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                    <Settings className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Intuitive Interface</h3>
                  <p className="text-gray-600">Navigate our clean, minimalist dashboard with ease. Enjoy a user-friendly design with quick access to all features.</p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="relative group rounded-2xl p-6 bg-white border border-zinc-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px] opacity-50" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center mb-4">
                    <Puzzle className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">Powerful Connections</h3>
                  <p className="text-gray-600">Connect to NetSuite, Celigo, and over 100 other business applications with OAuth 2.0 integration.</p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="relative group rounded-2xl p-6 bg-white border border-zinc-200 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:16px_16px] opacity-50" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-2">AI-Powered Building</h3>
                  <p className="text-gray-600">Build custom integrations with AI assistance. Create, test, and deploy workflows without complex coding.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Icons Carousel */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold text-black">
                Supported Integrations
              </h2>
              <p className="text-lg text-gray-600">
                Connect with your favorite tools and services
              </p>
            </div>

            {/* Infinite Scroll Animation */}
            <div className="relative overflow-hidden">
              {/* Gradient Fades */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
              
              <div className="flex gap-8 animate-scroll hover:[animation-play-state:paused] group">
                {/* First Set */}
                <div className="flex gap-8 min-w-max">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/NetSuite.png" alt="NetSuite" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/celigo.jpg" alt="Celigo" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Slack className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <GitMerge className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/Claude.png" alt="Claude AI" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/exa.jpg" alt="Exa" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Settings className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                {/* Second Set */}
                <div className="flex gap-8 min-w-max">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/NetSuite.png" alt="NetSuite" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/celigo.jpg" alt="Celigo" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Slack className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <GitMerge className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/Claude.png" alt="Claude AI" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Image src="/logos/exa.jpg" alt="Exa" width={40} height={40} className="rounded-lg transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Settings className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-zinc-200 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-black/70 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Changelog Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold text-black dark:text-white">
                Latest Updates
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                New features and improvements
              </p>
            </div>

            <div className="space-y-2 max-w-3xl mx-auto">
              {/* Changelog Item 1 */}
              <div className="group relative border border-zinc-200 rounded-md p-5 bg-white hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-black group-hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs font-medium">1.0.6</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">March 5, 2025</div>
                    <div className="px-1.5 py-0.5 bg-gray-100 rounded-sm text-[10px] font-medium text-black">NEW</div>
                    <h3 className="text-sm font-medium text-black ml-1">Token usage tracking</h3>
                  </div>
                </div>
                
                <div className="relative overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[400px]">
                  <div className="space-y-2 pl-11 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div>
                      <p className="text-xs font-medium text-black">Added</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Detailed token usage tracking with cost estimation for Claude 3.7 Sonnet
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Usage pill showing token counts and estimated costs
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Visual breakdown of input/output tokens and costs
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-black">Changed</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Modern UI themes with black/white design
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Streamlined interfaces with consistent pill designs
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changelog Item 2 */}
              <div className="group relative border border-zinc-200 rounded-md p-5 bg-white hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-black group-hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs font-medium">1.0.5</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">February 18, 2025</div>
                    <h3 className="text-sm font-medium text-black">NetSuite integration enhancements</h3>
                  </div>
                </div>
                
                <div className="relative overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[400px]">
                  <div className="space-y-2 pl-11 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div>
                      <p className="text-xs font-medium text-black">Added</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Advanced SuiteQL support for complex queries
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Improved saved search integration
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-black">Fixed</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          OAuth token refresh issues
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Error handling for rate-limited API calls
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changelog Item 3 */}
              <div className="group relative border border-zinc-200 rounded-md p-5 bg-white hover:bg-gray-50 transition-all duration-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-black group-hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs font-medium">1.0.4</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">January 22, 2025</div>
                    <h3 className="text-sm font-medium text-black">AI multiverse interface</h3>
                  </div>
                </div>
                
                <div className="relative overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[400px]">
                  <div className="space-y-2 pl-11 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div>
                      <p className="text-xs font-medium text-black">Added</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          New multiverse chat interface for AI interactions
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Step-by-step reasoning mode for complex operations
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          PDF and image upload support for multimodal analysis
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-black">Improved</p>
                      <ul className="mt-1 space-y-1">
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Chat message persistence across sessions
                        </li>
                        <li className="text-xs text-gray-600 flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-black" />
                          Response streaming for faster feedback
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold text-black dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Get answers to common questions about Integriverse
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 max-w-5xl mx-auto">
              {/* FAQ Item 1 */}
              <div className="group relative border border-zinc-200 rounded-md hover:bg-gray-50 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-black">What platforms can I integrate with?</h3>
                    <div className="h-4 w-4 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[200px]">
                    <p className="mt-2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300">Integriverse supports NetSuite, Celigo, and over 100 other business applications. Our AI-powered integration tools simplify connecting to APIs and building workflows across your tech stack.</p>
                  </div>
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div className="group relative border border-zinc-200 rounded-md hover:bg-gray-50 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-black">How does the AI assistance work?</h3>
                    <div className="h-4 w-4 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[200px]">
                    <p className="mt-2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300">Our AI uses Claude 3.7 Sonnet to help you build integrations through natural language. Simply describe what you want to accomplish, and the AI will assist with code generation, API queries, and troubleshooting.</p>
                  </div>
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div className="group relative border border-zinc-200 rounded-md hover:bg-gray-50 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-black">Is my data secure?</h3>
                    <div className="h-4 w-4 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[200px]">
                    <p className="mt-2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300">Yes, we prioritize data security. We don&apos;t store your data, use end-to-end encryption, and comply with industry standards. All integrations run within your secure environment.</p>
                  </div>
                </div>
              </div>

              {/* FAQ Item 4 */}
              <div className="group relative border border-zinc-200 rounded-md hover:bg-gray-50 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-black">How is token usage billed?</h3>
                    <div className="h-4 w-4 rounded-full border border-zinc-200 flex items-center justify-center group-hover:border-black transition-all duration-300">
                      <div className="h-1.5 w-1.5 rounded-full bg-black opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-[200px]">
                    <p className="mt-2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-300">Token usage is tracked and billed based on actual consumption. The platform provides detailed metrics showing input/output tokens and estimated costs. Pre-paid credits are available for enterprise accounts.</p>
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
