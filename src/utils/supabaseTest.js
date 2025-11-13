// Supabase Connection Test Utility
import { createClient } from '@supabase/supabase-js';

// Test Supabase connection and configuration
export const testSupabaseConnection = async () => {
  console.log('DEBUG: Testing Supabase connection...');

  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('Environment variables:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present SUCCESS:' : 'Missing ERROR:');

  // Check if environment variables are set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Supabase environment variables are missing!');
    console.log('Please check your .env file and make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
    return false;
  }

  // Check if using placeholder values
  if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
    console.error('ERROR: Supabase environment variables are using placeholder values!');
    console.log('Please update your .env file with actual Supabase credentials.');
    return false;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test connection by trying to fetch from a system table
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('ERROR: Supabase connection test failed:', error.message);
      return false;
    }

    console.log('SUCCESS: Supabase connection successful!');
    console.log('Session status:', data?.session ? 'Active session' : 'No active session');

    // Test database connection by checking if profiles table exists
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

      if (dbError) {
        if (dbError.code === '42P01') {
          console.warn('WARNING: Database tables not found. Please run the migration script.');
          console.log('Run the complete_migration.sql script in your Supabase SQL Editor.');
        } else {
          console.error('ERROR: Database connection error:', dbError.message);
        }
        return false;
      }

      console.log('SUCCESS: Database connection successful!');
      console.log('SUCCESS: Required tables are present');

    } catch (dbError) {
      console.error('ERROR: Database test failed:', dbError.message);
      return false;
    }

    return true;

  } catch (error) {
    console.error('ERROR: Supabase client creation failed:', error.message);
    return false;
  }
};

// Export for use in other components
export default testSupabaseConnection;