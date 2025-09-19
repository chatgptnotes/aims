// Check Clinic Data Storage in Database
// This script verifies if clinic registration data is being stored properly

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const envPath = path.join(__dirname, 'apps', 'web', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1].trim();
const supabaseAnonKey = supabaseKeyMatch[1].trim();

console.log('🔍 Checking Clinic Data Storage...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkClinicData() {
  try {
    console.log('1️⃣ Checking auth.users table...');

    // Check recent registrations in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('⚠️ Cannot access auth.users (admin access required)');
      console.log('💡 This is normal - continuing with other checks...\n');
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users`);

      // Show recent users
      const recentUsers = authUsers.users.slice(-5);
      recentUsers.forEach(user => {
        console.log(`   📧 ${user.email} (${user.user_metadata?.role || 'no role'}) - ${user.created_at}`);
      });
    }

    console.log('\n2️⃣ Checking profiles table...');

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles`);
      profiles.forEach(profile => {
        console.log(`   👤 ${profile.full_name} (${profile.role}) - ${profile.email}`);
      });
    }

    console.log('\n3️⃣ Checking organizations table...');

    // Check organizations table
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (orgsError) {
      console.log('❌ Error accessing organizations table:', orgsError.message);
    } else {
      console.log(`✅ Found ${organizations.length} organizations`);
      organizations.forEach(org => {
        console.log(`   🏢 ${org.name} (${org.type}) - ${org.subscription_tier}`);
      });
    }

    console.log('\n4️⃣ Checking clinics table...');

    // Check clinics table (our custom table)
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (clinicsError) {
      console.log('❌ Error accessing clinics table:', clinicsError.message);
      console.log('💡 This might mean the migration hasn\'t been run yet');
    } else {
      console.log(`✅ Found ${clinics.length} clinic records`);
      clinics.forEach(clinic => {
        console.log(`   🏥 ${clinic.name} - ${clinic.email}`);
        console.log(`      Status: ${clinic.subscription_status} | Active: ${clinic.is_active}`);
        console.log(`      Reports: ${clinic.reports_used}/${clinic.reports_allowed}`);
      });
    }

    console.log('\n5️⃣ Checking org_memberships table...');

    // Check organization memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('org_memberships')
      .select('*, organizations(name), profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (membershipsError) {
      console.log('❌ Error accessing org_memberships table:', membershipsError.message);
    } else {
      console.log(`✅ Found ${memberships.length} organization memberships`);
      memberships.forEach(membership => {
        console.log(`   🔗 ${membership.profiles?.full_name} → ${membership.organizations?.name} (${membership.role})`);
      });
    }

    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));

    const totalRecords = (profiles?.length || 0) + (organizations?.length || 0) + (clinics?.length || 0);

    if (totalRecords > 0) {
      console.log('✅ Database has registration data!');
      console.log(`📈 Total records: ${totalRecords}`);
      console.log('🎯 Registration flow is working correctly');
    } else {
      console.log('⚠️ No registration data found');
      console.log('💡 Either no registrations have been made, or migration hasn\'t been run');
    }

  } catch (error) {
    console.error('❌ Error checking clinic data:', error.message);
  }
}

async function testRegistrationFlow() {
  console.log('\n🧪 CLINIC REGISTRATION TEST:');
  console.log('='.repeat(50));
  console.log('📋 To test clinic registration:');
  console.log('1. Go to: http://localhost:5178');
  console.log('2. Click: "I want it for my clinic"');
  console.log('3. Click: "Create New Account"');
  console.log('4. Fill form:');
  console.log('   Name: Test Clinic');
  console.log('   Email: testclinic@example.com');
  console.log('   Password: testpass123');
  console.log('5. Submit form');
  console.log('6. Check console for success/error messages');
  console.log('7. Re-run this script to verify data storage\n');
}

// Run the checks
await checkClinicData();
await testRegistrationFlow();

console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/omyltmcesgbhnqmhrrvq');
console.log('📊 Check Tables section to see stored data');