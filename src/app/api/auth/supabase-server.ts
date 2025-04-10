import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create a secure server-side Supabase client
// This is for server-side operations only and keeps the anon key secure
export async function createServerSupabaseClient() {
  // Important: Get cookies instance once and reuse it within the handler functions
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // We need to implement these as synchronous methods per Supabase requirements,
        // but we'll use the awaited cookieStore instance we captured above
        get(name: string) {
          /* @next-codemod-ignore */
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          /* @next-codemod-ignore */
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          /* @next-codemod-ignore */
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}