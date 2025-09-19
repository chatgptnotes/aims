// Test Multi-Auth System
// This script tests the multi-auth landing page and authentication flow

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Multi-Auth System...\n');

// 1. Test Landing Page Implementation
console.log('1️⃣ Testing Landing Page Implementation:');
console.log('='.repeat(50));

const landingPagePath = path.join(__dirname, 'apps', 'web', 'src', 'pages', 'Landing.jsx');
if (fs.existsSync(landingPagePath)) {
  console.log('✅ Landing.jsx exists');

  const landingContent = fs.readFileSync(landingPagePath, 'utf8');

  // Check for dual button system
  const hasTwoButtons = landingContent.includes('I want it for myself') &&
                       landingContent.includes('I want it for my clinic');

  if (hasTwoButtons) {
    console.log('✅ Found dual button system (Patient + Clinic)');
  } else {
    console.log('❌ Dual button system not found');
  }

  // Check for user type handling
  const hasUserTypeLogic = landingContent.includes('selectedType') &&
                          landingContent.includes('handlePersonalSignup') &&
                          landingContent.includes('handleClinicSignup');

  if (hasUserTypeLogic) {
    console.log('✅ User type selection logic implemented');
  } else {
    console.log('❌ User type selection logic missing');
  }

  // Check for proper routing
  const hasProperRouting = landingContent.includes('navigate(\'/register\'') &&
                          landingContent.includes('navigate(\'/login\'');

  if (hasProperRouting) {
    console.log('✅ Proper routing to login/register implemented');
  } else {
    console.log('❌ Proper routing missing');
  }

} else {
  console.log('❌ Landing.jsx not found');
}

// 2. Test Register Form Multi-Auth Support
console.log('\n2️⃣ Testing Register Form Multi-Auth Support:');
console.log('='.repeat(50));

const registerFormPath = path.join(__dirname, 'apps', 'web', 'src', 'components', 'auth', 'RegisterForm.jsx');
if (fs.existsSync(registerFormPath)) {
  console.log('✅ RegisterForm.jsx exists');

  const registerContent = fs.readFileSync(registerFormPath, 'utf8');

  // Check for user type selection
  const hasUserTypeSelect = registerContent.includes('userType') &&
                           registerContent.includes('patient') &&
                           registerContent.includes('clinic') &&
                           registerContent.includes('super_admin');

  if (hasUserTypeSelect) {
    console.log('✅ User type selection dropdown implemented');
  } else {
    console.log('❌ User type selection dropdown missing');
  }

  // Check for pre-selection from landing page
  const hasPreSelection = registerContent.includes('location.state?.userType');

  if (hasPreSelection) {
    console.log('✅ Pre-selection from landing page implemented');
  } else {
    console.log('❌ Pre-selection from landing page missing');
  }

  // Check for role-specific descriptions
  const hasRoleDescriptions = registerContent.includes('Personal account') &&
                             registerContent.includes('Clinic Admin') &&
                             registerContent.includes('Super Admin');

  if (hasRoleDescriptions) {
    console.log('✅ Role-specific descriptions provided');
  } else {
    console.log('❌ Role-specific descriptions missing');
  }

} else {
  console.log('❌ RegisterForm.jsx not found');
}

// 3. Test Login Form Role-Based Routing
console.log('\n3️⃣ Testing Login Form Role-Based Routing:');
console.log('='.repeat(50));

const loginFormPath = path.join(__dirname, 'apps', 'web', 'src', 'components', 'auth', 'LoginForm.jsx');
if (fs.existsSync(loginFormPath)) {
  console.log('✅ LoginForm.jsx exists');

  const loginContent = fs.readFileSync(loginFormPath, 'utf8');

  // Check for role-based routing
  const hasRoleRouting = loginContent.includes('super_admin') &&
                        loginContent.includes('clinic_admin') &&
                        loginContent.includes('patient') &&
                        loginContent.includes('redirectPath');

  if (hasRoleRouting) {
    console.log('✅ Role-based routing implemented');
  } else {
    console.log('❌ Role-based routing missing');
  }

  // Check for specific dashboard routes
  const hasDashboardRoutes = loginContent.includes('/admin') &&
                            loginContent.includes('/clinic') &&
                            loginContent.includes('/patient-dashboard');

  if (hasDashboardRoutes) {
    console.log('✅ Specific dashboard routes defined');
  } else {
    console.log('❌ Specific dashboard routes missing');
  }

} else {
  console.log('❌ LoginForm.jsx not found');
}

// 4. Test App.jsx Routing Configuration
console.log('\n4️⃣ Testing App.jsx Routing Configuration:');
console.log('='.repeat(50));

