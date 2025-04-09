import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AuthDialog } from "@/components/auth-dialog";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--tw-gradient-from)_0%,var(--tw-gradient-to)_100%)] from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800"></div>
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
      </div>
      
      {/* Logo and Auth Button */}
      <div className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 w-full">
        <div className="flex justify-between items-center mx-auto max-w-[1400px]">
          <Link href="/">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Marketfy Logo" 
                className="w-full h-full object-contain scale-125"
                style={{ filter: 'drop-shadow(0 0 8px rgba(var(--primary), 0.4))' }}
              />
            </div>
          </Link>
          <AuthDialog
            trigger={
              <Button className="rounded-full px-4 sm:px-5 py-2 h-auto text-sm font-medium bg-white/30 hover:bg-white/40 dark:bg-black/20 dark:hover:bg-black/30 text-black dark:text-white backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm flex items-center gap-2 transition-all">
                Get Started
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            }
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="container max-w-[1400px] mx-auto relative z-10">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-28 pb-16 md:pt-36 md:pb-24 min-h-[80vh]">
          <div className="flex flex-col space-y-6 px-4 md:px-8">
            <div className="inline-flex mb-2">
              <div className="px-4 py-1.5 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md border border-primary/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <p className="text-primary text-sm font-medium">AI-Powered Product Research</p>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
              Discover <span className="text-primary">Winning Products</span> for Your Business
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Marketfy helps dropshippers and Amazon FBA sellers find high-margin products with validated market demand and growth potential.
            </p>
            
            {/* Stats bar */}
            <div className="flex flex-wrap gap-8 pt-10">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-muted-foreground">Products Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">15K+</div>
                <div className="text-muted-foreground">Active Sellers</div>
              </div>
              <div>
                <div className="text-3xl font-bold">93%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Hero image and grid */}
          <div className="flex flex-col justify-center items-center relative h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-10 blur-3xl rounded-full"></div>
            <div className="relative z-10 mb-8">
              <Image 
                src="/logo.png" 
                alt="Marketfy Platform" 
                width={300} 
                height={300}
                className="object-contain"
              />
            </div>
            
            {/* Icon grid */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[400px] relative z-10">
              {/* Analytics */}
              <div className="aspect-square rounded-md bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              
              {/* AI */}
              <div className="aspect-square rounded-md bg-secondary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              {/* Marketing */}
              <div className="aspect-square rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              
              {/* Automation */}
              <div className="aspect-square rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              {/* Social Media */}
              <div className="aspect-square rounded-md bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              
              {/* Chat */}
              <div className="aspect-square rounded-md bg-secondary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              
              {/* Robot/AI */}
              <div className="aspect-square rounded-md border border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0
                  01 12 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              
              {/* Data */}
              <div className="aspect-square rounded-md bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              {/* Growth */}
              <div className="aspect-square rounded-md bg-secondary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-secondary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
      </div>
    </div>
  );
}
