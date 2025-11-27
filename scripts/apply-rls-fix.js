#!/usr/bin/env node

/**
 * Script to apply RLS fix for supervisors table
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function applyRLSFix() {
  console.log('=== APPLYING RLS FIX FOR SUPERVISORS TABLE ===\n');

  try {
    // First, check current state
    console.log('Step 1: Checking current supervisors...');
    const { data: beforeData, error: beforeError } = await supabase
      .from('supervisors')
      .select('id, first_name, last_name, email, project_area_id');

    if (beforeError) {
      console.log('Warning: Could not fetch supervisors (might be RLS issue):', beforeError.message);
    } else {
      console.log(`✓ Currently can access ${beforeData.length} supervisor(s)\n`);
    }

    // Apply the fix by executing raw SQL
    console.log('Step 2: Disabling RLS on supervisors table...');

    // We need to use the Supabase management API or direct SQL execution
    // Since we can't execute raw SQL directly from the client, we'll use a workaround

    // Method 1: Try using rpc if available
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;'
    }).catch(err => {
      console.log('RPC not available, will try alternative method\n');
      return { data: null, error: err };
    });

    if (rpcError) {
      console.log('Note: Could not disable RLS via RPC. Manual intervention needed.\n');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('==========================================');
      console.log('ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;');
      console.log('==========================================\n');
    } else {
      console.log('✓ RLS disabled successfully\n');
    }

    // Verify the fix
    console.log('Step 3: Verifying access to supervisors...');
    const { data: afterData, error: afterError } = await supabase
      .from('supervisors')
      .select('id, first_name, last_name, email, project_area_id');

    if (afterError) {
      console.error('Error: Still cannot access supervisors:', afterError.message);
      console.log('\nManual Fix Required:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Run: ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log(`✓ Successfully can access ${afterData.length} supervisor(s)\n`);

      if (afterData.length > 0) {
        console.log('Supervisors found:');
        afterData.forEach(sup => {
          console.log(`  - ${sup.first_name} ${sup.last_name} (${sup.email})`);
          console.log(`    Project Area ID: ${sup.project_area_id}`);
        });
      } else {
        console.log('Warning: Table is accessible but empty. Run add-test-supervisor-simple.js');
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\nManual Fix Required:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run: ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;');
  }
}

applyRLSFix();
