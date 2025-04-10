"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getUserProfile, updateUserProfile } from "@/lib/client/profile-api"
import { supabase } from "@/lib/supabase" // Still needed for file uploads
import Image from "next/image"
import { 
  ArrowRight, 
  Check, 
  Loader2, 
  UserCircle, 
  Building2, 
  Phone, 
  Linkedin, 
  Globe,
  UploadCloud,
  X
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface ProfileSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

// Define the steps for the profile setup process
const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: UserCircle },
  { id: 'company', title: 'Company Info', icon: Building2 },
  { id: 'contact', title: 'Contact Info', icon: Phone },
]

export function ProfileSetupDialog({ open, onOpenChange, userId }: ProfileSetupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Profile state matching Supabase schema
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
    website: "",
    role: "user",
    company_name: "",
    company_size: "",
    phone: "",
    linkedin: "",
    company_logo: "",
    is_profile_completed: false
  })

  // Load existing profile data if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return

      // First check localStorage for cached profile data
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          setProfile({
            username: parsedProfile.username || "",
            full_name: parsedProfile.full_name || "",
            avatar_url: parsedProfile.avatar_url || "",
            website: parsedProfile.website || "",
            role: parsedProfile.role || "user",
            company_name: parsedProfile.company_name || "",
            company_size: parsedProfile.company_size || "",
            phone: parsedProfile.phone || "",
            linkedin: parsedProfile.linkedin || "",
            company_logo: parsedProfile.company_logo || "",
            is_profile_completed: !!parsedProfile.is_profile_completed
          });
        } catch (e) {
          console.error('Error parsing cached profile data', e);
        }
      }

      // Then try to get from database using our API
      try {
        const data = await getUserProfile('*');

        if (data) {
          const updatedProfile = {
            username: data.username || "",
            full_name: data.full_name || "",
            avatar_url: data.avatar_url || "",
            website: data.website || "",
            role: data.role || "user",
            company_name: data.company_name || "",
            company_size: data.company_size || "",
            phone: data.phone || "",
            linkedin: data.linkedin || "",
            company_logo: data.company_logo || "",
            is_profile_completed: !!data.is_profile_completed
          };
          
          setProfile(updatedProfile);
          
          // Update localStorage with fresh data
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setHasLoaded(true)
      }
    }

    if (open) {
      loadProfile()
    }
  }, [userId, open])

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Get current profile data from API
      let currentProfile = null;
      try {
        currentProfile = await getUserProfile('*');
      } catch (_error) {
        console.log('No existing profile found or error fetching');
      }
      
      // Get cached data as well
      let cachedProfile = null;
      try {
        const cachedData = localStorage.getItem('userProfile');
        if (cachedData) {
          cachedProfile = JSON.parse(cachedData);
        }
      } catch (_error) {
        console.error('Error parsing cached profile');
      }
      
      // Make sure we preserve values across all sources, prioritizing current form values
      const updatedProfile = {
        username: profile.username || currentProfile?.username || cachedProfile?.username || null,
        full_name: profile.full_name || currentProfile?.full_name || cachedProfile?.full_name || null,
        avatar_url: profile.avatar_url || currentProfile?.avatar_url || cachedProfile?.avatar_url || null,
        website: profile.website || currentProfile?.website || cachedProfile?.website || null,
        company_name: profile.company_name || currentProfile?.company_name || cachedProfile?.company_name || null,
        company_size: profile.company_size || currentProfile?.company_size || cachedProfile?.company_size || null,
        phone: profile.phone || currentProfile?.phone || cachedProfile?.phone || null,
        linkedin: profile.linkedin || currentProfile?.linkedin || cachedProfile?.linkedin || null,
        company_logo: profile.company_logo || currentProfile?.company_logo || cachedProfile?.company_logo || null,
        is_profile_completed: profile.full_name && profile.company_name ? true : false,
        updated_at: new Date().toISOString()
      };

      // Use our API client function to update the profile
      await updateUserProfile(updatedProfile);
      
      // Store profile info in local storage as backup
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file upload for company logo or avatar
  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'avatar' | 'company-logo') => {
    try {
      setUploading(true)
      setUploadError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Please select an image to upload.')
      }

      const file = event.target.files[0]
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file.')
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB.')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
      
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        throw new Error('Please upload a JPG, PNG, or GIF file.')
      }

      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const bucket = fileType === 'avatar' ? 'avatars' : 'company-logos'

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      // Update profile state
      let updatedProfile;
      if (fileType === 'avatar') {
        updatedProfile = { ...profile, avatar_url: publicUrl };
        setProfile(updatedProfile);
      } else {
        updatedProfile = { ...profile, company_logo: publicUrl };
        setProfile(updatedProfile);
      }
      
      // Immediately update localStorage to persist the logo
      try {
        const cachedData = localStorage.getItem('userProfile');
        const cachedProfile = cachedData ? JSON.parse(cachedData) : {};
        
        if (fileType === 'avatar') {
          cachedProfile.avatar_url = publicUrl;
        } else {
          cachedProfile.company_logo = publicUrl;
        }
        
        localStorage.setItem('userProfile', JSON.stringify(cachedProfile));
        
        // Also update Supabase immediately to persist the logo
        await supabase
          .from('profiles')
          .update(fileType === 'avatar' 
            ? { avatar_url: publicUrl }
            : { company_logo: publicUrl })
          .eq('id', userId);
      } catch (e) {
        console.error('Error updating cached profile with new image:', e);
      }

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading file';
      setUploadError(errorMessage)
      setTimeout(() => setUploadError(null), 5000)
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  // Handle next step navigation
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  // Handle previous step navigation
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0: // Personal Information
        return !!profile.full_name
      case 1: // Company Information
        return !!profile.company_name
      case 2: // Additional Information
        return true // Optional fields
      default:
        return false
    }
  }

  // If profile data hasn't loaded yet, don't render content
  if (!hasLoaded && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      // Allow immediate closing without confirmation
      onOpenChange(value);
    }}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Help us personalize your experience by providing some information about you and your company.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicators */}
        <div className="my-2">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index < currentStep 
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                      ? 'border-primary text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground/50'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-xs mt-1 text-center ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-muted-foreground/20 h-1 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Upload Status Messages */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 text-green-500 p-3 rounded-lg border border-green-500/20 mb-4 flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> File uploaded successfully
            </motion.div>
          )}
          
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 text-red-500 p-3 rounded-lg border border-red-500/20 mb-4 flex items-center gap-2"
            >
              <X className="h-4 w-4" /> {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <div className="py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px]"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <div className="relative">
                      <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={e => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <input
                        type="text"
                        value={profile.username}
                        onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-9 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                        placeholder="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={profile.website}
                        onChange={e => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-500">
                    <p>This information helps us personalize your dashboard experience.</p>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border">
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted border-2 border-primary/20">
                      {profile.company_logo ? (
                        <Image
                          src={profile.company_logo}
                          alt="Company Logo"
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-2 p-4">
                          <Building2 className="h-12 w-12 text-primary/40" />
                          <p className="text-xs text-center text-muted-foreground">Upload your company logo</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                      {uploading ? 'Uploading...' : 'Upload Company Logo'}
                    </button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadFile(e, 'company-logo')}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={profile.company_name}
                      onChange={e => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                      placeholder="Acme Inc."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Company Size</label>
                    <select
                      value={profile.company_size}
                      onChange={e => setProfile(prev => ({ ...prev, company_size: e.target.value }))}
                      className="w-full rounded-xl bg-muted/50 border border-border px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">LinkedIn Profile</label>
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="url"
                        value={profile.linkedin}
                        onChange={e => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="w-full rounded-xl bg-muted/50 border border-border pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none transition-all"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-500">
                    <p>Almost there! Contact information helps us connect you with relevant resources and support.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              className="gap-2"
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="gap-2"
            >
              Skip for now
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || !isCurrentStepValid()}
            className="relative group"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
              {!isSubmitting && currentStep < STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}