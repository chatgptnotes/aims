// Run Supabase Migration Script
// This script will apply the migration to Supabase database

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
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1].trim();
const supabaseServiceKey = supabaseKeyMatch[1].trim();

console.log('🚀 Connecting to Supabase...');
console.log('📍 URL:', supabaseUrl);

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('📄 Reading migration file...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Executing migration...');

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 60)}...`);

          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });

          if (error) {
            console.warn(`⚠️ Statement ${i + 1} warning:`, error.message);
            // Continue with next statement even if this one fails (might be due to already existing)
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️ Statement ${i + 1} error:`, err.message);
          // Continue with next statement
        }
      }
    }

    console.log('🎉 Migration completed!');

    // Verify tables exist
    console.log('\n🔍 Verifying tables...');
    const tablesToCheck = ['profiles', 'organizations', 'clinics', 'patients', 'eeg_reports', 'subscriptions'];

    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Ready`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Alternative approach: Use SQL editor approach
async function runMigrationDirect() {
  try {
    console.log('📄 Reading migration file...');

    // Read the migration SQL
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Migration SQL prepared. Please run this in Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));

    console.log('\n🔗 Instructions:');
    console.log('1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0]);
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the SQL above');
    console.log('5. Run the query');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('🚀 Starting Supabase Migration...\n');

// Try direct execution first, fallback to manual instructions
runMigrationDirect();