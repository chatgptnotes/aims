/**
 * Supabase Storage Setup Verification Script
 * Run this to verify your Supabase Storage configuration
 *
 * Usage: node verify-storage-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Supabase credentials not found in .env file');
  console.error('   Please create a .env file with:');
  console.error('   VITE_SUPABASE_URL=your_supabase_url');
  console.error('   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verifying Supabase Storage Setup...\n');

// Required buckets
const requiredBuckets = [
  { name: 'patient-reports', description: 'Patient EEG reports', required: true },
  { name: 'eeg-files', description: 'Raw EEG data files', required: true },
  { name: 'reports', description: 'Generated PDF/CSV reports', required: true },
  { name: 'clinic-logos', description: 'Clinic branding images', required: false }
];

async function verifyStorageSetup() {
  try {
    // Step 1: Check Supabase connection
    console.log('📡 Step 1: Checking Supabase connection...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Failed to connect to Supabase Storage');
      console.error('   Error:', bucketsError.message);
      console.error('   Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      return false;
    }

    console.log('✅ Connected to Supabase Storage successfully\n');

    // Step 2: Check required buckets
    console.log('📦 Step 2: Checking required buckets...');

    let allBucketsExist = true;

    for (const requiredBucket of requiredBuckets) {
      const bucketExists = buckets.some(b => b.name === requiredBucket.name);

      if (bucketExists) {
        console.log(`✅ Bucket '${requiredBucket.name}' exists - ${requiredBucket.description}`);
      } else {
        if (requiredBucket.required) {
          console.log(`❌ REQUIRED bucket '${requiredBucket.name}' is MISSING - ${requiredBucket.description}`);
          allBucketsExist = false;
        } else {
          console.log(`⚠️  Optional bucket '${requiredBucket.name}' is missing - ${requiredBucket.description}`);
        }
      }
    }

    console.log('');

    // Step 3: Show existing buckets
    console.log('📋 Step 3: All buckets in your Supabase project:');
    if (buckets.length === 0) {
      console.log('   (No buckets found)');
    } else {
      buckets.forEach(bucket => {
        const isRequired = requiredBuckets.find(rb => rb.name === bucket.name);
        const marker = isRequired ? '✅' : '  ';
        console.log(`   ${marker} ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }
    console.log('');

    // Step 4: Test upload capability (without actually uploading)
    console.log('🔐 Step 4: Checking storage permissions...');

    // Try to list files in patient-reports bucket (this will test read permissions)
    if (buckets.some(b => b.name === 'patient-reports')) {
      const { data: files, error: listError } = await supabase.storage
        .from('patient-reports')
        .list('', { limit: 1 });

      if (listError) {
        if (listError.message.includes('not found')) {
          console.log('⚠️  Bucket exists but may need RLS policies configured');
        } else {
          console.log('⚠️  Warning:', listError.message);
        }
      } else {
        console.log('✅ Storage read permissions working');
      }
    }
    console.log('');

    // Final summary
    console.log('📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (allBucketsExist) {
      console.log('✅ All required buckets are configured correctly!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Apply RLS policies from: supabase/storage-policies.sql');
      console.log('2. Test file upload in your application');
      console.log('3. Verify files appear in correct folder structure');
      return true;
    } else {
      console.log('❌ Some required buckets are missing');
      console.log('');
      console.log('To fix this:');
      console.log('1. Go to Supabase Dashboard → Storage');
      console.log('2. Create the missing buckets listed above');
      console.log('3. Run this script again to verify');
      console.log('');
      console.log('Bucket creation guide:');
      requiredBuckets
        .filter(rb => !buckets.some(b => b.name === rb.name))
        .forEach(rb => {
          console.log(`   - ${rb.name}: ${rb.description}`);
        });
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    return false;
  }
}

// Run verification
verifyStorageSetup().then(success => {
  console.log('');
  process.exit(success ? 0 : 1);
});
