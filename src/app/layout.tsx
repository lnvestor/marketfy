import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import WarningSupressor from "@/components/warning-suppressor"
import Script from 'next/script'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Integriverse | Connect Beyond Boundaries",
  description: "Intelligent integration assistant for NetSuite and Celigo",
  metadataBase: new URL("https://integriverse.io"),
  icons: {
    icon: { url: "/favicon.ico", type: "image/x-icon" }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Security script to block Supabase direct API calls */}
        <Script id="supabase-security" strategy="beforeInteractive">
          {`
            (function() {
              // Block direct API calls to Supabase from the client
              const originalFetch = window.fetch;
              window.fetch = function(url, options) {
                // Convert URL object to string if needed
                const urlString = url.toString ? url.toString() : url;
                
                // Block any direct calls to Supabase auth API
                if (urlString.includes('supabase.co/auth')) {
                  console.warn('Direct Supabase authentication API calls are blocked for security');
                  return Promise.resolve(new Response(JSON.stringify({
                    error: 'Direct Supabase API calls are disabled'
                  }), { status: 403 }));
                }
                
                // Allow the request to proceed
                return originalFetch.apply(this, arguments);
              };
            })();
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {/* Component to suppress hydration warnings */}
        <WarningSupressor />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}