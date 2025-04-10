"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Menu, Loader2 } from "lucide-react"
import Image from "next/image"
import { ChatSidebar } from "@/app/multiverse/components/layout/ChatSidebar"
import { loadChatSessions } from '@/lib/chat-sessions'

interface Profile {
  id: string
  username: string
  full_name: string
  company_name: string
  company_size: string
  phone: string
  linkedin: string
  company_logo: string
  role: string
}

interface SubmitStatus {
  type: 'success' | 'error'
  message: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Default to collapsed
  
  // Initialize sidebar state from localStorage on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true')
      }
      
      // Listen for sidebar state changes from other components
      const handleSidebarChange = (e: CustomEvent) => {
        setSidebarCollapsed(e.detail.collapsed)
      }
      
      window.addEventListener('sidebarStateChanged', handleSidebarChange as EventListener)
      
      return () => {
        window.removeEventListener('sidebarStateChanged', handleSidebarChange as EventListener)
      }
    }
  }, [])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<Array<{ id: string; name: string }>>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load chat sessions for sidebar
        const sessions = await loadChatSessions();
        if (sessions && sessions.length > 0) {
          setChatSessions(sessions);
        }
        
        // Get profile data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) {
          router.push("/")
          return
        }
        
        // Get user data to get the email
        const { data: userData } = await supabase.auth.getUser()
        const userEmail = userData?.user?.email

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        
        // Update profile with email from auth
        setProfile({
          ...data,
          username: userEmail || data.username // Use email from auth or fallback to profile username
        })
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          company_size: profile.company_size,
          phone: profile.phone,
          linkedin: profile.linkedin,
        })
        .eq('id', profile.id)

      if (error) throw error
      
      setSubmitStatus({
        type: 'success',
        message: 'Settings updated'
      })

      setTimeout(() => {
        setSubmitStatus(null)
      }, 2000)

    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Update failed'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadLogo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setSubmitStatus(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select an image to upload.')
      }

      const file = event.target.files[0]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file.')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
      
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        throw new Error('Please upload a JPG, PNG, or GIF file.')
      }

      // Create unique filename
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`

      // First, check if old logo exists and delete it
      if (profile?.company_logo) {
        const oldLogoPath = profile.company_logo.split('/').pop()
        if (oldLogoPath) {
          const { error: deleteError } = await supabase.storage
            .from('company-logos')
            .remove([oldLogoPath])
          
          if (deleteError) {
            console.error('Error deleting old logo:', deleteError)
          }
        }
      }

      // Upload new logo
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      if (!uploadData) {
        throw new Error('Failed to upload image.')
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName)

      // Update profile with new logo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ company_logo: publicUrl })
        .eq('id', profile?.id)

      if (updateError) {
        // If profile update fails, delete the uploaded image
        await supabase.storage
          .from('company-logos')
          .remove([fileName])
        throw new Error('Failed to update profile with new logo.')
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, company_logo: publicUrl } : null)
      
      setSubmitStatus({
        type: 'success',
        message: 'Company logo updated successfully!'
      })

      setTimeout(() => {
        setSubmitStatus(null)
      }, 2000)

    } catch (error) {
      console.error('Error uploading logo:', error)
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload logo. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex overflow-hidden bg-white dark:bg-neutral-900">
        {/* Sidebar with placeholder while loading */}
        <ChatSidebar
          sessions={[]}
          selectedSession={null}
          sidebarCollapsed={sidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          isLoading={false}
          aiLoading={false}
          searchQuery=""
          onNewChat={() => router.push('/multiverse')}
          onSelectChat={() => {}}
          onDeleteChat={() => {}}
          onUpdateChatName={() => {}}
          onSearchChange={() => {}}
          onMobileClose={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => {
            const newState = !sidebarCollapsed
            setSidebarCollapsed(newState)
            localStorage.setItem('sidebarCollapsed', String(newState))
            
            // Dispatch event for other components
            if (typeof window !== 'undefined') {
              const event = new CustomEvent('sidebarStateChanged', { 
                detail: { collapsed: newState } 
              })
              window.dispatchEvent(event)
            }
          }}
        />

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 dark:text-gray-600" />
              <div className="absolute inset-0 h-8 w-8 animate-pulse bg-gradient-to-r from-gray-500/20 via-gray-500/20 to-gray-500/20 blur-xl" />
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading settings...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-neutral-900">
      {/* Sidebar with loaded chat sessions */}
      <ChatSidebar
        sessions={chatSessions}
        selectedSession={selectedSession}
        sidebarCollapsed={sidebarCollapsed}
        mobileSidebarOpen={mobileSidebarOpen}
        isLoading={false}
        aiLoading={false}
        searchQuery=""
        onNewChat={() => window.location.href = '/multiverse'}
        onSelectChat={(sessionId) => window.location.href = `/multiverse?session=${sessionId}`}
        onDeleteChat={async (sessionId, e) => {
          if (e) e.stopPropagation();
          try {
            await supabase.from('chat_sessions').delete().eq('id', sessionId);
            setChatSessions(chatSessions.filter(s => s.id !== sessionId));
          } catch (error) {
            console.error('Error deleting chat:', error);
          }
        }}
        onUpdateChatName={async (sessionId, name) => {
          try {
            await supabase.from('chat_sessions').update({ name }).eq('id', sessionId);
            setChatSessions(chatSessions.map(s => s.id === sessionId ? { ...s, name } : s));
          } catch (error) {
            console.error('Error updating chat name:', error);
          }
        }}
        onSearchChange={(query) => {
          // Filter sessions based on query
          if (!query) {
            loadChatSessions().then(sessions => {
              if (sessions) setChatSessions(sessions);
            });
          } else {
            const filtered = chatSessions.filter(s => 
              s.name.toLowerCase().includes(query.toLowerCase())
            );
            setChatSessions(filtered);
          }
        }}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onToggleCollapse={() => {
          const newState = !sidebarCollapsed
          setSidebarCollapsed(newState)
          localStorage.setItem('sidebarCollapsed', String(newState))
          
          // Dispatch event for other components
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('sidebarStateChanged', { 
              detail: { collapsed: newState } 
            })
            window.dispatchEvent(event)
          }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 h-10 w-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center z-50"
        >
          <Menu className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
        </button>
        
        {/* Empty top right area */}
        <div className="absolute top-0 right-0 h-16 z-10 flex items-center justify-end px-4 gap-2">
        </div>
      
        {/* Main Content */}
        <div className="relative flex-1 overflow-y-auto p-8 pt-20">
          <div className="relative mx-auto max-w-2xl space-y-6">
            {/* Simple Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-lg font-normal text-black dark:text-white">Settings</h1>
            </div>

            {/* Status Message */}
            {submitStatus && (
              <div 
                className={`py-1 px-2 text-xs mb-4 inline-block ${
                  submitStatus.type === 'success' 
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Minimal Form */}
            <form onSubmit={updateProfile} className="space-y-5">
              <div className="flex items-center mb-8">
                {profile?.company_logo ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={profile.company_logo}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 dark:text-gray-600">
                      <path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14M14 8H14.01M6 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="ml-4 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Change photo'}
                </button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadLogo}
                  className="hidden"
                />
              </div>

              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      onChange={e => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 pl-6 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                    />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile?.username || ''}
                      disabled
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 pl-6 text-black/40 dark:text-white/40 focus:outline-none cursor-not-allowed"
                    />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Company</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile?.company_name || ''}
                      onChange={e => setProfile(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 pl-6 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                    />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Company Size</label>
                  <div className="relative">
                    <select
                      value={profile?.company_size || ''}
                      onChange={e => setProfile(prev => prev ? { ...prev, company_size: e.target.value } : null)}
                      className="w-full appearance-none bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="501+">501+</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={profile?.phone || ''}
                      onChange={e => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 pl-6 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">LinkedIn</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={profile?.linkedin || ''}
                      onChange={e => setProfile(prev => prev ? { ...prev, linkedin: e.target.value } : null)}
                      className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 px-0 py-1.5 pl-6 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                      placeholder="linkedin.com/in/username"
                    />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                      <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-black dark:bg-white px-5 py-1.5 text-white dark:text-black text-xs font-medium hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
