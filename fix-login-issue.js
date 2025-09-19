// Fix login issue for bkmurali683@gmail.com
// This script will help diagnose and fix the authentication problem

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omyltmcesgbhnqmhrrvq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWx0bWNlc2diaG5xbWhycnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxNDc5ODEsImV4cCI6MjAzOTcyMzk4MX0.dX4sI7H-TKH7VKdVp1klD9-t5r2tTEKXHlD1s6RQcDE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseLoginIssue() {
  console.log('🔍 Diagnosing login issue for: bkmurali683@gmail.com');

  try {
    // Try to sign in with the provided credentials
    console.log('\n1️⃣ Attempting login with provided credentials...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'bkmurali683@gmail.com',
      password: 'Bkmurali683@'
    });

    if (loginError) {
      console.log('❌ Login failed with error:', loginError.message);

      if (loginError.message.includes('Invalid login credentials')) {
        console.log('\n2️⃣ Checking if user exists in auth.users...');

        // Check if user exists in the database
        const { data: users, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', 'bkmurali683@gmail.com');

        if (userError) {
          console.log('❌ Error checking user in profiles:', userError.message);
        } else if (users && users.length > 0) {
          console.log('✅ User found in profiles table:', users[0]);
          console.log('\n3️⃣ The user exists but password is incorrect.');
          console.log('📝 Suggested solutions:');
          console.log('   a) Try with a different password');
          console.log('   b) Reset password in Supabase dashboard');
          console.log('   c) Use the test credentials from SUPER-ADMIN-CREDENTIALS.md');
        } else {
          console.log('❌ User not found in profiles table');
        }
      }
    } else {
      console.log('✅ Login successful!');
      console.log('User data:', loginData.user);
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

async function tryTestCredentials() {
  console.log('\n🧪 Testing with known working credentials...');

  const testCredentials = [
    { email: 'superadmin@neurosense360.com', password: 'SuperAdmin@2024', role: 'super_admin' },
    { email: 'admin@neuro360.com', password: 'Admin123456', role: 'super_admin' },
    { email: 'clinic1@test.com', password: 'Clinic123', role: 'clinic_admin' },
    { email: 'patient1@test.com', password: 'Patient123', role: 'patient' }
  ];

  for (const cred of testCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (error) {
        console.log(`❌ ${cred.email}: ${error.message}`);
      } else {
        console.log(`✅ ${cred.email}: Login successful (${cred.role})`);
        // Sign out immediately
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`❌ ${cred.email}: ${error.message}`);
    }
  }
}

async function checkSupabaseConnection() {
  console.log('\n🔗 Checking Supabase connection...');

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

async function main() {
  console.log('🔐 LOGIN ISSUE DIAGNOSTIC TOOL');
  console.log('================================');

  await checkSupabaseConnection();
  await diagnoseLoginIssue();
  await tryTestCredentials();

  console.log('\n💡 RECOMMENDATIONS:');
  console.log('1. Use the working test credentials from SUPER-ADMIN-CREDENTIALS.md');
  console.log('2. If you need this specific email, reset the password in Supabase dashboard');
  console.log('3. Or use the dev helper (bottom-right corner) for instant login');

  process.exit(0);
}

main().catch(console.error);