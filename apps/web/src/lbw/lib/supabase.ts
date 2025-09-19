import { createClient } from '@supabase/supabase-js'

// LBW Supabase Configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-lbw-supabase-url.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-lbw-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// LBW Database Types for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          age: number
          gender: 'male' | 'female' | 'other'
          email: string
          improvement_focus: string[]
          onboarding_completed: boolean
          brain_fitness_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          assessment_type: 'adhd' | 'stress' | 'memory' | 'mood' | 'gad7' | 'pss'
          responses: Record<string, any>
          score: number
          insights: string[]
          recommendations: string[]
          completed_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>
      }
      daily_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          mood_rating: number
          stress_level: number
          focus_level: number
          energy_level: number
          completed_activities: string[]
          notes: string | null
          sleep_hours: number | null
          symptoms: string[]
        }
        Insert: Omit<Database['public']['Tables']['daily_progress']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['daily_progress']['Insert']>
      }
      daily_content: {
        Row: {
          id: string
          user_id: string
          date: string
          content_data: Record<string, any>
          viewed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_content']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_content']['Insert']>
      }
      coaching_sessions: {
        Row: {
          id: string
          coach_id: string
          user_id: string
          datetime: string
          duration: number
          session_type: 'brain_coaching' | 'nervous_system' | 'qeeg_consultation'
          status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          session_notes: string | null
          next_steps: string[]
          rating: number | null
          feedback: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coaching_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['coaching_sessions']['Insert']>
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: 'streak' | 'assessment' | 'improvement' | 'milestone'
          title: string
          description: string
          icon: string
          unlocked_at: string
          category: string
          points: number
        }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_brain_fitness_score: {
        Args: {
          user_id: string
        }
        Returns: {
          overall: number
          focus: number
          memory: number
          mood: number
          stress: number
        }
      }
      get_personalized_content: {
        Args: {
          user_id: string
          content_date: string
        }
        Returns: Record<string, any>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Database helpers
export const insertUserProfile = async (userData: Database['public']['Tables']['users']['Insert']) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['users']['Update']) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}