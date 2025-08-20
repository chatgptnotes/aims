// Comprehensive Error Debug Script
// Copy and paste this entire script into browser console (F12)

console.clear();
console.log('🚨 EMERGENCY DEBUG - Starting comprehensive error check...');
console.log('=' * 60);

// 1. Check current page and URL
console.log('1. PAGE INFO:');
console.log('   URL:', window.location.href);
console.log('   Page title:', document.title);
console.log('   User agent:', navigator.userAgent.substring(0, 100));

// 2. Check localStorage data
console.log('\n2. LOCALSTORAGE DATA:');
try {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  const clinics = JSON.parse(localStorage.getItem('clinics') || '[]');
  const reports = JSON.parse(localStorage.getItem('reports') || '[]');
  const demoUser = localStorage.getItem('demoUser');
  const demoToken = localStorage.getItem('demoToken');
  
  console.log('   Patients:', patients.length);
  console.log('   Clinics:', clinics.length);
  console.log('   Reports:', reports.length);
  console.log('   Has demo user:', !!demoUser);
  console.log('   Has demo token:', !!demoToken);
  
  if (demoUser) {
    const user = JSON.parse(demoUser);
    console.log('   User role:', user.role);
    console.log('   User name:', user.name);
  }
} catch (error) {
  console.error('   ❌ Error reading localStorage:', error);
}

// 3. Capture console errors
console.log('\n3. ERROR MONITORING:');
const capturedErrors = [];
const capturedWarnings = [];

const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  capturedErrors.push(args.join(' '));
  originalError.apply(console, args);
};

console.warn = function(...args) {
  capturedWarnings.push(args.join(' '));
  originalWarn.apply(console, args);
};

// 4. Check DOM elements
console.log('\n4. DOM ELEMENTS:');
const errorMessages = document.querySelectorAll('.text-red-500, .text-red-600, .error, [class*="error"]');
const loadingElements = document.querySelectorAll('.animate-spin, .loading, [class*="loading"]');
const modals = document.querySelectorAll('.fixed.inset-0, [class*="modal"]');

console.log('   Error elements found:', errorMessages.length);
console.log('   Loading elements found:', loadingElements.length);
console.log('   Modals found:', modals.length);

if (errorMessages.length > 0) {
  console.log('   Error messages:');
  errorMessages.forEach((el, i) => {
    console.log(`     ${i + 1}:`, el.textContent.trim());
  });
}

// 5. Check React components
console.log('\n5. REACT COMPONENTS:');
const reactRoot = document.getElementById('root');
if (reactRoot) {
  console.log('   React root found:', !!reactRoot);
  console.log('   Root has content:', reactRoot.children.length > 0);
  
  // Check for "Something went wrong" text
  const errorText = document.body.textContent || '';
  if (errorText.includes('Something went wrong')) {
    console.log('   🚨 "Something went wrong" detected on page');
  }
  if (errorText.includes('Try Again')) {
    console.log('   🔄 "Try Again" button detected');
  }
} else {
  console.log('   ❌ React root not found');
}

// 6. Check network requests
console.log('\n6. NETWORK CHECK:');
if (navigator.onLine) {
  console.log('   Network status: Online');
} else {
  console.log('   ❌ Network status: Offline');
}

// 7. Wait and show captured errors
setTimeout(() => {
  console.log('\n7. CAPTURED ERRORS & WARNINGS:');
  
  if (capturedErrors.length > 0) {
    console.log('   🚨 ERRORS:');
    capturedErrors.forEach((error, i) => {
      console.log(`     ${i + 1}:`, error);
    });
  } else {
    console.log('   ✅ No errors captured');
  }
  
  if (capturedWarnings.length > 0) {
    console.log('   ⚠️ WARNINGS:');
    capturedWarnings.forEach((warning, i) => {
      console.log(`     ${i + 1}:`, warning);
    });
  } else {
    console.log('   ✅ No warnings captured');
  }
  
  console.log('\n' + '=' * 60);
  console.log('🚨 DEBUG COMPLETE - Please share this output');
  console.log('=' * 60);
  
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
}, 5000);

console.log('\n⏱️ Monitoring for 5 seconds...');
console.log('Please interact with the page to trigger any errors.');