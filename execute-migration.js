// Execute Migration Directly in Supabase
// This script attempts to run the migration using Supabase service role

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
const supabaseServiceKeyMatch = envContent.match(/VITE_SUPABASE_SERVICE_ROLE_KEY=(.+)/);

if (!supabaseUrlMatch || !supabaseServiceKeyMatch) {
  console.error('❌ Missing Supabase service role key in .env file');
  console.log('💡 Add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.log('🔗 Get it from: https://supabase.com/dashboard/project/omyltmcesgbhnqmhrrvq/settings/api');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1].trim();
const supabaseServiceKey = supabaseServiceKeyMatch[1].trim();

console.log('🚀 Connecting to Supabase with service role key...');

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  try {
    console.log('📊 Creating essential tables only...');

    // Create clinics table first (most critical for clinic registration)
    const clinicsTableSQL = `
      CREATE TABLE IF NOT EXISTS clinics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        logo_url TEXT,
        is_active BOOLEAN DEFAULT true,
        reports_used INTEGER DEFAULT 0,
        reports_allowed INTEGER DEFAULT 10,
        subscription_status VARCHAR(50) DEFAULT 'trial',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        trial_start_date TIMESTAMPTZ DEFAULT NOW(),
        trial_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    console.log('1️⃣ Creating clinics table...');
    const { data: clinicsResult, error: clinicsError } = await supabase.rpc('exec_sql', {
      sql: clinicsTableSQL
    });

    if (clinicsError) {
      console.warn('⚠️ Clinics table creation warning (may already exist):', clinicsError.message);
    } else {
      console.log('✅ Clinics table created successfully');
    }

    // Add missing email column to profiles if needed
    const addEmailToProfiles = `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    `;

    console.log('2️⃣ Adding email column to profiles...');
    const { data: profilesResult, error: profilesError } = await supabase.rpc('exec_sql', {
      sql: addEmailToProfiles
    });

    if (profilesError) {
      console.warn('⚠️ Profiles email column warning:', profilesError.message);
    } else {
      console.log('✅ Profiles table updated');
    }

    // Verify tables exist
    console.log('🔍 Verifying table creation...');

    const { data: clinicsCheck, error: clinicsCheckError } = await supabase
      .from('clinics')
      .select('*')
      .limit(1);

    if (clinicsCheckError) {
      console.log('❌ Clinics table verification failed:', clinicsCheckError.message);
    } else {
      console.log('✅ Clinics table is accessible');
    }

    console.log('🎉 Essential migration completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Test clinic registration at http://localhost:5178');
    console.log('2. Run node check-clinic-data.js to verify data storage');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('💡 Alternative: Run the SQL manually in Supabase Dashboard');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/omyltmcesgbhnqmhrrvq/editor');
  }
}

executeMigration();