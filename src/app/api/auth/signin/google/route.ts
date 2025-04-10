import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../../supabase-server'

// Handle Google OAuth sign-in redirect
export async function GET(request: NextRequest) {
  try {
    console.log('Google OAuth sign-in initiated')
    const supabase = await createServerSupabaseClient()
    
    // Create OAuth URL for Google provider
    const redirectUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/callback`
    console.log('Using redirect URL:', redirectUrl)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    
    if (error) {
      console.error('Error generating OAuth URL:', error)
      return NextResponse.redirect(new URL('/?auth_error=true', request.url))
    }
    
    if (!data?.url) {
      console.error('No OAuth URL was generated')
      return NextResponse.redirect(new URL('/?auth_error=no_oauth_url', request.url))
    }
    
    console.log('Redirecting to OAuth URL:', data.url)
    
    // Redirect to the OAuth provider URL
    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(new URL('/?auth_error=true', request.url))
  }
}