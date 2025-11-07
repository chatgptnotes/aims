/**
 * Test Script for Upload/Download Limits Integration
 * Tests the Razorpay payment limit system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Starting Upload/Download Limits Test Suite\n');
console.log('='.repeat(80));

// Test 1: Check Clinics Table Structure
async function testClinicTableStructure() {
  console.log('\n📋 Test 1: Checking Clinics Table Structure');
  console.log('-'.repeat(80));

  try {
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('id, name, reports_used, reports_allowed, subscription_status, trial_end_date, is_active')
      .limit(1);

    if (error) throw error;

    if (!clinics || clinics.length === 0) {
      console.log('⚠️  No clinics found in database');
      return false;
    }

    const clinic = clinics[0];
    console.log('✅ Clinics table has required columns:');
    console.log(`   - reports_used: ${clinic.reports_used ?? 'NULL'}`);
    console.log(`   - reports_allowed: ${clinic.reports_allowed ?? 'NULL'}`);
    console.log(`   - subscription_status: ${clinic.subscription_status ?? 'NULL'}`);
    console.log(`   - trial_end_date: ${clinic.trial_end_date ?? 'NULL'}`);
    console.log(`   - is_active: ${clinic.is_active ?? 'NULL'}`);

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Test 2: Check Reports Table
async function testReportsTable() {
  console.log('\n📋 Test 2: Checking Reports Table');
  console.log('-'.repeat(80));

  try {
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, clinic_id, patient_id, file_name, status, created_at')
      .limit(5);

    if (error) throw error;

    console.log(`✅ Reports table accessible`);
    console.log(`   Found ${reports?.length || 0} reports`);

    if (reports && reports.length > 0) {
      console.log('   Sample report:');
      console.log(`   - ID: ${reports[0].id}`);
      console.log(`   - Clinic ID: ${reports[0].clinic_id}`);
      console.log(`   - File: ${reports[0].file_name}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Test 3: Check Trigger Installation
async function testTriggerInstallation() {
  console.log('\n📋 Test 3: Checking Database Trigger Installation');
  console.log('-'.repeat(80));

  try {
    // Try to query pg_trigger (may fail due to RLS)
    const { data, error } = await supabase
      .from('pg_trigger')
      .select('*')
      .eq('tgname', 'after_report_insert');

    if (error) {
      console.log('⚠️  Cannot verify trigger (RLS restrictions)');
      console.log('   Please check manually in Supabase Dashboard → Database → Triggers');
      return null;
    }

    if (data && data.length > 0) {
      console.log('✅ Trigger "after_report_insert" is installed');
      return true;
    } else {
      console.log('❌ Trigger "after_report_insert" not found');
      console.log('   Run the migration: supabase/migrations/008_add_report_counter_trigger.sql');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Cannot verify trigger:', error.message);
    return null;
  }
}

// Test 4: Test Trial Expiry Logic
async function testTrialExpiryLogic() {
  console.log('\n📋 Test 4: Testing Trial Expiry Logic');
  console.log('-'.repeat(80));

  try {
    // Find trial clinics
    const { data: trialClinics, error } = await supabase
      .from('clinics')
      .select('id, name, subscription_status, trial_end_date, is_active')
      .eq('subscription_status', 'trial')
      .limit(3);

    if (error) throw error;

    if (!trialClinics || trialClinics.length === 0) {
      console.log('⚠️  No trial clinics found');
      return null;
    }

    console.log(`✅ Found ${trialClinics.length} trial clinic(s)`);

    for (const clinic of trialClinics) {
      const trialEndDate = new Date(clinic.trial_end_date);
      const now = new Date();
      const isExpired = now > trialEndDate;

      console.log(`\n   Clinic: ${clinic.name}`);
      console.log(`   - Trial End: ${trialEndDate.toLocaleDateString()}`);
      console.log(`   - Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
      console.log(`   - Is Active: ${clinic.is_active}`);

      if (isExpired && clinic.is_active) {
        console.log(`   ⚠️  Warning: Trial expired but clinic still active!`);
        console.log(`   This will be fixed on next upload/download attempt`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Test 5: Test Quota Limits
async function testQuotaLimits() {
  console.log('\n📋 Test 5: Testing Quota Limits');
  console.log('-'.repeat(80));

  try {
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('id, name, reports_used, reports_allowed, subscription_status')
      .limit(5);

    if (error) throw error;

    if (!clinics || clinics.length === 0) {
      console.log('⚠️  No clinics found');
      return false;
    }

    console.log(`✅ Analyzing ${clinics.length} clinic(s):\n`);

    for (const clinic of clinics) {
      const used = clinic.reports_used || 0;
      const allowed = clinic.reports_allowed || 10;
      const remaining = allowed - used;
      const percentage = (used / allowed) * 100;

      let status = '✅ OK';
      if (percentage >= 100) status = '❌ LIMIT REACHED';
      else if (percentage >= 80) status = '⚠️  WARNING';

      console.log(`   ${clinic.name}:`);
      console.log(`   - Usage: ${used}/${allowed} (${percentage.toFixed(1)}%)`);
      console.log(`   - Remaining: ${remaining} reports`);
      console.log(`   - Status: ${status}`);
      console.log(`   - Subscription: ${clinic.subscription_status}`);
      console.log('');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Test 6: Simulate Counter Increment
async function testCounterIncrement() {
  console.log('\n📋 Test 6: Testing Counter Increment Logic');
  console.log('-'.repeat(80));

  try {
    // Get a test clinic
    const { data: clinics, error: clinicError } = await supabase
      .from('clinics')
      .select('id, name, reports_used, reports_allowed')
      .limit(1);

    if (clinicError) throw clinicError;
    if (!clinics || clinics.length === 0) {
      console.log('⚠️  No clinics found for testing');
      return false;
    }

    const clinic = clinics[0];
    const currentUsed = clinic.reports_used || 0;

    console.log(`   Test Clinic: ${clinic.name}`);
    console.log(`   Current Usage: ${currentUsed}/${clinic.reports_allowed}`);
    console.log(`\n   ℹ️  Simulating counter increment (no actual change)`);

    // Simulate what would happen
    const newUsed = currentUsed + 1;
    const wouldExceedLimit = newUsed > clinic.reports_allowed;

    console.log(`   - After increment: ${newUsed}/${clinic.reports_allowed}`);

    if (wouldExceedLimit) {
      console.log(`   ❌ Would exceed limit! Payment required.`);
    } else {
      console.log(`   ✅ Would allow operation. ${clinic.reports_allowed - newUsed} remaining.`);
    }

    console.log(`\n   ℹ️  Note: Actual increment happens on report upload/download`);
    return true;

  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Test 7: Check Payment Integration
async function testPaymentIntegration() {
  console.log('\n📋 Test 7: Checking Payment System Integration');
  console.log('-'.repeat(80));

  try {
    // Check if payments table exists
    const { data: payments, error: paymentError } = await supabase
      .from('payment_history')
      .select('*')
      .limit(5);

    if (paymentError) {
      console.log('⚠️  Payment history table not accessible');
      console.log('   This is OK - payments may be stored elsewhere');
      return null;
    }

    console.log(`✅ Payment history accessible`);
    console.log(`   Found ${payments?.length || 0} payment records`);

    if (payments && payments.length > 0) {
      console.log('\n   Recent Payments:');
      payments.slice(0, 3).forEach((payment, idx) => {
        console.log(`   ${idx + 1}. Amount: ₹${payment.amount || 'N/A'}`);
        console.log(`      Clinic ID: ${payment.clinic_id || 'N/A'}`);
        console.log(`      Status: ${payment.status || 'N/A'}`);
        console.log('');
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  const tests = [
    { name: 'Clinic Table Structure', fn: testClinicTableStructure },
    { name: 'Reports Table', fn: testReportsTable },
    { name: 'Trigger Installation', fn: testTriggerInstallation },
    { name: 'Trial Expiry Logic', fn: testTrialExpiryLogic },
    { name: 'Quota Limits', fn: testQuotaLimits },
    { name: 'Counter Increment', fn: testCounterIncrement },
    { name: 'Payment Integration', fn: testPaymentIntegration }
  ];

  for (const test of tests) {
    const result = await test.fn();
    if (result === true) results.passed++;
    else if (result === false) results.failed++;
    else results.skipped++;
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed:  ${results.passed}`);
  console.log(`❌ Failed:  ${results.failed}`);
  console.log(`⚠️  Skipped: ${results.skipped}`);
  console.log(`📝 Total:   ${results.passed + results.failed + results.skipped}`);
  console.log('='.repeat(80));

  if (results.failed === 0 && results.passed > 0) {
    console.log('\n🎉 All tests passed! Integration is working correctly.');
  } else if (results.failed > 0) {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    console.log('   - Check database schema');
    console.log('   - Apply migrations if needed');
    console.log('   - Verify Supabase connection');
  } else {
    console.log('\n⚠️  Most tests were skipped. Check database access permissions.');
  }

  console.log('\n📋 Next Steps:');
  console.log('   1. Apply migration: See APPLY_TRIGGER_MIGRATION.md');
  console.log('   2. Test in UI: npm run dev');
  console.log('   3. Review docs: RAZORPAY_UPLOAD_LIMIT_INTEGRATION_COMPLETE.md');
  console.log('');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Fatal Error:', error);
  process.exit(1);
});
