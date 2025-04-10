"use client"

import { useEffect, useState, FormEvent, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { getCurrentUser, signOut } from "@/lib/client/user-api"
import { getUserProfile } from "@/lib/client/profile-api"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { 
  LogOut, 
  Loader2,
  Lightbulb,
  ArrowRight,
  UserCircle,
  MessageSquare,
  Shield,
  ListTodo,
  PlayCircle,
  Check,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
// Import optimized versions - use static imports for SSR optimization
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { getUserBalance } from "@/lib/user-token-usage"
// AddCreditsDialog removed

// Dynamic imports for better loading performance
const ProfileSetupDialog = dynamic(
  () => import("@/components/profile-setup-dialog").then(mod => ({ default: mod.ProfileSetupDialog })),
  { ssr: false, loading: () => null }
)

type RequestForm = {
  name: string;
  email: string;
  company: string;
  description: string;
};

// Cache keys
const DASHBOARD_CACHE_KEY = 'dashboard_data_cache';
const DASHBOARD_CACHE_EXPIRY = 'dashboard_cache_expiry';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Type for dashboard cache
interface DashboardCache {
  user: User | null;
  totalAddons: number;
  connectedConnections: number;
  isAdmin: boolean;
  featureRequests: {
    pending: number;
    in_progress: number;
    approved: number;
    userFeatures: {
      id: string;
      name: string;
      description: string;
      status: string;
    }[];
  };
  timestamp: number;
}

import { Suspense } from 'react';

// Main dashboard content component that uses client-side features
// Convert to forwardRef to allow parent to access the component's functions
const DashboardContent = forwardRef(function DashboardContent(
  { onShowAddCredits }: { onShowAddCredits: () => void },
  ref
) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceRefresh = searchParams.has('refresh');
  const insufficientBalance = searchParams.has('insufficient_balance');
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false) // Profile dialog only shows when user clicks the button
  const [totalAddons, setTotalAddons] = useState(0)
  const [connectedConnections, setConnectedConnections] = useState(0)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [balance, setBalance] = useState<number | null>(null) // For token balance
  // For credits dialog - update the shared state variable
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showAddCredits, setShowAddCredits] = useState(false)
  
  // Use useEffect to check balance at component mount
  useEffect(() => {
    // Load the initial balance
    getUserBalance().then(initialBalance => {
      setBalance(initialBalance);
    });
  }, []);
  
  // Expose setShowAddCredits to parent component through the ref
  useImperativeHandle(ref, () => ({
    setShowAddCredits: (value: boolean) => {
      setShowAddCredits(value);
    }
  }));
  const [formData, setFormData] = useState<RequestForm>({
    name: '',
    email: '',
    company: '',
    description: ''
  })
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null)
  
  // State to store feature requests with memoization
  const [featureRequests, setFeatureRequests] = useState<{
    pending: number;
    in_progress: number;
    approved: number;
    userFeatures: {
      id: string;
      name: string;
      description: string;
      status: string;
    }[];
  }>({
    pending: 0,
    in_progress: 0,
    approved: 0,
    userFeatures: []
  })
  
  // Cache references
  const cacheRef = useRef<DashboardCache | null>(null)
  const sessionLoadedRef = useRef<boolean>(false)
  
  // Check if we have a memory cache (for same-session navigation)
  const hasMemoryCache = !!cacheRef.current
  
  // Check for storage cache (for returning to site)
  const checkStorageCache = useCallback(() => {
    try {
      // Don't use cache if refresh is requested or not in browser
      if (forceRefresh || typeof window === 'undefined') return null;
      
      // Check expiry first
      const expiryStr = window.localStorage.getItem(DASHBOARD_CACHE_EXPIRY);
      if (!expiryStr) return null;
      
      const expiry = parseInt(expiryStr, 10);
      if (Date.now() > expiry) {
        // Cache expired, clear it
        window.localStorage.removeItem(DASHBOARD_CACHE_KEY);
        window.localStorage.removeItem(DASHBOARD_CACHE_EXPIRY);
        return null;
      }
      
      // Cache still valid, retrieve it
      const cacheStr = window.localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!cacheStr) return null;
      
      return JSON.parse(cacheStr) as DashboardCache;
    } catch (e) {
      console.error('Error retrieving dashboard cache:', e);
      return null;
    }
  }, [forceRefresh]);

  // Setup to cache the dashboard data 
  const cacheData = useCallback((data: DashboardCache) => {
    // Keep in memory cache
    cacheRef.current = data;
    
    // Save to localStorage for persistence if in browser
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(data));
        window.localStorage.setItem(DASHBOARD_CACHE_EXPIRY, (Date.now() + CACHE_TTL).toString());
      } catch (e) {
        console.error('Failed to cache dashboard data:', e);
      }
    }
  }, []);

  // Load user balance
  useEffect(() => {
    const loadUserBalance = async () => {
      try {
        const userBalance = await getUserBalance();
        setBalance(userBalance);
      } catch (error) {
        console.error('Error loading user balance:', error);
      }
    };
    
    if (user) {
      loadUserBalance();
    }
  }, [user]);

  useEffect(() => {
    // Aggressively prefetch navigation routes for instant navigation
    const prefetchRoutes = ['/multiverse', '/admin']
    prefetchRoutes.forEach(route => router.prefetch(route))

    const loadDashboard = async () => {
      try {
        // First, check if we have an in-memory cache (fastest)
        if (hasMemoryCache && !forceRefresh) {
          const cache = cacheRef.current!;
          
          // Restore from memory cache
          setUser(cache.user);
          setTotalAddons(cache.totalAddons);
          setConnectedConnections(cache.connectedConnections);
          setIsAdmin(cache.isAdmin);
          setFeatureRequests(cache.featureRequests);
          setLoading(false);
          
          // Don't hit the server if we've loaded session data during this browser session
          if (sessionLoadedRef.current) {
            return;
          }
        }
        
        // Next, check if we have localStorage cache
        const storageCache = checkStorageCache();
        if (storageCache && !forceRefresh) {
          // Restore from localStorage
          setUser(storageCache.user);
          setTotalAddons(storageCache.totalAddons);
          setConnectedConnections(storageCache.connectedConnections);
          setIsAdmin(storageCache.isAdmin);
          setFeatureRequests(storageCache.featureRequests);
          
          // Keep cache in memory too
          cacheRef.current = storageCache;
          
          // Fade out loading quickly since we're using cached data
          setTimeout(() => setLoading(false), 100);
          
          // Refresh data in background
          refreshDataInBackground();
          return;
        }
        
        // No cache or forced refresh, load data from server
        await loadDataFromServer();
        
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoading(false);
      }
    };
    
    // Load from server when no cache is available
    const loadDataFromServer = async () => {
      try {
        // Check authentication first using our API
        const user = await getCurrentUser();
        if (!user) {
          router.push("/");
          return;
        }
        
        // Mark session as loaded for this app session
        sessionLoadedRef.current = true;
        setUser(user);

        // Fetch all data in parallel for maximum performance
        const fetchAllData = async () => {
          // Get profile info first using our API
          const profile = await getUserProfile('full_name, company_name, role');
          setIsAdmin(profile?.role === 'admin');

          // Handle profile setup if needed
          const needsProfileSetup = !profile?.full_name || !profile?.company_name;
          if (needsProfileSetup) {
            try {
              const cachedProfile = typeof window !== 'undefined' ? window.localStorage.getItem('userProfile') : null;
              if (cachedProfile) {
                const parsedProfile = JSON.parse(cachedProfile);
                if (parsedProfile.full_name && parsedProfile.company_name) {
                  // Quietly update profile in background
                  supabase.from('profiles').upsert({
                    id: session.user.id,
                    full_name: parsedProfile.full_name,
                    company_name: parsedProfile.company_name,
                    company_logo: parsedProfile.company_logo,
                    company_size: parsedProfile.company_size,
                    phone: parsedProfile.phone,
                    linkedin: parsedProfile.linkedin,
                    website: parsedProfile.website,
                    username: parsedProfile.username,
                    is_profile_completed: true,
                    updated_at: new Date().toISOString()
                  }, { onConflict: 'id' });
                }
              }
            } catch (e) {
              console.error('Error with profile cache:', e);
            }
          }

          // Import the required API functions
          const { getAddonCounts } = await import('@/lib/client/addons-api');
          
          // Get addon counts from our API
          const addonCounts = await getAddonCounts();
          
          // For now, still use Supabase for features (this will be updated later)
          const [
            pendingCount, 
            inProgressCount, 
            approvedCount, 
            userFeaturesResponse
          ] = await Promise.all([
            supabase.from('features').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('features').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
            supabase.from('features').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('features')
              .select('id,name,description,status')
              .eq('user_id', user.id)
              .not('status', 'eq', 'pending')
              .order('created_at', { ascending: false })
              .limit(5)
          ]);

          // Update all state at once
          const totalAddonsValue = addonCounts.totalAddons || 0;
          const connectedConnectionsValue = addonCounts.userConnections || 0;
          
          const featureRequestsValue = {
            pending: pendingCount.count || 0,
            in_progress: inProgressCount.count || 0,
            approved: approvedCount.count || 0,
            userFeatures: userFeaturesResponse.data || []
          };
          
          setTotalAddons(totalAddonsValue);
          setConnectedConnections(connectedConnectionsValue);
          setFeatureRequests(featureRequestsValue);
          setIsAdmin(profile?.role === 'admin');
          
          // Cache the dashboard data
          cacheData({
            user: session.user,
            totalAddons: totalAddonsValue,
            connectedConnections: connectedConnectionsValue,
            isAdmin: profile?.role === 'admin',
            featureRequests: featureRequestsValue,
            timestamp: Date.now()
          });
        };

        await fetchAllData();
      } catch (err) {
        console.error("Error loading dashboard:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    
    // Silently refresh data in background without showing loading
    const refreshDataInBackground = async () => {
      try {
        loadDataFromServer();
      } catch (err) {
        console.error('Background refresh error:', err);
      }
    };

    loadDashboard();
  }, [router, forceRefresh, hasMemoryCache, checkStorageCache, cacheData]);

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Memoize navigation cards for performance
  const navigationCards = useMemo(() => [
    {
      title: 'Chat',
      description: 'Interact with AI assistants',
      icon: MessageSquare,
      href: '/multiverse',
      color: 'text-orange-500',
      gradient: 'from-orange-500/20 to-orange-500/0',
      bgGradient: 'from-orange-500/5 via-orange-500/2 to-transparent',
      index: 0,
      needsCredits: true
    },
    ...(isAdmin ? [{
      title: 'Admin',
      description: 'Access administration panel',
      icon: Shield,
      href: '/admin',
      color: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-500/0',
      bgGradient: 'from-blue-500/5 via-blue-500/2 to-transparent',
      index: 3
    }] : [])
  ], [isAdmin])

  // Balance notification effect removed

  // Loading UI with client-side state update after hydration
  const [loadingText, setLoadingText] = useState("Loading your workspace...");
  const [loadingClass, setLoadingClass] = useState("text-muted-foreground");
  const [loaderClass, setLoaderClass] = useState("text-muted-foreground");
  const [pulseClass, setPulseClass] = useState("from-primary/20 via-primary/20 to-primary/20 blur-xl");
  
  // Update the loading UI client-side after initial render
  useEffect(() => {
    // Check if we have cached data to update the UI appropriately
    if (cacheRef.current || (typeof window !== 'undefined' && checkStorageCache())) {
      setLoadingText("Loading from cache...");
      setLoadingClass("text-primary/70");
      setLoaderClass("text-primary/70");
      setPulseClass("from-primary/10 via-primary/10 to-primary/10 blur-lg");
    }
  }, [checkStorageCache]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className={`h-8 w-8 animate-spin ${loaderClass}`} />
            <div className={`absolute inset-0 h-8 w-8 animate-pulse bg-gradient-to-r ${pulseClass}`} />
          </div>
          <div className={`text-sm font-medium ${loadingClass}`}>{loadingText}</div>
        </div>
      </div>
    )
  }

  
  return (
    <>
      {user && (
        <ProfileSetupDialog
          open={showProfileSetup}
          onOpenChange={setShowProfileSetup}
          userId={user.id}
        />
      )}

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request New Feature</DialogTitle>
            <DialogDescription>Tell us what you need</DialogDescription>
          </DialogHeader>

          {submitStatus && (
            <div 
              className={`mb-6 p-4 rounded-xl ${
                submitStatus.type === 'success' 
                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form 
            onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              setIsSubmitting(true);
              setSubmitStatus(null);
              
              try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (!user) throw new Error('Please sign in to submit a request');

                const data = {
                  user_id: user.id,
                  ...formData
                };

                const { error } = await supabase
                  .from('features')
                  .insert([data]);

                if (error) throw error;

                setSubmitStatus({
                  type: 'success',
                  message: 'Your feature request has been submitted successfully!'
                });

                setFormData({
                  name: '',
                  email: '',
                  company: '',
                  description: ''
                });

                setTimeout(() => {
                  setSubmitStatus(null);
                  setShowRequestForm(false);
                }, 2000);

              } catch (error) {
                setSubmitStatus({
                  type: 'error',
                  message: error instanceof Error ? error.message : 'Failed to submit request'
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="space-y-6 py-4"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1.5 w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1.5 w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="mt-1.5 w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                  placeholder="Your company"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1.5 w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all resize-none"
                  placeholder="Describe the feature you need..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative group"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <main className="relative min-h-screen bg-background p-6 transition-colors duration-300">
        <div className="relative mx-auto max-w-7xl space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg backdrop-blur-sm will-change-auto"
            style={{ contain: 'layout paint style' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-primary/10" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute top-0 right-0 h-64 w-64 rounded-bl-[100%] bg-gradient-to-bl from-blue-500/10 via-purple-500/5 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-tr-[100%] bg-gradient-to-tr from-primary/10 via-purple-500/5 to-transparent opacity-40" />
            
            <div className="relative p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="space-y-3 mb-8">
                    <div className="relative inline-block group">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 backdrop-blur-sm px-3 py-1 text-sm font-medium text-primary border border-primary/10 cursor-pointer">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                        </span>
                        <span className="relative">
                          Beta v1.0.8
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                        </span>
                      </div>
                      
                      <div 
                        className="absolute left-0 w-80 rounded-xl bg-card/95 backdrop-blur-sm p-4 shadow-lg border border-border/50 z-[100] hidden group-hover:block"
                        style={{ 
                          top: "calc(100% + 8px)",
                          transform: "translateX(-10%)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -top-1 left-4 w-2 h-2 rotate-45 bg-card/95 border-t border-l border-border/50"></div>
                        <div className="text-xs font-medium mb-2 text-primary">What&apos;s new in v1.0.8:</div>
                        
                        <div className="mb-2">
                          <div className="text-xs font-medium text-blue-400 mb-1">✨ Features</div>
                          <ul className="text-xs space-y-1 pl-2">
                            <li className="text-muted-foreground">🔄 Added message feedback with accuracy slider</li>
                            <li className="text-muted-foreground">💻 Added filter script tool for Celigo integrations</li>
                          </ul>
                        </div>
                        
                        <div className="mb-2">
                          <div className="text-xs font-medium text-emerald-400 mb-1">♻️ Improvements</div>
                          <ul className="text-xs space-y-1 pl-2">
                            <li className="text-muted-foreground">🔋 Improved HTTP export with pagination options</li>
                            <li className="text-muted-foreground">📊 Enhanced Celigo tool integration</li>
                          </ul>
                        </div>
                        
                        <div>
                          <div className="text-xs font-medium text-amber-400 mb-1">🔧 Fixes</div>
                          <ul className="text-xs space-y-1 pl-2">
                            <li className="text-muted-foreground">🔌 Fixed addon connectivity in new chats</li>
                            <li className="text-muted-foreground">⚡ Improved connection state handling</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground flex flex-col">
                      <span>Welcome back</span>
                      <span className="h-1 w-20 bg-gradient-to-r from-primary/60 to-blue-500/30 rounded-full mt-1"></span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="group rounded-2xl bg-gradient-to-br from-card/80 to-card/40 p-0.5 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-primary/10 to-transparent opacity-30"></div>
                      <div className="rounded-2xl bg-card/40 backdrop-blur-sm p-4 h-full relative">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-muted-foreground">Total Addons</p>
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Blocks className="h-3 w-3 text-primary" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1">
                          <p className="text-2xl font-semibold text-foreground">{totalAddons}</p>
                          <div className="h-1 w-8 bg-gradient-to-r from-primary/40 to-transparent rounded-full mb-1.5"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group rounded-2xl bg-gradient-to-br from-card/80 to-card/40 p-0.5 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-blue-500/10 to-transparent opacity-30"></div>
                      <div className="rounded-2xl bg-card/40 backdrop-blur-sm p-4 h-full relative">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-muted-foreground">Connections</p>
                          <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Cable className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1">
                          <p className="text-2xl font-semibold text-foreground">{connectedConnections}</p>
                          <div className="h-1 w-8 bg-gradient-to-r from-blue-500/40 to-transparent rounded-full mb-1.5"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group rounded-2xl bg-gradient-to-br from-card/80 to-card/40 p-0.5 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-amber-500/10 to-transparent opacity-30"></div>
                      <div 
                        className="rounded-2xl bg-card/40 backdrop-blur-sm p-4 h-full relative cursor-pointer" 
                        onClick={() => {
                          router.push('/multiverse');
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium text-muted-foreground">AI Credits</p>
                          <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <DollarSign className="h-3 w-3 text-amber-500" />
                          </div>
                        </div>
                        <div className="flex items-end gap-1">
                          <p className="text-2xl font-semibold text-foreground">${balance !== null ? balance.toFixed(2) : "--"}</p>
                          <div className="h-1 w-8 bg-gradient-to-r from-amber-500/40 to-transparent rounded-full mb-1.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 relative">
                  <Button 
                    variant="outline" 
                    className="group gap-2 rounded-xl relative overflow-hidden"
                    onClick={() => setShowProfileSetup(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4px_4px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <UserCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="relative">Profile Settings</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="group gap-2 rounded-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4px_4px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <LogOut className="h-4 w-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                    <span className="relative">Sign out</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Cards */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 content-visibility-auto">
            {navigationCards.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: card.index * 0.05, // Reduce animation delay
                  duration: 0.3 // Faster animations 
                }}
                layout // Better layout transitions
                layoutId={`card-${card.title}`}
              >
                <div 
                  onClick={() => {
                    // If this is the Chat/Multiverse card and it needs credits, check balance
                    if (card.needsCredits && balance <= 0) {
                      // Use parent component's dialog
                      onShowAddCredits();
                    } else {
                      router.push(card.href);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (card.needsCredits && balance <= 0) {
                        // Use parent component's dialog
                        onShowAddCredits();
                      } else {
                        router.push(card.href);
                      }
                    }
                  }}
                  className="group relative h-[220px] cursor-pointer overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl will-change-transform"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${
                      card.index === 0 ? 'rgba(249, 115, 22, 0.06)' : 
                      card.index === 1 ? 'rgba(124, 58, 237, 0.06)' : 
                      card.index === 3 ? 'rgba(59, 130, 246, 0.06)' :
                      'rgba(16, 185, 129, 0.06)'
                    }, transparent 60%)`,
                    contain: 'paint',
                    translate: 'none',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div 
                    className="absolute top-0 right-0 h-20 w-20 opacity-20 rounded-bl-full" 
                    style={{ 
                      background: `linear-gradient(135deg, ${
                        card.index === 0 ? 'rgba(249, 115, 22, 0.5)' : 
                        card.index === 1 ? 'rgba(124, 58, 237, 0.5)' : 
                        card.index === 3 ? 'rgba(59, 130, 246, 0.5)' :
                        'rgba(16, 185, 129, 0.5)'
                      }, transparent)` 
                    }}
                  />
                  
                  <div className="relative p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gradient-to-br from-background to-card p-0.5">
                          <div 
                            className="absolute inset-0 rounded-xl opacity-30" 
                            style={{
                              background: `linear-gradient(135deg, ${
                                card.index === 0 ? 'rgba(249, 115, 22, 0.2)' : 
                                card.index === 1 ? 'rgba(124, 58, 237, 0.2)' : 
                                card.index === 3 ? 'rgba(59, 130, 246, 0.2)' :
                                'rgba(16, 185, 129, 0.2)'
                              }, transparent)`
                            }}
                          />
                          <div className="relative h-full w-full rounded-xl bg-card flex items-center justify-center">
                            <card.icon className={`h-7 w-7 ${card.color}`} />
                          </div>
                        </div>
                        <div>
                          <h3 className={`text-xl font-semibold ${card.color}`}>{card.title}</h3>
                          <div 
                            className="h-0.5 w-12 mt-1 rounded-full" 
                            style={{ 
                              background: `linear-gradient(to right, ${
                                card.index === 0 ? 'rgba(249, 115, 22, 0.4)' : 
                                card.index === 1 ? 'rgba(124, 58, 237, 0.4)' : 
                                card.index === 3 ? 'rgba(59, 130, 246, 0.4)' :
                                'rgba(16, 185, 129, 0.4)'
                              }, transparent)` 
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-md text-muted-foreground group-hover:text-foreground transition-colors">
                        {card.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <div 
                        className="flex items-center justify-center h-10 w-10 rounded-xl bg-background/60 backdrop-blur-sm"
                        style={{
                          boxShadow: `0 0 0 1px ${
                            card.index === 0 ? 'rgba(249, 115, 22, 0.1)' : 
                            card.index === 1 ? 'rgba(124, 58, 237, 0.1)' : 
                            card.index === 3 ? 'rgba(59, 130, 246, 0.1)' :
                            'rgba(16, 185, 129, 0.1)'
                          }`
                        }}
                      >
                        <ArrowRight className={`h-5 w-5 ${card.color} transition-all duration-300 group-hover:translate-x-0.5`} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="group relative rounded-3xl overflow-hidden border border-border/50 bg-card shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                style={{
                  background: `radial-gradient(circle at 60% 20%, rgba(245, 158, 11, 0.06), transparent 60%)`
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-0 right-0 h-24 w-24 opacity-20 rounded-bl-full bg-gradient-to-bl from-amber-500/40 to-transparent" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 opacity-10 rounded-full bg-amber-500/30 blur-xl animate-pulse" />
                
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 to-transparent p-0.5">
                      <div className="h-full w-full rounded-xl bg-card flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-amber-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Getting Started</h3>
                      <div className="h-0.5 w-12 mt-1 rounded-full bg-gradient-to-r from-amber-500/40 to-transparent" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Follow these steps to get started with your integration journey:
                    </p>
                    <div className="grid gap-3">
                      <div className="group/item flex items-center gap-3 rounded-xl p-3 hover:bg-amber-500/5 transition-colors duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/40 rounded-full group-hover/item:h-full h-0 transition-all duration-300" />
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover/item:scale-125 transition-transform" />
                        </div>
                        <span className="text-sm text-foreground group-hover/item:translate-x-0.5 transition-transform">Navigate to Connections and add your credentials</span>
                      </div>
                      
                      <div className="group/item flex items-center gap-3 rounded-xl p-3 hover:bg-amber-500/5 transition-colors duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/40 rounded-full group-hover/item:h-full h-0 transition-all duration-300" />
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover/item:scale-125 transition-transform" />
                        </div>
                        <span className="text-sm text-foreground group-hover/item:translate-x-0.5 transition-transform">Enable addons in Multiverse</span>
                      </div>
                      
                      <div className="group/item flex items-center gap-3 rounded-xl p-3 hover:bg-amber-500/5 transition-colors duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/40 rounded-full group-hover/item:h-full h-0 transition-all duration-300" />
                        <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 group-hover/item:scale-125 transition-transform" />
                        </div>
                        <span className="text-sm text-foreground group-hover/item:translate-x-0.5 transition-transform">Start building your integrations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="group relative rounded-3xl overflow-hidden border border-border/50 bg-card shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                style={{
                  background: `radial-gradient(circle at 70% 30%, rgba(79, 70, 229, 0.06), transparent 60%)`
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-0 right-0 h-24 w-24 opacity-20 rounded-bl-full bg-gradient-to-bl from-indigo-500/40 to-transparent" />
                <div className="absolute -bottom-4 -left-4 h-32 w-32 opacity-10 rounded-full bg-indigo-500/30 blur-xl" />
                
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-transparent p-0.5">
                        <div className="h-full w-full rounded-xl bg-card flex items-center justify-center">
                          <ListTodo className="h-6 w-6 text-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Feature Requests</h3>
                        <div className="h-0.5 w-12 mt-1 rounded-full bg-gradient-to-r from-indigo-500/40 to-transparent" />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowRequestForm(true)}
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 h-8 transition-all duration-300 border-indigo-500/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                      </span>
                      New Request
                    </Button>
                  </div>
                  
                  <div className="flex justify-around mb-6">
                    <div className="text-center px-3 relative">
                      <div className="text-2xl font-bold text-indigo-400">{featureRequests.pending}</div>
                      <div className="text-xs text-muted-foreground mt-1">Pending</div>
                      <div className="h-1 w-12 mx-auto mt-2 rounded-full bg-indigo-500/40"></div>
                    </div>
                    <div className="text-center px-3 relative">
                      <div className="text-2xl font-bold text-blue-400">{featureRequests.in_progress}</div>
                      <div className="text-xs text-muted-foreground mt-1">In Progress</div>
                      <div className="h-1 w-12 mx-auto mt-2 rounded-full bg-blue-500/40"></div>
                    </div>
                    <div className="text-center px-3 relative">
                      <div className="text-2xl font-bold text-green-400">{featureRequests.approved}</div>
                      <div className="text-xs text-muted-foreground mt-1">Approved</div>
                      <div className="h-1 w-12 mx-auto mt-2 rounded-full bg-green-500/40"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Requests</h4>
                    
                    {featureRequests.userFeatures.filter(feature => feature.status !== 'pending').length === 0 ? (
                      <div className="text-center p-4 rounded-xl bg-card/60 border border-border/50">
                        <p className="text-sm text-muted-foreground">You don&apos;t have any approved or in-progress feature requests yet.</p>
                      </div>
                    ) : (
                      featureRequests.userFeatures
                        .filter(feature => feature.status !== 'pending')
                        .slice(0, 2)
                        .map(feature => (
                        <div key={feature.id} className="group/item relative overflow-hidden rounded-xl p-3 hover:bg-indigo-500/5 transition-all duration-300 bg-gradient-to-r from-card to-card/60 border border-border/50">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          <div className="absolute top-0 left-0 h-0.5 w-0 bg-gradient-to-r from-indigo-500/60 to-indigo-500/0 group-hover/item:w-full transition-all duration-300 rounded-full" />
                          
                          <div className="flex gap-3 relative">
                            {feature.status === 'in_progress' && (
                              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                <PlayCircle className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            {feature.status === 'approved' && (
                              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                <Check className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-foreground">{feature.name}</p>
                                <div className="flex items-center gap-1 bg-card/60 px-2 py-0.5 rounded-full">
                                  <div className={`h-1.5 w-1.5 rounded-full ${
                                    feature.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                                  }`} />
                                  <p className="text-xs text-muted-foreground">{
                                    feature.status === 'in_progress' ? 'In Progress' : 'Approved'
                                  }</p>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {featureRequests.userFeatures.filter(feature => feature.status !== 'pending').length > 0 && (
                      <div className="flex justify-center mt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                          onClick={() => {
                            if (isAdmin) {
                              router.push('/admin?view=features')
                            }
                          }}
                        >
                          {featureRequests.userFeatures.length > 2 ? 'View All Requests' : 'View Requests'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
});

// Export the main Dashboard with Suspense boundary
function Dashboard() {
  // Reference to the DashboardContent component for directly calling its methods
  const dashboardRef = useRef<{
    setShowAddCredits: (value: boolean) => void;
  } | null>(null);


  
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <div className="absolute inset-0 h-8 w-8 animate-pulse bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 blur-xl" />
          </div>
          <div className="text-sm font-medium text-muted-foreground">Loading your workspace...</div>
        </div>
      </div>
    }>
      <DashboardContent
        ref={dashboardRef}
        onShowAddCredits={() => {}}
      />
    </Suspense>
  )
}

export default Dashboard;
