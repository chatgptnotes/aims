#!/usr/bin/env node

/**
 * Script to check and fix RLS policies for supervisors table
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

async function fixRLSPolicies() {
  console.log('=== CHECKING RLS POLICIES ===\n');

  // Test direct query without RLS (using service key)
  console.log('Testing direct query with service role key...');
  const { data: supervisors, error: supervisorError } = await supabase
    .from('supervisors')
    .select('*');

  if (supervisorError) {
    console.error('Error:', supervisorError);
  } else {
    console.log(`✓ Found ${supervisors.length} supervisor(s) with service key\n`);
  }

  // Check if RLS is enabled
  console.log('Checking RLS status...');
  const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'supervisors'
    `
  }).catch(() => {
    console.log('Cannot check RLS status with RPC, will use alternative method\n');
    return { data: null, error: null };
  });

  // Try to disable RLS temporarily for testing
  console.log('Attempting to check table structure...');

  const { data: tableInfo } = await supabase
    .from('supervisors')
    .select('id')
    .limit(1);

  console.log('Table query test:', tableInfo ? 'SUCCESS' : 'FAILED');

  // Create a simple SQL migration to fix RLS
  console.log('\n=== CREATING RLS FIX MIGRATION ===\n');

  const rlsFixSQL = `
-- Fix RLS policies for supervisors table
-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow users to view own supervisor record" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to insert supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to update supervisors" ON public.supervisors;
DROP POLICY IF EXISTS "Allow authenticated users to delete supervisors" ON public.supervisors;

-- Disable RLS temporarily to test
ALTER TABLE public.supervisors DISABLE ROW LEVEL SECURITY;

-- Or create very permissive policies for development
-- ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations for authenticated users"
--   ON public.supervisors
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Allow all operations for anon users"
--   ON public.supervisors
--   FOR ALL
--   TO anon
--   USING (true)
--   WITH CHECK (true);
`;

  console.log('SQL to fix RLS policies:');
  console.log('====================================');
  console.log(rlsFixSQL);
  console.log('====================================\n');

  console.log('Copy the SQL above and run it in Supabase SQL Editor');
  console.log('Or save it to a migration file and apply it.');
}

fixRLSPolicies();
