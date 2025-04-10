import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../supabase-server'

// Handle password-based sign-in
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Validate email domains (same logic as in client)
    const allowedDomains = ['lysi.co', 'webloo.com']
    const isValidDomain = allowedDomains.some(domain => 
      email.toLowerCase().endsWith(`@${domain}`)
    )
    
    if (!isValidDomain) {
      return NextResponse.json(
        { error: 'Only @lysi.co and @webloo.com email addresses are allowed' },
        { status: 400 }
      )
    }
    
    // Use server-side Supabase client to sign in
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    // Return success with minimal user info (no tokens)
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    })
  } catch (error) {
    console.error('Sign-in error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Handle Google OAuth sign-in
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Create OAuth URL for Google provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/callback`,
      }
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    // Redirect to the OAuth provider URL
    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error('OAuth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}