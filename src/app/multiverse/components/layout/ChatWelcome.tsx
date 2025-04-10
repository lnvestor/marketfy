import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getUserProfile } from '@/lib/client/profile-api';

interface ChatWelcomeProps {
  onExampleSelect: (prompt: string) => void;
}

export function ChatWelcome({ onExampleSelect }: ChatWelcomeProps) {
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    // Try to get user profile
    const fetchUserProfile = async () => {
      try {
        // Use our API function
        const profile = await getUserProfile('full_name');
        
        if (profile?.full_name) {
          // Get first name only
          const firstName = profile.full_name.split(' ')[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pt-16">
      {/* Subtle ambient background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:16px_16px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:80px_80px]"></div>
        {/* Subtle glow effects */}
        <div className="absolute right-1/4 top-20 w-96 h-96 bg-black/[0.01] rounded-full blur-3xl"></div>
        <div className="absolute left-1/4 bottom-20 w-64 h-64 bg-black/[0.01] rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col items-center max-w-3xl w-full mx-auto relative z-10">
        {/* Logo with grid background and welcome text */}
        <div className="text-center mb-20 relative">
          {/* Grid background for logo */}
          <div className="flex justify-center mb-8">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Smaller grid with lighter color under the logo */}
              <div className="absolute w-20 h-20 bg-[linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_1px)] bg-[size:4px_4px] rounded-lg"></div>
              
              {/* Centered logo above the grid */}
              <Image
                src="/integriverse/logo.png"
                alt="Integriverse"
                width={96}
                height={96}
                className="object-contain relative z-10"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-medium text-gray-800 dark:text-white mb-2">
            {userName ? `Welcome, ${userName}` : 'Welcome'}
          </h1>
          <div className="h-px w-20 bg-gray-200 dark:bg-neutral-700 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Select a topic to get started or type a message below
          </p>
        </div>

        {/* Ultra-minimalist Cards */}
        <div className="w-full mb-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Transaction Search",
                icon: "search",
                prompt: "Create a saved search for recent sales orders with subtotals by customer"
              },
              {
                title: "Celigo Sales Integration",
                icon: "salesforce",
                prompt: "Set up a Celigo integration to sync NetSuite sales orders to Salesforce opportunities"
              },
              {
                title: "Customer Dashboard",
                icon: "dashboard",
                prompt: "Create a saved search for top customers with YOY revenue comparison"
              },
              {
                title: "Celigo Inventory Flow",
                icon: "inventory",
                prompt: "Configure a Celigo integration flow for real-time inventory synchronization"
              }
            ].map((card, index) => (
              <div 
                key={index}
                onClick={() => onExampleSelect(card.prompt)}
                className="flex items-center gap-3 rounded-md border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 cursor-pointer hover:border-gray-200 dark:hover:border-neutral-700 transition-colors"
              >
                {/* Minimalist Icon */}
                <div className="text-gray-800 dark:text-gray-200">
                  {card.icon === "search" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  )}
                  
                  {card.icon === "salesforce" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
                    </svg>
                  )}
                  
                  {card.icon === "dashboard" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9"></rect>
                      <rect x="14" y="3" width="7" height="5"></rect>
                      <rect x="14" y="12" width="7" height="9"></rect>
                      <rect x="3" y="16" width="7" height="5"></rect>
                    </svg>
                  )}
                  
                  {card.icon === "inventory" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"></path>
                      <path d="M18.5 3a2.5 2.5 0 1 1 0 5H12V3Z"></path>
                      <path d="M15 11a2.5 2.5 0 1 0 5 0V8h-5Z"></path>
                      <path d="M7 12a2.5 2.5 0 1 1 5 0v5H7Z"></path>
                    </svg>
                  )}
                </div>
                
                {/* Card Title */}
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
          
          {/* What's New Card - v1.0.10 */}
          <div className="mt-6 rounded-md border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.9 13.5a9 9 0 1 1-13-12.5"></path>
                  <path d="M15 6h6v6"></path>
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">What&apos;s new</h3>
              </div>
              
              {/* Version Pill with New Tag */}
              <div className="flex items-center">
                <div className="inline-flex items-center gap-1">
                  <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                    <span className="text-rose-700 dark:text-rose-400">New</span>
                  </div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800">
                    <span className="flex h-1.5 w-1.5 mr-1">
                      <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-teal-400 opacity-75 animate-ping"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-500"></span>
                    </span>
                    <span className="text-teal-700 dark:text-teal-400">Beta v1.1.0</span>
                  </div>
                </div>
              </div>
            </div>
            
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-xs text-gray-500 mt-0.5">•</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Added Perplexity reasoning model integration</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-gray-500 mt-0.5">•</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Enhanced security with critical patches</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-gray-500 mt-0.5">•</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Improved feedback system with username display</p>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-gray-500 mt-0.5">•</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Optimized profile data handling</p>
              </li>
            </ul>
          </div>
          
          {/* Previous Version Card - v1.0.8 (Vanishing Effect) */}
          <div className="mt-3 relative rounded-md overflow-hidden p-4 opacity-60 dark:opacity-50 backdrop-blur-sm">
            {/* Gradient border that's stronger on top */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-200 via-gray-100/50 to-transparent dark:from-neutral-700 dark:via-neutral-800/30 dark:to-transparent pointer-events-none"></div>
            
            {/* Content with fading background */}
            <div className="relative bg-white/80 dark:bg-neutral-900/60 rounded-t-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Previous version</h3>
                </div>
                
                {/* Version Pill - Faded */}
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-amber-50/80 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-800/30">
                  <span className="text-amber-600/70 dark:text-amber-400/60">v1.0.8</span>
                </div>
              </div>
              
              <ul className="space-y-1.5 pb-4 opacity-80">
                <li className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500">Added message feedback with accuracy slider</p>
                </li>
                <li className="flex items-start gap-2 opacity-70">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500">Added filter script tool for Celigo</p>
                </li>
                <li className="flex items-start gap-2 opacity-70">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500">Fixed addon connectivity in new chats</p>
                </li>
              </ul>
              
              {/* Bottom fade effect */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-900/80 dark:to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}