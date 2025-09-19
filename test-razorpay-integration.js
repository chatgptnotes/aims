// Test Razorpay Integration
// This script tests the Razorpay configuration and integration

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Razorpay Integration...\n');

// 1. Test Environment Variables
console.log('1️⃣ Testing Environment Variables:');
console.log('='.repeat(40));

// Read environment file
const envPath = path.join(__dirname, 'apps', 'web', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env file found');

  const razorpayKeyMatch = envContent.match(/VITE_RAZORPAY_KEY_ID=(.+)/);
  const razorpaySecretMatch = envContent.match(/VITE_RAZORPAY_SECRET=(.+)/);

  if (razorpayKeyMatch) {
    const keyId = razorpayKeyMatch[1].trim();
    console.log(`✅ VITE_RAZORPAY_KEY_ID: ${keyId.substring(0, 12)}...`);

    // Validate key format
    if (keyId.startsWith('rzp_live_') || keyId.startsWith('rzp_test_')) {
      console.log('✅ Key format is valid (Razorpay format)');
    } else {
      console.log('❌ Key format is invalid - should start with rzp_live_ or rzp_test_');
    }
  } else {
    console.log('❌ VITE_RAZORPAY_KEY_ID not found');
  }

  if (razorpaySecretMatch) {
    const secret = razorpaySecretMatch[1].trim();
    if (secret && secret !== 'your_razorpay_secret') {
      console.log('✅ VITE_RAZORPAY_SECRET: SET (not default placeholder)');
    } else {
      console.log('⚠️ VITE_RAZORPAY_SECRET: Using placeholder value');
    }
  } else {
    console.log('❌ VITE_RAZORPAY_SECRET not found');
  }
} else {
  console.log('❌ .env file not found');
}

console.log('\n2️⃣ Testing Service Files:');
console.log('='.repeat(40));

// Check if RazorpayService exists
const razorpayServicePath = path.join(__dirname, 'apps', 'web', 'src', 'services', 'razorpayService.js');
if (fs.existsSync(razorpayServicePath)) {
  console.log('✅ razorpayService.js exists');

  const serviceContent = fs.readFileSync(razorpayServicePath, 'utf8');

  // Check for key methods
  const methods = [
    'createOrder',
    'processPayment',
    'handlePaymentSuccess',
    'handlePaymentFailure',
    'getReportPackages'
  ];

  methods.forEach(method => {
    if (serviceContent.includes(method)) {
      console.log(`✅ ${method} method found`);
    } else {
      console.log(`❌ ${method} method missing`);
    }
  });

  // Check for Razorpay SDK loading
  if (serviceContent.includes('checkout.razorpay.com/v1/checkout.js')) {
    console.log('✅ Razorpay SDK loading found');
  } else {
    console.log('❌ Razorpay SDK loading not found');
  }

} else {
  console.log('❌ razorpayService.js not found');
}

console.log('\n3️⃣ Testing Component Files:');
console.log('='.repeat(40));

// Check if payment components exist
const paymentComponents = [
  'SimpleRazorpayCheckout.jsx',
  'PaymentSuccessModal.jsx'
];

paymentComponents.forEach(componentName => {
  const componentPath = path.join(__dirname, 'apps', 'web', 'src', 'components', 'payment', componentName);
  if (fs.existsSync(componentPath)) {
    console.log(`✅ ${componentName} exists`);
  } else {
    console.log(`❌ ${componentName} missing`);
  }
});

console.log('\n4️⃣ Testing Package Dependencies:');
console.log('='.repeat(40));

// Check package.json for required dependencies
const packageJsonPath = path.join(__dirname, 'apps', 'web', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageData = JSON.parse(packageContent);

  const requiredDeps = ['react-hot-toast', 'lucide-react'];

  requiredDeps.forEach(dep => {
    if (packageData.dependencies && packageData.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageData.dependencies[dep]}`);
    } else if (packageData.devDependencies && packageData.devDependencies[dep]) {
      console.log(`✅ ${dep}: ${packageData.devDependencies[dep]} (dev)`);
    } else {
      console.log(`❌ ${dep}: Not found`);
    }
  });
} else {
  console.log('❌ package.json not found');
}

console.log('\n5️⃣ Integration Test Summary:');
console.log('='.repeat(40));

// Summary
const issues = [];
const warnings = [];

// Check environment
if (!fs.existsSync(envPath)) {
  issues.push('Environment file missing');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('VITE_RAZORPAY_KEY_ID=rzp_')) {
    issues.push('Invalid or missing Razorpay key');
  }
  if (envContent.includes('your_razorpay_secret')) {
    warnings.push('Using placeholder Razorpay secret');
  }
}

// Check service
if (!fs.existsSync(razorpayServicePath)) {
  issues.push('RazorpayService missing');
}

console.log(`📊 Issues found: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(issue => console.log(`❌ ${issue}`));
}

console.log(`⚠️ Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  warnings.forEach(warning => console.log(`⚠️ ${warning}`));
}

if (issues.length === 0) {
  console.log('✅ Razorpay integration appears to be properly configured!');
  console.log('\n🚀 Next Steps:');
  console.log('1. Update VITE_RAZORPAY_SECRET with real secret key');
  console.log('2. Test payment flow in the application');
  console.log('3. Verify webhook configuration (if using backend)');
} else {
  console.log('❌ Razorpay integration has issues that need to be fixed');
}

console.log('\n🔗 Useful Links:');
console.log('- Razorpay Dashboard: https://dashboard.razorpay.com/');
console.log('- Integration Docs: https://razorpay.com/docs/');
console.log('- Test Cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/');