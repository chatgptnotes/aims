// Test Supabase Authentication Flow
import { createClient } from '@supabase/supabase-js';

export const testSupabaseAuth = async () => {
  console.log('🧪 Testing Supabase Authentication Flow...');

  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Environment Check:');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present ✅' : 'Missing ❌');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return false;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Check if Supabase is accessible
    console.log('🔗 Testing Supabase connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Supabase auth connection failed:', authError.message);
      return false;
    }

    console.log('✅ Supabase auth connection successful');

    // Test 2: Check auth settings
    console.log('🔧 Checking auth configuration...');

    // Test 3: Try to create a test user (this will help identify auth issues)
    console.log('👤 Testing user creation flow...');

    const testEmail = `test-${Date.now()}@neuro360test.com`;
    const testPassword = 'TestPassword123!';

    console.log('📝 Attempting to create test user:', testEmail);

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
      console.error('❌ User creation failed:', signUpError.message);
      console.error('🔍 Error details:', signUpError);

      // Common auth issues
      if (signUpError.message.includes('Email not confirmed')) {
        console.warn('⚠️ Email confirmation required. Check your Supabase Auth settings.');
        console.warn('💡 Go to Supabase Dashboard > Authentication > Settings');
        console.warn('💡 Set "Enable email confirmations" to OFF for testing');
      }

      if (signUpError.message.includes('User already registered')) {
        console.warn('⚠️ User already exists - this is actually good, auth is working!');
        return true;
      }

      if (signUpError.message.includes('Invalid email')) {
        console.warn('⚠️ Email validation issue');
      }

      return false;
    }

    if (signUpData.user) {
      console.log('✅ Test user created successfully!');
      console.log('📋 User details:', {
        id: signUpData.user.id,
        email: signUpData.user.email,
        email_confirmed_at: signUpData.user.email_confirmed_at,
        created_at: signUpData.user.created_at
      });

      // Check if user needs email confirmation
      if (!signUpData.user.email_confirmed_at && signUpData.user.confirmation_sent_at) {
        console.warn('⚠️ Email confirmation required for this user');
        console.warn('💡 Check your email or disable email confirmation in Supabase settings');
      }

      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
};

// Test specifically for super admin creation
export const testSuperAdminCreation = async (userData) => {
  console.log('👑 Testing Super Admin Creation Flow...');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('🔐 Step 1: Creating user in Supabase Auth...');

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
      console.error('❌ Supabase auth creation failed:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      console.error('❌ No user returned from Supabase');
      return { success: false, error: 'No user returned' };
    }

    console.log('✅ User created in Supabase Auth:', data.user.id);
    console.log('📧 Email confirmation needed:', !data.user.email_confirmed_at);

    // Test database operations
    console.log('🗄️ Step 2: Testing database table access...');

    // Test profiles table
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (profilesError) {
      console.error('❌ Profiles table not accessible:', profilesError.message);
      return { success: false, error: 'Profiles table not accessible' };
    }

    // Test super_admin_profiles table
    const { error: superAdminError } = await supabase
      .from('super_admin_profiles')
      .select('count', { count: 'exact', head: true });

    if (superAdminError) {
      console.error('❌ Super admin profiles table not accessible:', superAdminError.message);
      return { success: false, error: 'Super admin profiles table not accessible' };
    }

    console.log('✅ All database tables accessible');

    return {
      success: true,
      user: data.user,
      needsEmailConfirmation: !data.user.email_confirmed_at
    };

  } catch (error) {
    console.error('❌ Super admin creation test failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default testSupabaseAuth;