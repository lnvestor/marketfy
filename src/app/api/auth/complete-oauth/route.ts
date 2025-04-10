import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../supabase-server'
import { cookies } from 'next/headers'

// An intermediate endpoint that completes the OAuth flow server-side
// This prevents the client from ever making direct API calls to Supabase
export async function GET(request: NextRequest) {
  try {
    // Get OAuth code from cookie (set by callback route)
    const cookieStore = await cookies()
    const code = cookieStore.get('supabase_oauth_code')?.value
    
    if (!code) {
      return NextResponse.redirect(new URL('/?auth_error=missing_code', request.url))
    }
    
    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient()
    
    // Exchange code for session entirely server-side
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, request.url))
    }
    
    // Clear the intermediate code cookie
    cookieStore.delete('supabase_oauth_code')
    
    // Success - redirect to the app
    return NextResponse.redirect(new URL('/multiverse', request.url))
  } catch (error) {
    console.error('Error completing OAuth flow:', error)
    return NextResponse.redirect(new URL('/?auth_error=server_error', request.url))
  }
}