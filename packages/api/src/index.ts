// Main API exports
export * from './auth';
export * from './database';
export * from './storage';
export * from './supabase';

// Re-export types
export type { Database } from './types/database';

// Convenience exports for repositories
export {
  PatientRepository,
  AssessmentRepository,
  ReportRepository,
  OrganizationRepository,
  DailyProgressRepository,
  SessionRepository,
  SubscriptionRepository,
  PaymentRepository,
  CoachingSessionRepository,
  DailyContentRepository,
  // Zod schemas
  PatientSchema,
  AssessmentSchema,
  DailyProgressSchema,
} from './database';

// Storage utilities
export {
  uploadFile,
  downloadFile,
  getPublicUrl,
  getSignedUrl,
  deleteFile,
  listFiles,
  uploadReport,
  uploadAvatar,
  getReportUrl,
} from './storage';

// Auth utilities
export {
  signUp,
  signIn,
  signInWithOtp,
  signOut,
  getCurrentUser,
  updateProfile,
  resetPassword,
  updatePassword,
  hasRole,
  belongsToOrg,
  onAuthStateChange,
} from './auth';

// Supabase clients
export {
  supabase,
  getClient,
  getSupabaseClient,
  getServiceRoleClient,
} from './supabase';