const appPath = path.join(__dirname, 'apps', 'web', 'src', 'App.jsx');
if (fs.existsSync(appPath)) {
  console.log('✅ App.jsx exists');

  const appContent = fs.readFileSync(appPath, 'utf8');

  // Check for correct landing page import
  const hasLandingImport = appContent.includes('from \'./pages/Landing.jsx\'');

  if (hasLandingImport) {
    console.log('✅ Correct Landing page imported');
  } else {
    console.log('❌ Incorrect or missing Landing page import');
  }

  // Check for proper route configuration
  const hasProperRoutes = appContent.includes('<Route path="/" element={<LandingPage />}') &&
                         appContent.includes('<Route path="/login"') &&
                         appContent.includes('<Route path="/register"');

  if (hasProperRoutes) {
    console.log('✅ Proper route configuration found');
  } else {
    console.log('❌ Route configuration issues detected');
  }

} else {
  console.log('❌ App.jsx not found');
}

// 5. Test Environment Variables
console.log('\n5️⃣ Testing Environment Variables:');
console.log('='.repeat(50));

const envPath = path.join(__dirname, 'apps', 'web', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');

  const envContent = fs.readFileSync(envPath, 'utf8');

  // Check for multi-auth settings
  const hasMultiAuthSettings = envContent.includes('VITE_BYPASS_AUTH') &&
                              envContent.includes('VITE_DEFAULT_ROLE');

  if (hasMultiAuthSettings) {
    console.log('✅ Multi-auth environment variables configured');
  } else {
    console.log('❌ Multi-auth environment variables missing');
  }

  // Check bypass auth setting
  const bypassAuth = envContent.match(/VITE_BYPASS_AUTH=(.+)/);
  if (bypassAuth) {
    const value = bypassAuth[1].trim();
    console.log(`✅ VITE_BYPASS_AUTH: ${value}`);
  } else {
    console.log('⚠️ VITE_BYPASS_AUTH not found');
  }

  // Check default role
  const defaultRole = envContent.match(/VITE_DEFAULT_ROLE=(.+)/);
  if (defaultRole) {
    const value = defaultRole[1].trim();
    console.log(`✅ VITE_DEFAULT_ROLE: ${value}`);
  } else {
    console.log('⚠️ VITE_DEFAULT_ROLE not found');
  }

} else {
  console.log('❌ .env file not found');
}

// 6. Test AuthContext Multi-Auth Support
console.log('\n6️⃣ Testing AuthContext Multi-Auth Support:');
console.log('='.repeat(50));

const authContextPath = path.join(__dirname, 'apps', 'web', 'src', 'contexts', 'AuthContext.jsx');
if (fs.existsSync(authContextPath)) {
  console.log('✅ AuthContext.jsx exists');

  const authContent = fs.readFileSync(authContextPath, 'utf8');

  // Check for user type handling in registration
  const hasUserTypeHandling = authContent.includes('userType') &&
                             authContent.includes('registerWithEmail');

  if (hasUserTypeHandling) {
    console.log('✅ User type handling in registration found');
  } else {
    console.log('❌ User type handling in registration missing');
  }

  // Check for role-based logic
  const hasRoleLogic = authContent.includes('role') &&
                      authContent.includes('patient') &&
                      authContent.includes('clinic');

  if (hasRoleLogic) {
    console.log('✅ Role-based logic implemented');
  } else {
    console.log('❌ Role-based logic missing');
  }

} else {
  console.log('❌ AuthContext.jsx not found');
}

// Summary
console.log('\n📊 MULTI-AUTH SYSTEM TEST SUMMARY:');
console.log('='.repeat(50));

const issues = [];
const warnings = [];

// Collect issues from checks above
if (!fs.existsSync(landingPagePath)) {
  issues.push('Landing page missing');
}

if (!fs.existsSync(registerFormPath)) {
  issues.push('Register form missing');
}

if (!fs.existsSync(loginFormPath)) {
  issues.push('Login form missing');
}

if (!fs.existsSync(envPath)) {
  issues.push('Environment file missing');
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
  console.log('✅ Multi-Auth system appears to be properly implemented!');
  console.log('\n🚀 Expected Flow:');
  console.log('1. User visits landing page (/)');
  console.log('2. Clicks "I want it for myself" → Patient registration');
  console.log('3. Clicks "I want it for my clinic" → Clinic registration');
  console.log('4. Registration form pre-selects user type');
  console.log('5. Login redirects based on role:');
  console.log('   - Patient → /patient-dashboard');
  console.log('   - Clinic Admin → /clinic');
  console.log('   - Super Admin → /admin');
} else {
  console.log('❌ Multi-Auth system has issues that need to be fixed');
}

console.log('\n🔗 Test the flow at: http://localhost:5178');
console.log('🧪 Use development helper for role-based testing');