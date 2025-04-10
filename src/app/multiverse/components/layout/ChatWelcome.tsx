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
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pt-8">
      {/* Subtle ambient background grid pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:160px_160px]"></div>
        {/* Subtle glow effects with black/white tint */}
        <div className="absolute right-1/4 top-20 w-96 h-96 bg-black/[0.03] dark:bg-white/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute left-1/4 bottom-20 w-64 h-64 bg-black/[0.02] dark:bg-white/[0.02] rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col items-center max-w-3xl w-full mx-auto relative z-10">
        {/* Logo with star icon and welcome text */}
        <div className="text-center mb-16 -mt-12 relative">
          {/* Centered logo with star */}
          <div className="flex justify-center mb-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Centered star image (enlarged) */}
              <Image
                src="/integriverse/star.png"
                alt="Marketfy"
                width={200}
                height={200}
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-medium text-gray-800 dark:text-white mb-2 flex items-center justify-center gap-2">
            Welcome
            {userName && (
              <>
                , <span className="text-black dark:text-white font-semibold relative">{userName}
                  <svg className="h-5 w-5 text-black dark:text-white absolute -top-4 -right-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                  </svg>
                </span>
              </>
            )}
          </h1>
          <div className="h-px w-20 bg-black/20 dark:bg-white/20 mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Discover <span className="text-black dark:text-white font-medium">winning products</span> for your e-commerce business
          </p>
        </div>

        {/* Updated Cards with Emerald Styling */}
        <div className="w-full mb-16 max-w-3xl mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Trend Analysis",
                icon: "trend",
                prompt: "Find trending products in the home decor niche with high profit margins"
              },
              {
                title: "Market Research",
                icon: "research",
                prompt: "Analyze market competition for eco-friendly water bottles and identify gaps"
              },
              {
                title: "Dropshipping Finder",
                icon: "dropship",
                prompt: "Find the best dropshipping products for summer 2025 with high demand and low competition"
              },
              {
                title: "Amazon FBA Analysis",
                icon: "amazon",
                prompt: "Recommend profitable Amazon FBA products in the pet accessories category"
              }
            ].map((card, index) => (
              <div 
                key={index}
                onClick={() => onExampleSelect(card.prompt)}
                className="flex items-center gap-3 rounded-md border border-black/10 bg-white/80 p-4 cursor-pointer hover:border-black/20 hover:bg-black/5 transition-all platform-icon"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Icon with black color */}
                <div className="text-black dark:text-white">
                  {card.icon === "trend" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                  )}
                  
                  {card.icon === "research" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  )}
                  
                  {card.icon === "dropship" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  )}
                  
                  {card.icon === "amazon" && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"></path>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  )}
                </div>
                
                {/* Card Title with emerald accent */}
                <h3 className="text-sm font-medium text-gray-800">
                  {card.title}
                </h3>
              </div>
            ))}
          </div>
          
          {/* What's New Card - Updated Styling */}
          <div className="mt-6 rounded-md border border-black/10 bg-white/80 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
                    <path d="M19.9 13.5a9 9 0 1 1-13-12.5"></path>
                    <path d="M15 6h6v6"></path>
                  </svg>
                  <h3 className="text-sm font-medium text-gray-800">What&apos;s new</h3>
                </div>
                
                {/* Version Pill with New Tag - Updated */}
                <div className="flex items-center">
                  <div className="inline-flex items-center gap-1">
                    <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-black/5 border border-black/10">
                      <span className="text-black dark:text-white">New</span>
                    </div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-black/5 border border-black/10">
                      <span className="flex h-1.5 w-1.5 mr-1">
                        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-black/40 dark:bg-white/40 opacity-75 animate-ping"></span>
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-black dark:bg-white"></span>
                      </span>
                      <span className="text-black dark:text-white">v1.0.6</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-xs text-black dark:text-white mt-0.5">•</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Added token usage tracking with detailed breakdown</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xs text-black dark:text-white mt-0.5">•</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">New UI component showing token counts and costs</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xs text-black dark:text-white mt-0.5">•</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Refreshed addon pill with black and white design</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xs text-black dark:text-white mt-0.5">•</span>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Fixed duplicate message saving in chat history</p>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Previous Version Card - Updated Styling */}
          <div className="mt-3 relative rounded-md overflow-hidden p-4 opacity-60 backdrop-blur-sm">
            {/* Gradient border with black/white */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-transparent dark:from-white/10 dark:via-white/5 pointer-events-none"></div>
            
            {/* Content with fading background */}
            <div className="relative bg-white/80 rounded-t-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 text-black dark:text-white">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <h3 className="text-xs font-medium text-gray-500">Previous version</h3>
                </div>
                
                {/* Version Pill - Faded */}
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                  <span className="text-black/70 dark:text-white/70">v1.0.5</span>
                </div>
              </div>
              
              <ul className="space-y-1.5 pb-4 opacity-80">
                <li className="flex items-start gap-2">
                  <span className="text-[10px] text-black dark:text-white mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Modern UI themes with clean design</p>
                </li>
                <li className="flex items-start gap-2 opacity-70">
                  <span className="text-[10px] text-black dark:text-white mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Added product image analysis capability</p>
                </li>
                <li className="flex items-start gap-2 opacity-70">
                  <span className="text-[10px] text-black dark:text-white mt-0.5 opacity-60">•</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Fixed issues with network connectivity</p>
                </li>
              </ul>
              
              {/* Bottom fade effect */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}