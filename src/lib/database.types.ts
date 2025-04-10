export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          company_name: string | null
          company_size: string | null
          phone: string | null
          linkedin: string | null
          company_logo: string | null
          role: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          company_name?: string | null
          company_size?: string | null
          phone?: string | null
          linkedin?: string | null
          company_logo?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          company_name?: string | null
          company_size?: string | null
          phone?: string | null
          linkedin?: string | null
          company_logo?: string | null
          role?: string | null
        }
      }
      AdminAddons: {
        Row: {
          id: string
          name: string
          description: string | null
          logo: string
          has_connection: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo: string
          has_connection?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo?: string
          has_connection?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      adminaddonsfeatures: {
        Row: {
          id: string
          addon_id: string
          feature: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          addon_id: string
          feature: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          addon_id?: string
          feature?: string
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_id: string
          addon_id: string
          token: string
          refresh_token: string | null
          account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          addon_id: string
          token: string
          refresh_token?: string | null
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          addon_id?: string
          token?: string
          refresh_token?: string | null
          account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: string
          content?: string
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
          last_message: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
          last_message?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
          last_message?: string | null
          is_active?: boolean
        }
      }
      features: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addons: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
