import { supabase, getClient } from './supabase';
import { z } from 'zod';
import type { Database } from './types/database';

// Zod schemas for validation
export const PatientSchema = z.object({
  full_name: z.string().min(1).max(255),
  date_of_birth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  medical_history: z.any().optional(),
  improvement_focus: z.array(z.string()).optional(),
});

export const AssessmentSchema = z.object({
  assessment_type: z.enum(['adhd', 'gad7', 'pss', 'memory', 'mood']),
  responses: z.any(),
  score: z.number(),
  insights: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

export const DailyProgressSchema = z.object({
  date: z.string(),
  mood_rating: z.number().min(1).max(10).optional(),
  stress_level: z.number().min(1).max(10).optional(),
  focus_level: z.number().min(1).max(10).optional(),
  energy_level: z.number().min(1).max(10).optional(),
  completed_activities: z.array(z.string()).optional(),
  notes: z.string().optional(),
  sleep_hours: z.number().optional(),
  symptoms: z.array(z.string()).optional(),
});

// Repository pattern for data access
export class PatientRepository {
  /**
   * Get patient by ID
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get patients by organization
   */
  static async getByOrganization(orgId: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create new patient
   */
  static async create(orgId: string, ownerUserId: string, patient: z.infer<typeof PatientSchema>) {
    const validated = PatientSchema.parse(patient);

    const { data, error } = await supabase
      .from('patients')
      .insert({
        org_id: orgId,
        owner_user: ownerUserId,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update patient
   */
  static async update(id: string, updates: Partial<z.infer<typeof PatientSchema>>) {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete patient
   */
  static async delete(id: string) {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Search patients
   */
  static async search(orgId: string, query: string) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('org_id', orgId)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export class AssessmentRepository {
  /**
   * Get assessments for patient
   */
  static async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get latest assessment by type
   */
  static async getLatestByType(patientId: string, type: string) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('assessment_type', type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create assessment
   */
  static async create(patientId: string, assessment: z.infer<typeof AssessmentSchema>) {
    const validated = AssessmentSchema.parse(assessment);

    const { data, error } = await supabase
      .from('assessments')
      .insert({
        patient_id: patientId,
        ...validated,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Calculate brain fitness score
   */
  static async calculateBrainFitnessScore(patientId: string) {
    const { data, error } = await supabase
      .rpc('calculate_brain_fitness_score', { patient_id: patientId });

    if (error) throw error;
    return data;
  }
}

export class ReportRepository {
  /**
   * Get reports for patient
   */
  static async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('eeg_reports')
      .select(`
        *,
        sessions (
          id,
          session_type,
          started_at,
          clinician_id
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create report
   */
  static async create(report: {
    patient_id: string;
    session_id?: string;
    metrics: any;
    summary?: string;
    recommendations?: string[];
    file_path?: string;
  }) {
    const { data, error } = await supabase
      .from('eeg_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update report
   */
  static async update(id: string, updates: Partial<Database['public']['Tables']['eeg_reports']['Update']>) {
    const { data, error } = await supabase
      .from('eeg_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export class OrganizationRepository {
  /**
   * Get organization by ID
   */
  static async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        org_memberships (
          user_id,
          role,
          profiles (
            id,
            full_name,
            role
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user's organizations
   */
  static async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('org_memberships')
      .select(`
        role,
        organizations (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  /**
   * Create organization
   */
  static async create(org: {
    name: string;
    type: 'clinic' | 'hospital' | 'research';
  }, ownerUserId: string) {
    // Start a transaction
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: org.name,
        type: org.type,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add owner as member
    const { error: memberError } = await supabase
      .from('org_memberships')
      .insert({
        org_id: orgData.id,
        user_id: ownerUserId,
        role: 'owner',
      });

    if (memberError) {
      // Rollback org creation
      await supabase.from('organizations').delete().eq('id', orgData.id);
      throw memberError;
    }

    return orgData;
  }

  /**
   * Add member to organization
   */
  static async addMember(orgId: string, userId: string, role: 'owner' | 'clinician' | 'staff') {
    const { data, error } = await supabase
      .from('org_memberships')
      .insert({
        org_id: orgId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove member from organization
   */
  static async removeMember(orgId: string, userId: string) {
    const { error } = await supabase
      .from('org_memberships')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}

export class DailyProgressRepository {
  /**
   * Get progress for patient
   */
  static async getByPatient(patientId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get progress for date
   */
  static async getByDate(patientId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('patient_id', patientId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create or update progress
   */
  static async upsert(patientId: string, progress: z.infer<typeof DailyProgressSchema>) {
    const validated = DailyProgressSchema.parse(progress);

    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        patient_id: patientId,
        ...validated,
      }, {
        onConflict: 'patient_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get progress statistics
   */
  static async getStats(patientId: string, days = 30) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('patient_id', patientId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;

    // Calculate statistics
    const stats = {
      avgMood: 0,
      avgStress: 0,
      avgFocus: 0,
      avgEnergy: 0,
      avgSleep: 0,
      totalDays: data.length,
    };

    if (data.length > 0) {
      const sums = data.reduce((acc, day) => ({
        mood: acc.mood + (day.mood_rating || 0),
        stress: acc.stress + (day.stress_level || 0),
        focus: acc.focus + (day.focus_level || 0),
        energy: acc.energy + (day.energy_level || 0),
        sleep: acc.sleep + (day.sleep_hours || 0),
      }), { mood: 0, stress: 0, focus: 0, energy: 0, sleep: 0 });

      stats.avgMood = sums.mood / data.length;
      stats.avgStress = sums.stress / data.length;
      stats.avgFocus = sums.focus / data.length;
      stats.avgEnergy = sums.energy / data.length;
      stats.avgSleep = sums.sleep / data.length;
    }

    return stats;
  }
}

export class SessionRepository {
  /**
   * Get sessions for patient
   */
  static async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        clinician:profiles!sessions_clinician_id_fkey (
          id,
          full_name,
          role
        )
      `)
      .eq('patient_id', patientId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get sessions by clinician
   */
  static async getByClinician(clinicianId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        patient:patients (
          id,
          full_name,
          date_of_birth
        )
      `)
      .eq('clinician_id', clinicianId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Create session
   */
  static async create(session: {
    patient_id: string;
    clinician_id: string;
    session_type: 'initial' | 'followup' | 'assessment';
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * End session
   */
  static async end(id: string, notes?: string) {
    const updates: any = { ended_at: new Date().toISOString() };
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get active session
   */
  static async getActive(clinicianId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('clinician_id', clinicianId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export class SubscriptionRepository {
  /**
   * Get organization subscription
   */
  static async getByOrg(orgId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create subscription
   */
  static async create(subscription: {
    org_id: string;
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    credits: number;
    valid_until: string;
    stripe_subscription_id?: string;
  }) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscription)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update subscription
   */
  static async update(id: string, updates: {
    status?: 'active' | 'cancelled' | 'expired';
    credits?: number;
    valid_until?: string;
  }) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Use credits
   */
  static async useCredits(orgId: string, amount: number) {
    const subscription = await this.getByOrg(orgId);

    if (!subscription) throw new Error('No active subscription');
    if (subscription.credits < amount) throw new Error('Insufficient credits');

    return this.update(subscription.id, {
      credits: subscription.credits - amount,
    });
  }

  /**
   * Check if subscription is valid
   */
  static async isValid(orgId: string): Promise<boolean> {
    const subscription = await this.getByOrg(orgId);

    if (!subscription) return false;

    const now = new Date();
    const validUntil = new Date(subscription.valid_until);

    return subscription.status === 'active' && validUntil > now;
  }
}

export class PaymentRepository {
  /**
   * Get payment history
   */
  static async getByOrg(orgId: string, limit = 50) {
    const { data, error } = await supabase
      .from('payment_history')
      .select(`
        *,
        subscription:subscriptions (
          id,
          plan,
          credits
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Create payment record
   */
  static async create(payment: {
    org_id: string;
    subscription_id?: string;
    amount: number;
    currency?: string;
    payment_method?: string;
    stripe_payment_id?: string;
    status: string;
  }) {
    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        currency: 'USD',
        ...payment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get payment by stripe ID
   */
  static async getByStripeId(stripePaymentId: string) {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('stripe_payment_id', stripePaymentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

export class CoachingSessionRepository {
  /**
   * Get coaching sessions for patient
   */
  static async getByPatient(patientId: string) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .select(`
        *,
        coach:profiles!coaching_sessions_coach_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('patient_id', patientId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get coaching sessions for coach
   */
  static async getByCoach(coachId: string) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .select(`
        *,
        patient:patients (
          id,
          full_name,
          improvement_focus
        )
      `)
      .eq('coach_id', coachId)
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Create coaching session
   */
  static async create(session: {
    patient_id: string;
    coach_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    session_type: string;
    meeting_link?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .insert({
        duration_minutes: 60,
        ...session,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update coaching session
   */
  static async update(id: string, updates: {
    status?: string;
    notes?: string;
    meeting_link?: string;
  }) {
    const { data, error } = await supabase
      .from('coaching_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get upcoming sessions
   */
  static async getUpcoming(userId: string, isCoach = false) {
    const query = supabase
      .from('coaching_sessions')
      .select('*')
      .gte('scheduled_at', new Date().toISOString())
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true });

    if (isCoach) {
      query.eq('coach_id', userId);
    } else {
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .eq('owner_user', userId);

      if (patients && patients.length > 0) {
        query.in('patient_id', patients.map(p => p.id));
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export class DailyContentRepository {
  /**
   * Get content for patient
   */
  static async getByPatient(patientId: string, limit = 30) {
    const { data, error } = await supabase
      .from('daily_content')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Get content for date
   */
  static async getByDate(patientId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_content')
      .select('*')
      .eq('patient_id', patientId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Create or update content
   */
  static async upsert(patientId: string, content: {
    date: string;
    content_data: any;
    viewed?: boolean;
    completed?: boolean;
  }) {
    const { data, error } = await supabase
      .from('daily_content')
      .upsert({
        patient_id: patientId,
        ...content,
      }, {
        onConflict: 'patient_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark as viewed
   */
  static async markViewed(patientId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_content')
      .update({ viewed: true })
      .eq('patient_id', patientId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark as completed
   */
  static async markCompleted(patientId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_content')
      .update({ completed: true })
      .eq('patient_id', patientId)
      .eq('date', date)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}