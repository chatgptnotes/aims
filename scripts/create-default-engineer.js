#!/usr/bin/env node

/**
 * Script to create a default engineer for report uploads
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

async function createDefaultEngineer() {
  console.log('=== CREATING DEFAULT ENGINEER ===\n');

  try {
    // Check if any engineers exist
    const { data: existingEngineers, error: checkError } = await supabase
      .from('engineers')
      .select('id, first_name, last_name, email')
      .limit(5);

    if (checkError) {
      console.error('Error checking engineers:', checkError);
      return;
    }

    console.log(`Found ${existingEngineers.length} existing engineer(s):`);
    existingEngineers.forEach(eng => {
      console.log(`  - ${eng.first_name} ${eng.last_name} (${eng.email})`);
    });
    console.log('');

    // Check if default engineer already exists
    const defaultEngineerId = '00000000-0000-0000-0000-000000000001';
    const { data: defaultEngineer, error: defaultCheckError } = await supabase
      .from('engineers')
      .select('*')
      .eq('id', defaultEngineerId)
      .single();

    if (defaultEngineer) {
      console.log('✓ Default engineer already exists');
      console.log(`  ID: ${defaultEngineer.id}`);
      console.log(`  Name: ${defaultEngineer.first_name} ${defaultEngineer.last_name}`);
      return;
    }

    // Create default engineer
    console.log('Creating default engineer...');
    const { data: newEngineer, error: createError } = await supabase
      .from('engineers')
      .insert({
        id: defaultEngineerId,
        user_id: defaultEngineerId, // Use same ID for user
        first_name: 'System',
        last_name: 'Engineer',
        email: 'system.engineer@aims-system.com',
        employee_id: 'ENG-SYSTEM-001',
        department: 'System Administration',
        specialization: 'System Operations',
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating engineer:', createError);

      // Alternative: Use the first existing engineer
      if (existingEngineers.length > 0) {
        console.log('\n✓ Will use existing engineer:', existingEngineers[0].id);
        console.log('Update your databaseService.js to use this ID as default:');
        console.log(`const defaultEngineerId = '${existingEngineers[0].id}';`);
      }
      return;
    }

    console.log('\n✓ Created default engineer successfully');
    console.log(`  ID: ${newEngineer.id}`);
    console.log(`  Name: ${newEngineer.first_name} ${newEngineer.last_name}`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

createDefaultEngineer();
