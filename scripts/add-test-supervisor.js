#!/usr/bin/env node

/**
 * Script to add test supervisor to the database
 * Run: node scripts/add-test-supervisor.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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
    // Step 1: Create or get test project area
    console.log('Step 1: Checking for test project area...');
    let { data: existingProject, error: projectCheckError } = await supabase
      .from('project_areas')
      .select('id, name, code')
      .eq('code', 'TEST-PROJECT-001')
      .single();

    let projectAreaId;

    if (projectCheckError && projectCheckError.code === 'PGRST116') {
      // Project doesn't exist, create it
      console.log('Creating new test project area...');
      const { data: newProject, error: createProjectError } = await supabase
        .from('project_areas')
        .insert({
          name: 'Test Project Area',
          code: 'TEST-PROJECT-001',
          description: 'Test project area for development and testing purposes',
          location: 'Dubai, UAE',
          facility_type: 'Test Facility',
          region: 'Middle East',
          country: 'UAE',
          primary_engineer_name: 'Test Engineer',
          primary_engineer_email: 'engineer@test.com',
          industry_type: 'Testing & Development',
          status: 'active',
          subscription_type: 'enterprise',
          max_supervisors: 100,
          max_pid_uploads_per_month: 1000,
          is_active: true
        })
        .select()
        .single();

      if (createProjectError) {
        throw new Error(`Failed to create project area: ${createProjectError.message}`);
      }

      projectAreaId = newProject.id;
      console.log(`✓ Created test project area: ${newProject.name} (${projectAreaId})\n`);
    } else if (existingProject) {
      projectAreaId = existingProject.id;
      console.log(`✓ Test project area already exists: ${existingProject.name} (${projectAreaId})\n`);
    } else {
      throw new Error(`Failed to check project area: ${projectCheckError.message}`);
    }

    // Step 2: Create test user in auth.users
    console.log('Step 2: Creating test user...');
    const testEmail = 'test.supervisor@aims-system.com';

    // Check if user exists
    const { data: existingUser, error: userCheckError } = await supabase.auth.admin.listUsers();

    const userExists = existingUser?.users?.find(u => u.email === testEmail);
    let userId;

    if (userExists) {
      userId = userExists.id;
      console.log(`✓ Test user already exists: ${testEmail} (${userId})\n`);
    } else {
      // Create new user
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        email_confirm: true,
        user_metadata: {
          name: 'Test Supervisor',
          role: 'supervisor'
        }
      });

      if (createUserError) {
        throw new Error(`Failed to create user: ${createUserError.message}`);
      }

      userId = newUser.user.id;
      console.log(`✓ Created test user: ${testEmail} (${userId})\n`);
    }

    // Step 3: Create test supervisor
    console.log('Step 3: Checking for test supervisor...');
    const { data: existingSupervisor, error: supervisorCheckError } = await supabase
      .from('supervisors')
      .select('id, first_name, last_name, email')
      .eq('email', testEmail)
      .single();

    if (supervisorCheckError && supervisorCheckError.code === 'PGRST116') {
      // Supervisor doesn't exist, create it
      console.log('Creating new test supervisor...');
      const { data: newSupervisor, error: createSupervisorError } = await supabase
        .from('supervisors')
        .insert({
          user_id: userId,
          project_area_id: projectAreaId,
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

      if (createSupervisorError) {
        throw new Error(`Failed to create supervisor: ${createSupervisorError.message}`);
      }

      console.log(`✓ Created test supervisor: ${newSupervisor.first_name} ${newSupervisor.last_name} (${newSupervisor.id})\n`);
    } else if (existingSupervisor) {
      console.log(`✓ Test supervisor already exists: ${existingSupervisor.first_name} ${existingSupervisor.last_name}\n`);
    } else {
      throw new Error(`Failed to check supervisor: ${supervisorCheckError.message}`);
    }

    // Step 4: Create user role
    console.log('Step 4: Setting user role...');
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'supervisor')
      .single();

    if (roleCheckError && roleCheckError.code === 'PGRST116') {
      const { error: createRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'supervisor'
        });

      if (createRoleError) {
        console.log(`⚠ Warning: Failed to create user role: ${createRoleError.message}`);
      } else {
        console.log('✓ Created user role for test supervisor\n');
      }
    } else if (existingRole) {
      console.log('✓ User role already exists\n');
    }

    console.log('========================================');
    console.log('TEST SUPERVISOR CREATED SUCCESSFULLY!');
    console.log('========================================');
    console.log('');
    console.log('Login Credentials:');
    console.log(`  Email: ${testEmail}`);
    console.log('  Password: TestPass123!');
    console.log('');
    console.log('You can now use this supervisor in the upload form.');
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

// Run the script
addTestSupervisor();
