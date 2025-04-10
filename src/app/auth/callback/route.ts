import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// This is a special route that handles OAuth redirects
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  console.log('OAuth callback URL:', requestUrl.toString())
  console.log('Search params:', requestUrl.search)
  
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (error) {
    console.error('OAuth provider returned error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }
  
  if (!code) {
    console.error('No code parameter found in callback')
    return NextResponse.redirect(new URL('/?auth_error=missing_code', requestUrl.origin))
  }
  
  console.log('Code parameter present, proceeding with exchange')
  
  // Create a redirect response to the multiverse page on success
  const response = NextResponse.redirect(new URL('/multiverse', requestUrl.origin))
  
  try {
    // For the auth callback route, the cookie handling is essential
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            /* @next-codemod-ignore */
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set cookies on the response object
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    // Exchange the code for a session - this is what makes OAuth work
    console.log('Exchanging code for session...')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, requestUrl.origin))
    }
    
    console.log('Session exchange successful')

    // Success - redirect to the app
    console.log('Redirecting to multiverse page...')
    return response
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/?auth_error=server_error', requestUrl.origin))
  }
}
