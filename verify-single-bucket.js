/**
 * Simple Verification Script - Single Bucket Setup
 * Checks if patient-reports bucket is properly configured
 *
 * Usage: node verify-single-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Verifying Single Bucket Setup...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials missing!');
  console.error('\n📝 Create a .env file with:');
  console.error('   VITE_SUPABASE_URL=your_supabase_url');
  console.error('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  let allChecksPass = true;

  try {
    // Check 1: Supabase Connection
    console.log('📡 Check 1: Supabase Connection');
    console.log('   Testing connection to Supabase...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('   ❌ FAILED: Cannot connect to Supabase');
      console.error('   Error:', bucketsError.message);
      console.error('   → Check your credentials in .env file\n');
      allChecksPass = false;
      return false;
    }

    console.log('   ✅ PASSED: Connected successfully\n');

    // Check 2: patient-reports Bucket
    console.log('📦 Check 2: Patient Reports Bucket');
    console.log('   Looking for "patient-reports" bucket...');

    const patientReportsBucket = buckets.find(b => b.name === 'patient-reports');

    if (!patientReportsBucket) {
      console.error('   ❌ FAILED: Bucket "patient-reports" not found');
      console.error('   → Go to Supabase Dashboard → Storage');
      console.error('   → Click "Create a new bucket"');
      console.error('   → Name: patient-reports (exactly this!)');
      console.error('   → Public: NO (keep it private)');
      console.error('   → File size limit: 52428800 (50MB)\n');
      allChecksPass = false;
    } else {
      console.log('   ✅ PASSED: Bucket exists');
      console.log(`   - Name: ${patientReportsBucket.name}`);
      console.log(`   - Privacy: ${patientReportsBucket.public ? 'Public' : 'Private (✓)'}`);
      console.log(`   - ID: ${patientReportsBucket.id}\n`);

      if (patientReportsBucket.public) {
        console.warn('   ⚠️  WARNING: Bucket is public (should be private for security)\n');
      }
    }

    // Check 3: Storage Permissions
    console.log('🔐 Check 3: Storage Permissions');
    console.log('   Testing read permissions...');

    const { data: files, error: listError } = await supabase.storage
      .from('patient-reports')
      .list('', { limit: 1 });

    if (listError) {
      if (listError.message.includes('not found')) {
        console.error('   ❌ FAILED: Bucket exists but policies not configured');
        console.error('   → Go to Supabase Dashboard → SQL Editor');
        console.error('   → Copy contents of: supabase/single-bucket-policies.sql');
        console.error('   → Paste and click "Run"\n');
        allChecksPass = false;
      } else {
        console.error('   ⚠️  WARNING:', listError.message);
        console.error('   → This might be OK if bucket is empty\n');
      }
    } else {
      console.log('   ✅ PASSED: Can list files in bucket');
      if (files && files.length > 0) {
        console.log(`   - Files found: ${files.length}\n`);
      } else {
        console.log('   - Bucket is empty (ready for uploads)\n');
      }
    }

    // Check 4: All Buckets Summary
    console.log('📋 Check 4: All Buckets in Project');
    console.log('   Current buckets:');
    if (buckets.length === 0) {
      console.log('   (No buckets found)\n');
    } else {
      buckets.forEach(bucket => {
        const isRequired = bucket.name === 'patient-reports';
        const marker = isRequired ? '✅' : '  ';
        const privacy = bucket.public ? 'Public' : 'Private';
        console.log(`   ${marker} ${bucket.name} (${privacy})`);
      });
      console.log('');
    }

    // Final Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL SUMMARY\n');

    if (allChecksPass) {
      console.log('🎉 SUCCESS! Setup is complete!\n');
      console.log('✅ Supabase connected');
      console.log('✅ patient-reports bucket exists');
      console.log('✅ Storage permissions configured\n');
      console.log('🚀 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Login to your app');
      console.log('   3. Try uploading a .edf file');
      console.log('   4. Check Supabase Dashboard → Storage to verify\n');
      return true;
    } else {
      console.log('⚠️  SETUP INCOMPLETE\n');
      console.log('Please fix the issues marked with ❌ above.\n');
      console.log('📚 Documentation:');
      console.log('   - Setup guide: SIMPLE_SINGLE_BUCKET_SETUP.md');
      console.log('   - SQL policies: supabase/single-bucket-policies.sql\n');
      return false;
    }

  } catch (error) {
    console.error('\n❌ Verification failed with error:');
    console.error('   ', error.message);
    console.error('\n🔍 Debug info:');
    console.error('   - Check your .env file');
    console.error('   - Verify Supabase credentials');
    console.error('   - Check internet connection\n');
    return false;
  }
}

// Run verification
verifySetup().then(success => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(success ? 0 : 1);
});
