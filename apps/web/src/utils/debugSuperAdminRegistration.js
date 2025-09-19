// Debug utility for Super Admin Registration
import { authService } from '../services/authService';

export const debugSuperAdminRegistration = async (userData) => {
  console.log('🐛 DEBUG: Super Admin Registration Started');
  console.log('🔍 Input data:', {
    name: userData.name,
    email: userData.email,
    userType: userData.userType,
    hasPassword: !!userData.password,
    hasConfirmPassword: !!userData.confirmPassword
  });

  try {
    // Call the registration service
    const result = await authService.registerWithEmail(userData);

    console.log('✅ DEBUG: Registration completed successfully');
    console.log('📦 Result:', result);

    return result;

  } catch (error) {
    console.error('❌ DEBUG: Registration failed');
    console.error('🚨 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check if it's a Supabase-specific error
    if (error.message.includes('Supabase')) {
      console.error('🔧 Supabase-related error detected');
      console.error('💡 Check:');
      console.error('   1. Are environment variables set correctly?');
      console.error('   2. Is the migration script run in Supabase?');
      console.error('   3. Do the tables exist?');
    }

    // Check if it's a database constraint error
    if (error.message.includes('constraint') || error.message.includes('foreign key')) {
      console.error('🔧 Database constraint error detected');
      console.error('💡 Check:');
      console.error('   1. Are the foreign key relationships correct?');
      console.error('   2. Does the profiles table exist?');
      console.error('   3. Does the super_admin_profiles table exist?');
    }

    throw error;
  }
};

// Test function to check database readiness
export const testDatabaseReadiness = async () => {
  console.log('🧪 Testing database readiness for super admin registration...');

  try {
    // Import Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Environment variables missing');
      return false;
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test 1: Check if profiles table exists
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (profilesError) {
      console.error('❌ Profiles table not accessible:', profilesError.message);
      return false;
    }

    console.log('✅ Profiles table accessible');

    // Test 2: Check if super_admin_profiles table exists
    const { error: superAdminError } = await supabase
      .from('super_admin_profiles')
      .select('count', { count: 'exact', head: true });

    if (superAdminError) {
      console.error('❌ Super admin profiles table not accessible:', superAdminError.message);
      return false;
    }

    console.log('✅ Super admin profiles table accessible');

    console.log('🎉 Database is ready for super admin registration!');
    return true;

  } catch (error) {
    console.error('❌ Database readiness test failed:', error.message);
    return false;
  }
};

// Export for use in components
export default debugSuperAdminRegistration;