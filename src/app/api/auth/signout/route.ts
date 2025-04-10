import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Route handler for secure sign-out process
export async function POST() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    
    if (accessToken) {
      // Actually revoke the token with Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // Make a server-side request to revoke token
      await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey!,
          'Authorization': `Bearer ${accessToken}`
        }
      })
    }
    
    // Delete auth cookies
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error signing out:', error)
    
    // Still delete cookies even if the API call fails
    const cookieStore = await cookies()
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    
    return NextResponse.json({ success: true })
  }
}