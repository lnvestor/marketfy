"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User } from "./supabase";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(data.session);
      setUser(data.session?.user as User || null);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user as User || null);
      setIsLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { data: data.session, error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    setIsLoading(false);
    return { data: data.session, error };
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const currentPath = window.location.pathname;
      
      // Generate a nonce for extra security
      const generateNonce = async () => {
        const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
        return nonce;
      };
      
      const nonce = await generateNonce();
      
      // Store nonce in sessionStorage to validate on return
      sessionStorage.setItem('auth_nonce', nonce);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(currentPath)}`,
          queryParams: {
            // Request a refresh token for offline access
            access_type: 'offline',
            // Force consent screen to ensure refresh token is returned
            prompt: 'consent',
            // Include email scope
            scope: 'email profile',
            // Use nonce for security
            nonce: nonce,
          },
        },
      });
      
      if (error) {
        console.error('Error initiating Google sign-in:', error);
        setIsLoading(false);
        throw error;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);
      throw error;
    }
    // Note: We don't set isLoading to false here because the page will redirect
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setIsLoading(false);
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
