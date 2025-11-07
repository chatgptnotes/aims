/**
 * Migration script to add contact_person column to clinics table
 * Run this with: node add-contact-person-column.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Starting migration: Add contact_person column to clinics table');

    // Execute the SQL migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add contact_person column to clinics table
        ALTER TABLE clinics
        ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('✅ contact_person column added to clinics table');

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
