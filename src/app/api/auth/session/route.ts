import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Route handler for getting the user's session securely from the server
export async function GET() {
  try {
    // Get cookie store with await per Next.js 15 requirements
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      return NextResponse.json({ session: null })
    }
    
    // Get user information from Supabase using the stored token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Make a direct server-to-server call to get user data
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey!
      }
    })
    
    if (!userResponse.ok) {
      // Token might be expired, try to refresh
      const refreshToken = cookieStore.get('sb-refresh-token')?.value
      
      if (refreshToken) {
        // Try to refresh the token
        const refreshResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey!
          },
          body: JSON.stringify({ refresh_token: refreshToken })
        })
        
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          
          // Update tokens
          cookieStore.set('sb-access-token', refreshData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: refreshData.expires_in
          })
          
          // Try the user call again with new token
          const newUserResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${refreshData.access_token}`,
              'apikey': supabaseAnonKey!
            }
          })
          
          if (newUserResponse.ok) {
            const userData = await newUserResponse.json()
            return NextResponse.json({
              session: {
                user: {
                  id: userData.id,
                  email: userData.email,
                  user_metadata: userData.user_metadata
                },
                expires_at: Math.floor(Date.now() / 1000) + refreshData.expires_in
              }
            })
          }
        }
      }
      
      // If we get here, refresh failed too or there was no refresh token
      cookieStore.delete('sb-access-token')
      cookieStore.delete('sb-refresh-token')
      return NextResponse.json({ session: null })
    }
    
    // Token was valid, return user data
    const userData = await userResponse.json()
    
    return NextResponse.json({
      session: {
        user: {
          id: userData.id,
          email: userData.email,
          user_metadata: userData.user_metadata
        },
        // We don't know exact expiry, but this is a good estimate
        expires_at: Math.floor(Date.now() / 1000) + 3600
      }
    })
  } catch (error) {
    console.error('Error getting session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}