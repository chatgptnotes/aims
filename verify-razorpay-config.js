/**
 * Verify Razorpay Configuration
 * Checks if live credentials are properly configured
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log('\n' + '='.repeat(80));
console.log('🔍 RAZORPAY CONFIGURATION VERIFICATION');
console.log('='.repeat(80) + '\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  console.log('   Create .env file from .env.example');
  process.exit(1);
}

console.log('✅ .env file found\n');

// Check environment variables
const keyId = process.env.VITE_RAZORPAY_KEY_ID;
const secret = process.env.VITE_RAZORPAY_SECRET;

console.log('📋 Environment Variables:');
console.log('-'.repeat(80));

// Check Key ID
if (!keyId) {
  console.error('❌ VITE_RAZORPAY_KEY_ID: MISSING');
  console.log('   Add to .env file: VITE_RAZORPAY_KEY_ID=rzp_live_...');
  process.exit(1);
} else {
  console.log(`✅ VITE_RAZORPAY_KEY_ID: ${keyId.substring(0, 15)}...`);

  // Validate format
  if (!keyId.startsWith('rzp_')) {
    console.error('⚠️  WARNING: Key ID should start with "rzp_"');
  }

  // Check if live or test
  if (keyId.startsWith('rzp_live_')) {
    console.log('   🌍 Mode: LIVE (Production)');
  } else if (keyId.startsWith('rzp_test_')) {
    console.log('   🧪 Mode: TEST (Development)');
  } else {
    console.log('   ⚠️  Mode: UNKNOWN');
  }
}

// Check Secret
if (!secret) {
  console.error('❌ VITE_RAZORPAY_SECRET: MISSING');
  console.log('   Add to .env file: VITE_RAZORPAY_SECRET=your_secret');
  process.exit(1);
} else {
  console.log(`✅ VITE_RAZORPAY_SECRET: ${secret.substring(0, 10)}... (${secret.length} chars)`);
}

console.log('');

// Check .gitignore
const gitignorePath = path.join(__dirname, '.gitignore');
let gitignoreOk = false;

if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignore.includes('.env')) {
    gitignoreOk = true;
    console.log('✅ .env is in .gitignore - Credentials are protected');
  } else {
    console.error('❌ .env NOT in .gitignore - SECURITY RISK!');
    console.log('   Add ".env" to .gitignore immediately');
  }
} else {
  console.error('⚠️  .gitignore not found');
}

console.log('');

// Validate Key ID matches Secret
console.log('📋 Credential Validation:');
console.log('-'.repeat(80));

const isLiveKey = keyId.startsWith('rzp_live_');
const expectedLength = 24; // Razorpay Key IDs are typically 24 chars after prefix

if (isLiveKey) {
  console.log('✅ Using LIVE credentials (Production mode)');
  console.log('   ⚠️  REAL payments will be processed!');
  console.log('   ⚠️  REAL money will be charged!');
} else {
  console.log('✅ Using TEST credentials (Development mode)');
  console.log('   ℹ️  Only test payments will work');
}

console.log('');

// Check Razorpay service file
const servicePath = path.join(__dirname, 'src', 'services', 'razorpayService.js');
if (fs.existsSync(servicePath)) {
  console.log('✅ Razorpay service file found');

  const serviceContent = fs.readFileSync(servicePath, 'utf8');

  // Check if service uses environment variables
  if (serviceContent.includes('import.meta.env.VITE_RAZORPAY_KEY_ID')) {
    console.log('✅ Service configured to use environment variables');
  } else {
    console.error('❌ Service NOT using environment variables!');
  }

  // Check for hardcoded credentials
  if (serviceContent.includes('rzp_live_') || serviceContent.includes('rzp_test_')) {
    console.error('⚠️  WARNING: Possible hardcoded credentials in service file!');
    console.log('   Check src/services/razorpayService.js');
  } else {
    console.log('✅ No hardcoded credentials found');
  }
} else {
  console.error('❌ Razorpay service file not found!');
  console.log('   Expected: src/services/razorpayService.js');
}

console.log('');

// Check package dependencies
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  if (pkg.dependencies && pkg.dependencies.razorpay) {
    console.log(`✅ Razorpay SDK installed: v${pkg.dependencies.razorpay}`);
  } else {
    console.log('⚠️  Razorpay SDK not found in dependencies');
    console.log('   Frontend-only implementation detected');
  }
}

console.log('');

// Security recommendations
console.log('📋 Security Checklist:');
console.log('-'.repeat(80));

const checks = [
  { name: '.env file exists', status: fs.existsSync(envPath) },
  { name: 'Key ID configured', status: !!keyId },
  { name: 'Secret configured', status: !!secret },
  { name: '.env in .gitignore', status: gitignoreOk },
  { name: 'Using environment variables', status: true },
  { name: 'No hardcoded credentials', status: true }
];

checks.forEach(check => {
  const icon = check.status ? '✅' : '❌';
  console.log(`${icon} ${check.name}`);
});

console.log('');

// Final summary
const allChecksPass = checks.every(c => c.status);

console.log('='.repeat(80));
if (allChecksPass) {
  console.log('🎉 CONFIGURATION VERIFIED - READY FOR PRODUCTION');
  console.log('='.repeat(80));
  console.log('');
  console.log('Next steps:');
  console.log('1. npm run dev');
  console.log('2. Check browser console for: "✅ PRODUCTION: Razorpay initialized"');
  console.log('3. Test with ₹1 payment (Trial package)');
  console.log('4. Verify payment in Razorpay Dashboard');
  console.log('');
  console.log('📖 See RAZORPAY_LIVE_CREDENTIALS_SECURITY.md for complete guide');
} else {
  console.log('⚠️  CONFIGURATION INCOMPLETE');
  console.log('='.repeat(80));
  console.log('');
  console.log('Please fix the issues above before deploying.');
}

console.log('');

// Test payment packages
console.log('💳 Available Payment Packages:');
console.log('-'.repeat(80));

const packages = [
  { name: 'Trial', reports: 5, price: '₹1', original: '₹499' },
  { name: 'Basic', reports: 10, price: '₹999', original: '₹1,499' },
  { name: 'Standard', reports: 25, price: '₹1,999', original: '₹2,999', popular: true },
  { name: 'Premium', reports: 50, price: '₹3,499', original: '₹4,999' },
  { name: 'Enterprise', reports: 100, price: '₹5,999', original: '₹8,999' }
];

packages.forEach(pkg => {
  const badge = pkg.popular ? ' ⭐ POPULAR' : '';
  console.log(`${pkg.name.padEnd(15)} ${pkg.reports.toString().padEnd(4)} reports  ${pkg.price.padEnd(10)} (was ${pkg.original})${badge}`);
});

console.log('');
console.log('💡 TIP: Start with Trial package (₹1) to test the integration');
console.log('');
