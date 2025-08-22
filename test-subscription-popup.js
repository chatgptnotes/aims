// Test Subscription Popup by manipulating database directly
import DatabaseService from './src/services/databaseService.js';

async function testSubscriptionPopup() {
  try {
    console.log('🧪 Testing Subscription Popup...');
    
    // Get clinics
    const clinics = await DatabaseService.get('clinics') || [];
    console.log(`Found ${clinics.length} clinics`);
    
    if (clinics.length === 0) {
      console.log('❌ No clinics found. Please create a clinic first.');
      return;
    }
    
    // Use first clinic for testing
    const testClinic = clinics[0];
    console.log(`Testing with clinic: ${testClinic.name} (ID: ${testClinic.id})`);
    
    // Method 1: Set reportsUsed to 10 (at limit)
    console.log('\n📊 Setting clinic to report limit...');
    const updatedClinic = {
      ...testClinic,
      reportsUsed: 10,
      reportsAllowed: 10
    };
    
    // Update clinic in database
    const updatedClinics = clinics.map(c => 
      c.id === testClinic.id ? updatedClinic : c
    );
    await DatabaseService.set('clinics', updatedClinics);
    
    console.log('✅ Clinic updated:');
    console.log(`   Reports Used: ${updatedClinic.reportsUsed}`);
    console.log(`   Reports Allowed: ${updatedClinic.reportsAllowed}`);
    console.log(`   Status: ${updatedClinic.reportsUsed >= updatedClinic.reportsAllowed ? 'AT LIMIT' : 'WITHIN LIMIT'}`);
    
    console.log('\n🎯 Test Results:');
    console.log('✅ Clinic is now at report limit (10/10)');
    console.log('✅ Next upload attempt should trigger subscription popup');
    console.log('✅ Next download attempt should trigger subscription popup');
    
    console.log('\n📝 To test:');
    console.log('1. Login as clinic user');
    console.log('2. Try to upload a new report');
    console.log('3. Subscription popup should appear');
    console.log('4. Try to download an existing report');
    console.log('5. Subscription popup should appear');
    
    // Method 2: Set to approaching limit (8/10)
    console.log('\n⚠️  Setting clinic to approaching limit...');
    updatedClinic.reportsUsed = 8;
    const clinicsApproaching = clinics.map(c => 
      c.id === testClinic.id ? updatedClinic : c
    );
    await DatabaseService.set('clinics', clinicsApproaching);
    
    console.log('✅ Clinic updated for approaching limit test:');
    console.log(`   Reports Used: 8`);
    console.log(`   Reports Remaining: 2`);
    console.log('✅ Should show warning message (not popup yet)');
    
  } catch (error) {
    console.error('❌ Error testing subscription popup:', error);
  }
}

// Reset clinic back to normal
async function resetClinicReports(clinicId = null) {
  try {
    const clinics = await DatabaseService.get('clinics') || [];
    const targetClinic = clinicId ? 
      clinics.find(c => c.id === clinicId) : 
      clinics[0];
    
    if (!targetClinic) {
      console.log('❌ Clinic not found');
      return;
    }
    
    targetClinic.reportsUsed = 0;
    targetClinic.reportsAllowed = 10;
    
    const updatedClinics = clinics.map(c => 
      c.id === targetClinic.id ? targetClinic : c
    );
    await DatabaseService.set('clinics', updatedClinics);
    
    console.log(`✅ Reset clinic ${targetClinic.name} to 0/10 reports`);
  } catch (error) {
    console.error('❌ Error resetting clinic:', error);
  }
}

// Run test
testSubscriptionPopup();

// Uncomment to reset after testing:
// resetClinicReports();