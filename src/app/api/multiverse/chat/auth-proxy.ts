import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Utility function to validate an authentication token from an API request
 * This ensures the auth token is valid and returns the associated user
 */
export async function validateAuthToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authentication token')
  }
  
  // Extract token from auth header
  const token = authHeader.split(' ')[1]
  
  // Using cookie-based approach for server components
  const cookieStore = await cookies()
  
  // Create a server-side Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          /* @next-codemod-ignore */
          return cookieStore.get(name)?.value
        },
        set() {}, // No-op for this context
        remove() {}, // No-op for this context
      },
    }
  )
  
  // First try to validate with our server cookie
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!error && user) {
      return user
    }
  } catch (err) {
    console.error('Error validating token from cookie:', err)
  }
  
  // If cookie validation fails, try using the provided token
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      throw new Error('Invalid authentication token')
    }
    
    return user
  } catch (err) {
    console.error('Error validating provided token:', err)
    throw new Error('Authentication failed')
  }
}