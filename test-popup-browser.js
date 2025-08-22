// Browser Console Test for Subscription Popup
// Copy and paste these functions in browser console when app is running

// Test 1: Trigger popup by simulating report limit reached
function testSubscriptionPopupInBrowser() {
  console.log('🧪 Testing Subscription Popup in Browser...');
  
  // Find and trigger upload modal first
  const uploadButton = document.querySelector('[data-testid="upload-report"], button[class*="upload"], button[class*="Upload"]');
  if (uploadButton) {
    uploadButton.click();
    console.log('✅ Upload modal opened');
    
    // Wait for modal to load then simulate limit check
    setTimeout(() => {
      // Manually trigger the subscription popup
      const event = new CustomEvent('showSubscriptionPopup', {
        detail: { currentUsage: 10, clinicId: 'test-clinic' }
      });
      window.dispatchEvent(event);
      console.log('✅ Subscription popup event dispatched');
    }, 1000);
  } else {
    console.log('❌ Upload button not found');
  }
}

// Test 2: Mock clinic data to be at limit
function mockClinicAtLimit() {
  // Override localStorage or sessionStorage data
  const mockClinic = {
    id: 'test-clinic',
    name: 'Test Clinic',
    reportsUsed: 10,
    reportsAllowed: 10,
    subscriptionPlan: 'trial'
  };
  
  localStorage.setItem('currentClinic', JSON.stringify(mockClinic));
  console.log('✅ Mocked clinic data at report limit');
  console.log('🔄 Refresh page to see effect');
}

// Test 3: Check current clinic status
function checkCurrentClinicStatus() {
  const clinic = JSON.parse(localStorage.getItem('currentClinic') || '{}');
  console.log('📊 Current Clinic Status:');
  console.log(`   Name: ${clinic.name || 'N/A'}`);
  console.log(`   Reports Used: ${clinic.reportsUsed || 0}`);
  console.log(`   Reports Allowed: ${clinic.reportsAllowed || 10}`);
  console.log(`   At Limit: ${(clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) ? 'YES' : 'NO'}`);
  return clinic;
}

// Instructions
console.log(`
🧪 SUBSCRIPTION POPUP TESTING INSTRUCTIONS:

1. Open browser console (F12) 
2. Navigate to clinic dashboard
3. Run these commands:

   // Check current status
   checkCurrentClinicStatus()
   
   // Mock clinic at limit  
   mockClinicAtLimit()
   
   // Test popup trigger
   testSubscriptionPopupInBrowser()

4. Try uploading/downloading reports to see popup
`);

// Export functions to global scope
window.testSubscriptionPopupInBrowser = testSubscriptionPopupInBrowser;
window.mockClinicAtLimit = mockClinicAtLimit;
window.checkCurrentClinicStatus = checkCurrentClinicStatus;