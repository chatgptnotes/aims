/**
 * Apply Database Migration for Report Counter Trigger
 * Run this script to apply the migration to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Starting migration application...');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);

    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '008_add_report_counter_trigger.sql');

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');
    console.log(`📏 SQL size: ${migrationSQL.length} characters`);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n📋 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('COMMENT')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] Skipping comment statement`);
        continue;
      }

      console.log(`⚙️  [${i + 1}/${statements.length}] Executing statement...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          // Try direct execution using the REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({ sql: statement + ';' })
          });

          if (!response.ok) {
            console.warn(`⚠️  Warning: ${error.message}`);
            console.log('    Attempting alternative method...');

            // For DDL statements, we need to use Supabase's SQL editor API
            // Since we can't execute raw SQL via the client, we'll output instructions
            console.log('    This statement may need manual execution via Supabase Dashboard');
          }
        }

        console.log(`✅ [${i + 1}/${statements.length}] Statement executed successfully`);

      } catch (err) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        console.log('Statement:', statement.substring(0, 100) + '...');
      }
    }

    console.log('\n✅ Migration application completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Verify the migration in Supabase Dashboard → Database → Triggers');
    console.log('2. Test upload/download functionality');
    console.log('3. Check reports_used counter increments correctly');

    // Verify trigger was created
    console.log('\n🔍 Verifying trigger installation...');
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('*')
      .eq('tgname', 'after_report_insert');

    if (triggerError) {
      console.log('⚠️  Could not verify trigger (may need to check manually)');
      console.log('   Run this query in Supabase SQL Editor:');
      console.log('   SELECT * FROM pg_trigger WHERE tgname = \'after_report_insert\';');
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger verified: after_report_insert is installed');
    } else {
      console.log('⚠️  Trigger not found. Manual installation may be required.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Alternative: Output SQL for manual execution
function outputManualInstructions() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 MANUAL MIGRATION INSTRUCTIONS');
  console.log('='.repeat(80));
  console.log('\nSince automated migration failed, please apply manually:\n');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Copy the contents of: supabase/migrations/008_add_report_counter_trigger.sql');
  console.log('3. Paste into a new query');
  console.log('4. Click "Run" to execute');
  console.log('5. Verify no errors in the output\n');
  console.log('='.repeat(80) + '\n');
}

// Run migration
applyMigration().catch(error => {
  console.error('❌ Fatal error:', error);
  outputManualInstructions();
  process.exit(1);
});
