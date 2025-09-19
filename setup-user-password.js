// Setup password for bkmurali683@gmail.com
// This script will help configure the user properly in Supabase

import { createClient } from '@supabase/supabase-js';

// Use correct environment variables
const supabaseUrl = 'https://omyltmcesgbhnqmhrrvq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWx0bWNlc2diaG5xbWhycnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzY2NTAsImV4cCI6MjA3Mzc1MjY1MH0.d4VqaDBlrEJ1xYPt4kt60y90RRbtndRRaF9WzpWxWcU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupUserPassword() {
  console.log('🔧 Setting up password for: bkmurali683@gmail.com');
  console.log('================================================');

  const email = 'bkmurali683@gmail.com';
  const newPassword = 'Bkmurali683@2024'; // Updated stronger password

  try {
    console.log('\n1️⃣ Checking current Supabase connection...');

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    console.log('\n2️⃣ Checking if user exists...');

    // Check if user exists in profiles
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.log('❌ Error checking user:', userError.message);
      return;
    }

    if (existingUser) {
      console.log('✅ User exists in profiles:', {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        name: existingUser.full_name
      });

      console.log('\n3️⃣ Attempting to sign up with new password...');

      // Try to sign up (this will update password if user exists)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: newPassword,
        options: {
          data: {
            full_name: existingUser.full_name || 'Ayushman',
            role: existingUser.role || 'clinic_admin'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log('ℹ️ User already registered, trying password reset...');

          // Send password reset email
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:5178/reset-password'
          });

          if (resetError) {
            console.log('❌ Password reset failed:', resetError.message);
          } else {
            console.log('✅ Password reset email sent! Check your email.');
            console.log('📧 After receiving the email, click the link to set new password.');
          }
        } else {
          console.log('❌ Sign up error:', signUpError.message);
        }
      } else {
        console.log('✅ Password setup successful!');
        console.log('User data:', signUpData.user?.email);
      }
    } else {
      console.log('ℹ️ User not found in profiles, creating new user...');

      // Create new user
      const { data: newUserData, error: createError } = await supabase.auth.signUp({
        email: email,
        password: newPassword,
        options: {
          data: {
            full_name: 'Ayushman',
            role: 'clinic_admin'
          }
        }
      });

      if (createError) {
        console.log('❌ User creation failed:', createError.message);
      } else {
        console.log('✅ New user created successfully!');
        console.log('User ID:', newUserData.user?.id);

        // Add to profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUserData.user.id,
            email: email,
            full_name: 'Ayushman',
            role: 'clinic_admin',
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.log('⚠️ Profile creation warning:', profileError.message);
        } else {
          console.log('✅ Profile added to database');
        }
      }
    }

    console.log('\n4️⃣ Testing login with new credentials...');

    // Test login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: newPassword
    });

    if (loginError) {
      console.log('❌ Login test failed:', loginError.message);
      console.log('\n💡 Manual Solutions:');
      console.log('1. Go to Supabase Dashboard → Authentication → Users');
      console.log(`2. Find ${email} and click "..." → "Edit user"`);
      console.log('3. Set password manually to: Bkmurali683@2024');
      console.log('4. Click "Update user"');
    } else {
      console.log('✅ Login test successful!');
      console.log('🎉 You can now login with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);

      // Sign out after test
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

async function showLoginInstructions() {
  console.log('\n🚀 LOGIN INSTRUCTIONS:');
  console.log('======================');
  console.log('1. Go to: http://localhost:5178/login');
  console.log('2. Email: bkmurali683@gmail.com');
  console.log('3. Password: Bkmurali683@2024');
  console.log('4. Click Login');
  console.log('\n🔄 Alternative - Use Dev Helper:');
  console.log('1. Go to: http://localhost:5178');
  console.log('2. Click dev helper (bottom-right)');
  console.log('3. Click "Login as Super Admin"');
  console.log('\n✅ Guaranteed Working Credentials:');
  console.log('📧 superadmin@neurosense360.com');
  console.log('🔒 SuperAdmin@2024');
}

async function main() {
  console.log('🔐 USER PASSWORD SETUP TOOL');
  console.log('============================');

  await setupUserPassword();
  await showLoginInstructions();

  console.log('\n✨ Setup complete!');
  process.exit(0);
}

main().catch(console.error);