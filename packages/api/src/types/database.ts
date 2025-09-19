export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'patient' | 'clinician' | 'admin' | 'super_admin';
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'clinic' | 'hospital' | 'research';
          subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise';
          credits_remaining: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      org_memberships: {
        Row: {
          org_id: string;
          user_id: string;
          role: 'owner' | 'clinician' | 'staff';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['org_memberships']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['org_memberships']['Insert']>;
      };
      patients: {
        Row: {
          id: string;
          org_id: string;
          owner_user: string;
          external_id: string | null;
          full_name: string;
          date_of_birth: string;
          gender: 'male' | 'female' | 'other';
          phone: string | null;
          email: string | null;
          address: string | null;
          medical_history: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['patients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['patients']['Insert']>;
      };
      sessions: {
        Row: {
          id: string;
          patient_id: string;
          clinician_id: string;
          session_type: 'initial' | 'followup' | 'assessment';
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sessions']['Insert']>;
      };
      eeg_reports: {
        Row: {
          id: string;
          session_id: string;
          patient_id: string;
          metrics: {
            delta: number;
            theta: number;
            alpha: number;
            beta: number;
            gamma: number;
            [key: string]: any;
          };
          summary: string;
          recommendations: string[];
          file_path: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['eeg_reports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['eeg_reports']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          patient_id: string;
          kind: 'report' | 'scan' | 'prescription' | 'other';
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      assessments: {
        Row: {
          id: string;
          patient_id: string;
          assessment_type: 'adhd' | 'gad7' | 'pss' | 'memory' | 'mood';
          responses: any;
          score: number;
          insights: string[];
          recommendations: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
      daily_progress: {
        Row: {
          id: string;
          patient_id: string;
          date: string;
          mood_rating: number;
          stress_level: number;
          focus_level: number;
          energy_level: number;
          completed_activities: string[];
          notes: string | null;
          sleep_hours: number | null;
          symptoms: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_progress']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['daily_progress']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          plan: 'free' | 'basic' | 'pro' | 'enterprise';
          status: 'active' | 'cancelled' | 'expired';
          credits: number;
          valid_until: string;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_brain_fitness_score: {
        Args: { patient_id: string };
        Returns: {
          overall: number;
          focus: number;
          memory: number;
          mood: number;
          stress: number;
        };
      };
      get_patient_summary: {
        Args: { patient_id: string };
        Returns: any;
      };
    };
    Enums: {
      user_role: 'patient' | 'clinician' | 'admin' | 'super_admin';
      org_role: 'owner' | 'clinician' | 'staff';
      gender: 'male' | 'female' | 'other';
    };
  };
}