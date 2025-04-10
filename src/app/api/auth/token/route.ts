import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../supabase-server'
import { cookies } from 'next/headers'

// Route handler for securely providing auth token to clients
export async function GET() {
  try {
    // Get the session directly from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (!accessToken) {
      // If no cookie exists, try to get the session from Supabase
      const supabase = await createServerSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        return NextResponse.json({ 
          success: false, 
          error: error?.message || 'No active session' 
        }, { status: 401 })
      }
      
      // Use the access token from the session
      // This is still secure since the Supabase client is server-side only
      return NextResponse.json({
        success: true,
        token: data.session.access_token,
        user: {
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name,
        }
      })
    }
    
    // If we have a token from cookie, we should verify it's valid
    const supabase = await createServerSupabaseClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError || !userData.user) {
      return NextResponse.json({ 
        success: false, 
        error: userError?.message || 'Invalid session' 
      }, { status: 401 })
    }
    
    // Return the access token with user info
    return NextResponse.json({
      success: true,
      token: accessToken,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name,
      }
    })
  } catch (error) {
    console.error('Error getting token:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}