// Test Supabase Authentication Flow
import { createClient } from '@supabase/supabase-js';

export const testSupabaseAuth = async () => {
  console.log(' Testing Supabase Authentication Flow...');

  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('DEBUG: Environment Check:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present SUCCESS:' : 'Missing ERROR:');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing Supabase environment variables');
    return false;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Check if Supabase is accessible
    console.log(' Testing Supabase connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('ERROR: Supabase auth connection failed:', authError.message);
      return false;
    }

    console.log('SUCCESS: Supabase auth connection successful');

    // Test 2: Check auth settings
    console.log('CONFIG: Checking auth configuration...');

    // Test 3: Try to create a test user (this will help identify auth issues)
    console.log(' Testing user creation flow...');

    const testEmail = `test-${Date.now()}@aimstest.com`;
    const testPassword = 'TestPassword123!';

    console.log('NOTE: Attempting to create test user:', testEmail);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'super_admin',
          user_type: 'super_admin'
        }
      }
    });

    if (signUpError) {
      console.error('ERROR: User creation failed:', signUpError.message);
      console.error('DEBUG: Error details:', signUpError);

      // Common auth issues
      if (signUpError.message.includes('Email not confirmed')) {
        console.warn('WARNING: Email confirmation required. Check your Supabase Auth settings.');
        console.warn('IDEA: Go to Supabase Dashboard > Authentication > Settings');
        console.warn('IDEA: Set "Enable email confirmations" to OFF for testing');
      }

      if (signUpError.message.includes('User already registered')) {
        console.warn('WARNING: User already exists - this is actually good, auth is working!');
        return true;
      }

      if (signUpError.message.includes('Invalid email')) {
        console.warn('WARNING: Email validation issue');
      }

      return false;
    }

    if (signUpData.user) {
      console.log('SUCCESS: Test user created successfully!');
      console.log('INFO: User details:', {
        id: signUpData.user.id,
        email: signUpData.user.email,
        email_confirmed_at: signUpData.user.email_confirmed_at,
        created_at: signUpData.user.created_at
      });

      // Check if user needs email confirmation
      if (!signUpData.user.email_confirmed_at && signUpData.user.confirmation_sent_at) {
        console.warn('WARNING: Email confirmation required for this user');
        console.warn('IDEA: Check your email or disable email confirmation in Supabase settings');
      }

      return true;
    }

    return false;

  } catch (error) {
    console.error('ERROR: Test failed with error:', error.message);
    return false;
  }
};

// Test specifically for super admin creation
export const testSuperAdminCreation = async (userData) => {
  console.log('SUPERADMIN: Testing Super Admin Creation Flow...');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: Missing environment variables');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('AUTH: Step 1: Creating user in Supabase Auth...');

    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.name,
          role: 'super_admin',
          user_type: 'super_admin'
        }
      }
    });

    if (error) {
      console.error('ERROR: Supabase auth creation failed:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error('ERROR: No user returned from Supabase');
      return { success: false, error: 'No user returned' };
    }

    console.log('SUCCESS: User created in Supabase Auth:', data.user.id);
    console.log('EMAIL: Email confirmation needed:', !data.user.email_confirmed_at);

    // Test database operations
    console.log('️ Step 2: Testing database table access...');

    // Test profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (profilesError) {
      console.error('ERROR: Profiles table not accessible:', profilesError.message);
      return { success: false, error: 'Profiles table not accessible' };
    }

    // Test super_admin_profiles table
    const { error: superAdminError } = await supabase
      .from('super_admin_profiles')
      .select('count', { count: 'exact', head: true });

    if (superAdminError) {
      console.error('ERROR: Super admin profiles table not accessible:', superAdminError.message);
      return { success: false, error: 'Super admin profiles table not accessible' };
    }

    console.log('SUCCESS: All database tables accessible');

    return {
      success: true,
      user: data.user,
      needsEmailConfirmation: !data.user.email_confirmed_at
    };

  } catch (error) {
    console.error('ERROR: Super admin creation test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default testSupabaseAuth;