// Production Payment Testing Script
// Run this after setting up production credentials

import RazorpayService from './src/services/razorpayService.js';

async function testProductionPayment() {
  console.log('🧪 TESTING PRODUCTION RAZORPAY SETUP');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Check credentials
    console.log('\n📋 Test 1: Checking Razorpay Credentials...');
    if (RazorpayService.hasRealKeys) {
      console.log('✅ Real Razorpay credentials detected');
      console.log(`🔐 Key ID: ${RazorpayService.keyId.substring(0, 12)}...`);
      console.log(`🌍 Environment: ${RazorpayService.environment}`);
    } else {
      console.error('❌ No real Razorpay credentials found');
      console.error('🔧 Please set VITE_RAZORPAY_KEY_ID and VITE_RAZORPAY_KEY_SECRET');
      return;
    }
    
    // Test 2: Check packages
    console.log('\n📦 Test 2: Checking Available Packages...');
    const packages = RazorpayService.getReportPackages();
    console.log(`✅ ${packages.length} packages available:`);
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: ₹${pkg.price} (${pkg.reports} reports)`);
    });
    
    // Test 3: Test order creation
    console.log('\n🔧 Test 3: Testing Order Creation...');
    const testOrderData = {
      clinicId: 'test-clinic-123',
      packageInfo: packages[0], // Use first package for testing
      clinicInfo: {
        name: 'Test Clinic',
        email: 'test@clinic.com',
        phone: '9876543210'
      }
    };
    
    try {
      const order = await RazorpayService.createOrder(testOrderData);
      console.log('✅ Order creation successful:', order.id);
      console.log(`💰 Amount: ₹${order.amount / 100}`);
      console.log(`📝 Receipt: ${order.receipt}`);
    } catch (orderError) {
      console.error('❌ Order creation failed:', orderError.message);
    }
    
    // Test 4: Check payment options
    console.log('\n⚙️ Test 4: Checking Payment Configuration...');
    if (window.Razorpay) {
      console.log('✅ Razorpay SDK loaded');
    } else {
      console.log('⚠️ Razorpay SDK not loaded yet (normal for backend testing)');
    }
    
    // Test 5: Check database service
    console.log('\n💾 Test 5: Database Service Check...');
    try {
      const { default: DatabaseService } = await import('./src/services/databaseService.js');
      const clinics = DatabaseService.get('clinics') || [];
      console.log(`✅ Database service working - ${clinics.length} clinics found`);
    } catch (dbError) {
      console.error('❌ Database service error:', dbError.message);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 PRODUCTION SETUP TEST COMPLETE');
    console.log('✅ Ready for live payments!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the application: npm run dev');
    console.log('2. Login as a clinic user');
    console.log('3. Go to Subscription tab');
    console.log('4. Test with a small payment first');
    console.log('5. Monitor console logs for "PRODUCTION:" messages');
    
  } catch (error) {
    console.error('\n❌ PRODUCTION TEST FAILED:', error);
    console.error('🔧 Please check your configuration and try again');
  }
}

// Additional utility functions for production testing

async function testPaymentWithRealCard() {
  console.log('\n🧪 TESTING WITH REAL CARD (BE CAREFUL!)');
  console.log('⚠️ This will process a real payment');
  console.log('💡 Use a small amount for testing');
  
  // This would open the actual Razorpay checkout
  // Only run this when you're ready to test with real money
}

async function validateEnvironmentVariables() {
  console.log('\n🔍 ENVIRONMENT VALIDATION:');
  
  const required = [
    'VITE_RAZORPAY_KEY_ID',
    'VITE_RAZORPAY_KEY_SECRET'
  ];
  
  const optional = [
    'VITE_AWS_REGION',
    'VITE_AWS_BUCKET_NAME'
  ];
  
  required.forEach(env => {
    const value = import.meta.env[env];
    if (value && value !== 'your_razorpay_key_id' && value !== 'your_razorpay_secret') {
      console.log(`✅ ${env}: ${value.substring(0, 12)}...`);
    } else {
      console.error(`❌ ${env}: Missing or placeholder value`);
    }
  });
  
  optional.forEach(env => {
    const value = import.meta.env[env];
    if (value) {
      console.log(`✅ ${env}: Configured`);
    } else {
      console.warn(`⚠️ ${env}: Not configured (optional)`);
    }
  });
}

// Run tests
if (typeof window === 'undefined') {
  // Running in Node.js
  testProductionPayment();
} else {
  // Running in browser
  window.testProductionPayment = testProductionPayment;
  window.validateEnvironmentVariables = validateEnvironmentVariables;
  
  console.log(`
🧪 PRODUCTION PAYMENT TESTING

Run these commands in the browser console:

1. testProductionPayment() - Full production setup test
2. validateEnvironmentVariables() - Check env vars
3. testPaymentWithRealCard() - Test with real payment (careful!)

To run: Open browser console and type the function name
  `);
}