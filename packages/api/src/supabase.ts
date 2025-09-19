import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Environment variables - Support both Next.js and Vite environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||
                    process.env.VITE_SUPABASE_URL ||
                    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
                    'https://omyltmcesgbhnqmhrrvq.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                        process.env.VITE_SUPABASE_ANON_KEY ||
                        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWx0bWNlc2diaG5xbWhycnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzY2NTAsImV4cCI6MjA3Mzc1MjY1MH0.d4VqaDBlrEJ1xYPt4kt60y90RRbtndRRaF9WzpWxWcU';

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWx0bWNlc2diaG5xbWhycnZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE3NjY1MCwiZXhwIjoyMDczNzUyNjUwfQ.UZT7MbCkfi-AuMaZ7tcV78bjyOT6PKOJHiP0x1LlFhM';

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client singleton for browser/public use
let publicClient: SupabaseClient<Database> | null = null;
let serviceClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client for public/browser use
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!publicClient) {
    publicClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'neuro360-auth',
      },
      global: {
        headers: {
          'x-application-name': 'neuro360',
        },
      },
      db: {
        schema: 'public',
      },
    });
  }
  return publicClient;
}

/**
 * Get Supabase service role client (server-side only)
 */
export function getServiceSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('Service role client can only be used on the server');
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!serviceClient) {
    serviceClient = createClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-application-name': 'neuro360-service',
        },
      },
    });
  }
  return serviceClient;
}

// Export default client
export const supabase = getSupabaseClient();

// Helper to check if we're on server
export const isServer = typeof window === 'undefined';

// Helper to get the right client based on context
export function getClient(useServiceRole = false): SupabaseClient<Database> {
  if (useServiceRole && isServer) {
    return getServiceSupabaseClient();
  }
  return getSupabaseClient();
}