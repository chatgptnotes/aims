#!/usr/bin/env node

/**
 * Script to check and create storage bucket
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.VITE_SUPABASE_STORAGE_BUCKET || 'pid-documents';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAndCreateBucket() {
  console.log('=== CHECKING STORAGE BUCKET ===\n');
  console.log(`Bucket name from .env: ${bucketName}\n`);

  try {
    // List all buckets
    console.log('Step 1: Listing all existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    console.log(`Found ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    console.log('');

    // Check if our bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);

    if (bucketExists) {
      console.log(`✓ Bucket "${bucketName}" already exists\n`);

      // Test file upload
      console.log('Step 2: Testing file upload...');
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = 'This is a test file';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFileName, testContent, {
          contentType: 'text/plain'
        });

      if (uploadError) {
        console.error('Error uploading test file:', uploadError);
      } else {
        console.log(`✓ Test file uploaded successfully: ${testFileName}\n`);

        // Clean up test file
        await supabase.storage.from(bucketName).remove([testFileName]);
        console.log('✓ Test file cleaned up\n');
      }
    } else {
      console.log(`⚠ Bucket "${bucketName}" does NOT exist\n`);
      console.log('Step 2: Creating bucket...');

      const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Private bucket for security
        fileSizeLimit: 104857600, // 100MB
        allowedMimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        console.log('\nManual Fix Required:');
        console.log('1. Go to Supabase Dashboard > Storage');
        console.log(`2. Create a new bucket named: ${bucketName}`);
        console.log('3. Set it as PRIVATE (not public)');
        console.log('4. Set file size limit to 100MB');
      } else {
        console.log(`✓ Bucket "${bucketName}" created successfully!\n`);
      }
    }

    // Check bucket policies
    console.log('Step 3: Checking bucket policies...');
    const { data: policies, error: policiesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1 });

    if (policiesError) {
      console.log('Warning: Bucket access might need policies configured');
      console.log('Error:', policiesError.message);
      console.log('\nYou may need to set up RLS policies for storage bucket.');
      console.log('Go to Supabase Dashboard > Storage > Policies');
    } else {
      console.log('✓ Bucket is accessible\n');
    }

    console.log('========================================');
    console.log('STORAGE BUCKET STATUS');
    console.log('========================================');
    console.log(`Bucket: ${bucketName}`);
    console.log(`Status: ${bucketExists ? 'EXISTS' : 'CREATED'}`);
    console.log('Ready for file uploads');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

checkAndCreateBucket();
