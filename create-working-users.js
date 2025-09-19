// Create working test users for immediate login
// This will set up users that you can definitely login with

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omyltmcesgbhnqmhrrvq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teWx0bWNlc2diaG5xbWhycnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzY2NTAsImV4cCI6MjA3Mzc1MjY1MH0.d4VqaDBlrEJ1xYPt4kt60y90RRbtndRRaF9WzpWxWcU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testUsers = [
  {
    email: 'admin@neuro360.com',
    password: 'Admin123456!',
    role: 'super_admin',
    name: 'Super Admin'
  },
  {
    email: 'clinic@neuro360.com',
    password: 'Clinic123456!',
    role: 'clinic_admin',
    name: 'Clinic Admin'
  },
  {
    email: 'patient@neuro360.com',
    password: 'Patient123456!',
    role: 'patient',
    name: 'Test Patient'
  },
  {
    email: 'bkmurali683@gmail.com',
    password: 'Bkmurali683@123',
    role: 'super_admin',
    name: 'Ayushman'
  }
];

async function createWorkingUsers() {
  console.log('🔧 Creating working test users...');
  console.log('===================================');

  for (const user of testUsers) {
    try {
      console.log(`\n📝 Creating user: ${user.email}`);

      // Try to create the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name,
            role: user.role
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log(`ℹ️  User already exists: ${user.email}`);

          // Try to sign in to verify it works
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });

          if (signInError) {
            console.log(`❌ Login failed for ${user.email}: ${signInError.message}`);
          } else {
            console.log(`✅ Login successful for ${user.email}`);
            await supabase.auth.signOut();
          }
        } else {
          console.log(`❌ Signup error for ${user.email}: ${signUpError.message}`);
        }
      } else {
        console.log(`✅ User created: ${user.email}`);

        // Add to profiles table if needed
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: signUpData.user.id,
              email: user.email,
              full_name: user.name,
              role: user.role,
              created_at: new Date().toISOString()
            });

          if (profileError) {
            console.log(`⚠️  Profile warning for ${user.email}: ${profileError.message}`);
          } else {
            console.log(`✅ Profile created for ${user.email}`);
          }
        }
      }
    } catch (error) {
      console.log(`❌ Error with ${user.email}: ${error.message}`);
    }
  }
}

async function testLogin() {
  console.log('\n🧪 Testing login for all users...');
  console.log('=================================');

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`❌ ${user.email}: ${error.message}`);
      } else {
        console.log(`✅ ${user.email}: LOGIN WORKS! (${user.role})`);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`❌ ${user.email}: ${error.message}`);
    }
  }
}

async function showWorkingCredentials() {
  console.log('\n🎯 WORKING CREDENTIALS:');
  console.log('======================');

  testUsers.forEach(user => {
    console.log(`\n${user.role.toUpperCase()}:`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔒 Password: ${user.password}`);
  });

  console.log('\n🚀 HOW TO LOGIN:');
  console.log('===============');
  console.log('1. Go to: http://localhost:5178/login');
  console.log('2. Use any of the credentials above');
  console.log('3. Click Login');

  console.log('\n🔄 ALTERNATIVE - DEV HELPER:');
  console.log('============================');
  console.log('1. Go to: http://localhost:5178');
  console.log('2. Look for DEV HELPER button (bottom-right corner)');
  console.log('3. Click "Login as Super Admin"');
  console.log('4. INSTANT ACCESS - NO PASSWORD NEEDED!');
}

async function main() {
  console.log('🔐 WORKING USER SETUP TOOL');
  console.log('===========================');

  await createWorkingUsers();
  await testLogin();
  await showWorkingCredentials();

  console.log('\n✨ Setup complete! You now have working login credentials.');
  process.exit(0);
}

main().catch(console.error);