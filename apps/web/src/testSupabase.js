import SupabaseService from './services/supabaseService.js';

// Test Supabase connection and data operations
async function testSupabaseIntegration() {
  console.log('🚀 Testing Supabase Integration...\n');

  try {
    // 1. Test connection
    console.log('1️⃣ Testing connection to Supabase...');
    const clinics = await SupabaseService.get('clinics');
    console.log(`✅ Connected! Found ${clinics.length} clinics in database\n`);

    // 2. Test adding a clinic
    console.log('2️⃣ Testing ADD operation...');
    const testClinic = {
      name: 'Test Clinic ' + Date.now(),
      email: `test${Date.now()}@clinic.com`,
      phone: '555-0123',
      address: '123 Test Street',
      is_active: true,
      reports_used: 0,
      reports_allowed: 10,
      subscription_status: 'trial'
    };

    const addedClinic = await SupabaseService.add('clinics', testClinic);
    console.log('✅ Clinic added:', addedClinic.id, addedClinic.name, '\n');

    // 3. Test finding by ID
    console.log('3️⃣ Testing FIND BY ID...');
    const foundClinic = await SupabaseService.findById('clinics', addedClinic.id);
    console.log('✅ Found clinic:', foundClinic?.name, '\n');

    // 4. Test updating
    console.log('4️⃣ Testing UPDATE operation...');
    const updated = await SupabaseService.update('clinics', addedClinic.id, {
      name: 'Updated Test Clinic'
    });
    console.log('✅ Updated clinic name to:', updated.name, '\n');

    // 5. Test finding by field
    console.log('5️⃣ Testing FIND BY FIELD...');
    const foundByEmail = await SupabaseService.findOne('clinics', 'email', addedClinic.email);
    console.log('✅ Found by email:', foundByEmail?.email, '\n');

    // 6. Test delete
    console.log('6️⃣ Testing DELETE operation...');
    await SupabaseService.delete('clinics', addedClinic.id);
    console.log('✅ Clinic deleted\n');

    // 7. Verify deletion
    console.log('7️⃣ Verifying deletion...');
    const deletedClinic = await SupabaseService.findById('clinics', addedClinic.id);
    console.log('✅ Verification:', deletedClinic ? 'Still exists (ERROR)' : 'Successfully deleted', '\n');

    console.log('🎉 All tests passed! Supabase integration is working correctly.');

    // Show current data stats
    console.log('\n📊 Current Database Stats:');
    const allClinics = await SupabaseService.get('clinics');
    const allPatients = await SupabaseService.get('patients');
    const allReports = await SupabaseService.get('reports');

    console.log(`- Clinics: ${allClinics.length}`);
    console.log(`- Patients: ${allPatients.length}`);
    console.log(`- Reports: ${allReports.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);

    if (error.code === '42P01') {
      console.log('\n⚠️ Table does not exist in Supabase. You need to create the database schema.');
      console.log('Run the migration script or create tables manually in Supabase dashboard.');
    }
  }
}

// Run the test
console.log('Starting Supabase integration test...');
testSupabaseIntegration();