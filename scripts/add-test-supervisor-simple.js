#!/usr/bin/env node

/**
 * Simple script to add test supervisor to the database
 * Works with VITE_BYPASS_AUTH=true mode
 * Run: node scripts/add-test-supervisor-simple.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addTestSupervisor() {
  console.log('Starting test supervisor creation...\n');

  try {
    // Step 1: Get test project area
    console.log('Step 1: Getting test project area...');
    const { data: project, error: projectError } = await supabase
      .from('project_areas')
      .select('id, name, code')
      .eq('code', 'TEST-PROJECT-001')
      .single();

    if (projectError) {
      throw new Error(`Failed to get project area: ${projectError.message}`);
    }

    console.log(`✓ Found test project area: ${project.name} (${project.id})\n`);

    // Step 2: Use a dummy UUID for user_id (since we're bypassing auth)
    const dummyUserId = '00000000-0000-0000-0000-000000000099';
    console.log('Step 2: Using dummy user_id for development mode...\n');

    // Step 3: Create or update test supervisor
    console.log('Step 3: Creating test supervisor...');
    const testEmail = 'test.supervisor@aims-system.com';

    // Check if supervisor exists
    const { data: existingSupervisor } = await supabase
      .from('supervisors')
      .select('id, first_name, last_name, email, employee_id')
      .eq('employee_id', 'EMP-TEST-001')
      .single();

    if (existingSupervisor) {
      console.log(`✓ Test supervisor already exists: ${existingSupervisor.first_name} ${existingSupervisor.last_name}`);
      console.log(`  ID: ${existingSupervisor.id}`);
      console.log(`  Employee ID: ${existingSupervisor.employee_id}`);
      console.log(`  Email: ${existingSupervisor.email}\n`);
    } else {
      // Create new supervisor
      const { data: newSupervisor, error: createError } = await supabase
        .from('supervisors')
        .insert({
          user_id: dummyUserId,
          project_area_id: project.id,
          first_name: 'Test',
          last_name: 'Supervisor',
          email: testEmail,
          phone: '+971-50-123-4567',
          employee_id: 'EMP-TEST-001',
          safety_rating: 'green',
          clearance_level: 'standard',
          emergency_contact_name: 'Emergency Contact',
          emergency_contact_phone: '+971-50-999-9999',
          department: 'Operations',
          shift_schedule: 'Day Shift (7AM-3PM)',
          work_location: 'Test Facility - Main Building',
          certifications: ['Safety Level 1', 'P&ID Reading', 'Asset Management'],
          assigned_units: ['Unit 100', 'Unit 200', 'Utilities'],
          specialization: 'P&ID Management',
          notes: 'Test supervisor account for development and testing',
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create supervisor: ${createError.message}`);
      }

      console.log(`✓ Created test supervisor: ${newSupervisor.first_name} ${newSupervisor.last_name}`);
      console.log(`  ID: ${newSupervisor.id}`);
      console.log(`  Employee ID: ${newSupervisor.employee_id}`);
      console.log(`  Email: ${newSupervisor.email}\n`);
    }

    // Verify by fetching all supervisors in the test project
    console.log('Step 4: Verifying supervisors in test project...');
    const { data: allSupervisors, error: fetchError } = await supabase
      .from('supervisors')
      .select('id, first_name, last_name, email, employee_id, project_area_id')
      .eq('project_area_id', project.id);

    if (fetchError) {
      console.log(`⚠ Warning: Could not fetch supervisors: ${fetchError.message}`);
    } else {
      console.log(`✓ Found ${allSupervisors.length} supervisor(s) in ${project.name}:\n`);
      allSupervisors.forEach((sup, idx) => {
        console.log(`  ${idx + 1}. ${sup.first_name} ${sup.last_name}`);
        console.log(`     Employee ID: ${sup.employee_id}`);
        console.log(`     Email: ${sup.email}`);
        console.log(`     ID: ${sup.id}\n`);
      });
    }

    console.log('========================================');
    console.log('TEST SUPERVISOR READY!');
    console.log('========================================');
    console.log('');
    console.log('Supervisor Details:');
    console.log(`  Name: Test Supervisor`);
    console.log(`  Employee ID: EMP-TEST-001`);
    console.log(`  Email: ${testEmail}`);
    console.log(`  Project: ${project.name} (${project.code})`);
    console.log('');
    console.log('You can now:');
    console.log('  1. Select "Test Project Area" in the upload form');
    console.log('  2. Select "Test Supervisor" from the supervisor dropdown');
    console.log('  3. Upload P&ID documents for testing');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the script
addTestSupervisor();
