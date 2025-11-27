/**
 * Admin Dashboard Verification Script
 *
 * This script verifies that the AdminDashboard component fixes are working correctly.
 * Run this in the browser console while on /admin or /admin/dashboard
 */

console.log('🔍 Starting Admin Dashboard Verification...\n');

// Test 1: Check if AdminDashboard component is mounted
console.log('Test 1: Component Mount Check');
const dashboardElement = document.querySelector('[class*="space-y-6"]');
if (dashboardElement) {
  console.log('✅ AdminDashboard component is mounted');
} else {
  console.log('❌ AdminDashboard component not found');
}

// Test 2: Check for stat cards
console.log('\nTest 2: Stat Cards Check');
const statCards = document.querySelectorAll('[class*="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"] > div');
if (statCards.length >= 4) {
  console.log(`✅ Found ${statCards.length} stat cards`);

  // Check if stat values are displayed
  statCards.forEach((card, index) => {
    const valueElement = card.querySelector('[class*="text-2xl"]');
    if (valueElement) {
      console.log(`  Card ${index + 1}: ${valueElement.textContent}`);
    }
  });
} else {
  console.log(`❌ Expected at least 4 stat cards, found ${statCards.length}`);
}

// Test 3: Check for System Overview section
console.log('\nTest 3: System Overview Check');
const systemOverviewHeading = Array.from(document.querySelectorAll('h3')).find(
  h => h.textContent.includes('System Overview')
);
if (systemOverviewHeading) {
  console.log('✅ System Overview section found');
} else {
  console.log('❌ System Overview section not found');
}

// Test 4: Check for Recent Activities section
console.log('\nTest 4: Recent Activities Check');
const recentActivitiesHeading = Array.from(document.querySelectorAll('h3')).find(
  h => h.textContent.includes('Recent Activities')
);
if (recentActivitiesHeading) {
  console.log('✅ Recent Activities section found');

  // Check if activities are displayed or empty state is shown
  const emptyState = document.querySelector('[class*="text-center py-8"]');
  if (emptyState) {
    console.log('  ℹ️  Empty state displayed (no activities)');
  } else {
    const activities = document.querySelectorAll('[class*="space-y-3"] > div[class*="flex items-start"]');
    console.log(`  📋 ${activities.length} activities displayed`);
  }
} else {
  console.log('❌ Recent Activities section not found');
}

// Test 5: Check for Quick Actions section
console.log('\nTest 5: Quick Actions Check');
const quickActionsHeading = Array.from(document.querySelectorAll('h3')).find(
  h => h.textContent.includes('Quick Actions')
);
if (quickActionsHeading) {
  console.log('✅ Quick Actions section found');

  const quickActionButtons = document.querySelectorAll('[class*="grid grid-cols-2 md:grid-cols-4"] button');
  console.log(`  Found ${quickActionButtons.length} action buttons:`);

  quickActionButtons.forEach((button, index) => {
    const buttonText = button.textContent.trim();
    console.log(`    ${index + 1}. ${buttonText}`);
  });
} else {
  console.log('❌ Quick Actions section not found');
}

// Test 6: Check console for errors
console.log('\nTest 6: Console Error Check');
const originalError = console.error;
let errorCount = 0;
console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  if (errorCount === 0) {
    console.log('✅ No console errors detected in last 2 seconds');
  } else {
    console.log(`⚠️  ${errorCount} console errors detected`);
  }
}, 2000);

// Test 7: Check for loading state
console.log('\nTest 7: Loading State Check');
const loadingIndicator = document.querySelector('[class*="animate-spin"]');
if (loadingIndicator && loadingIndicator.offsetParent !== null) {
  console.log('⏳ Dashboard is currently loading...');
  setTimeout(() => {
    if (loadingIndicator.offsetParent === null) {
      console.log('✅ Loading completed successfully');
    } else {
      console.log('⚠️  Still loading after 3 seconds');
    }
  }, 3000);
} else {
  console.log('✅ Dashboard loaded (no loading indicator visible)');
}

// Test 8: Check for error state
console.log('\nTest 8: Error State Check');
const errorMessage = Array.from(document.querySelectorAll('[class*="bg-red"]')).find(
  el => el.textContent.includes('Error Loading Dashboard') || el.textContent.includes('Failed to load')
);
if (errorMessage) {
  console.log('❌ Error state detected:', errorMessage.textContent.trim());
} else {
  console.log('✅ No error state detected');
}

// Test 9: Verify table name usage
console.log('\nTest 9: Database Table Usage Verification');
console.log('Checking browser console for database load messages...');
console.log('Expected messages:');
console.log('  - SUCCESS: Loaded project areas (clinics): X');
console.log('  - SUCCESS: Loaded supervisors (patients): X');
console.log('  - SUCCESS: Loaded reports: X');
console.log('  - SUCCESS: Loaded payments: X');

// Test 10: Navigation test
console.log('\nTest 10: Navigation Functionality');
console.log('Testing Quick Action buttons...');

const testNavigation = (buttonText, expectedPath) => {
  const button = Array.from(document.querySelectorAll('button')).find(
    btn => btn.textContent.includes(buttonText)
  );

  if (button) {
    console.log(`  Found "${buttonText}" button`);
    button.addEventListener('click', (e) => {
      console.log(`    Clicked "${buttonText}" - Should navigate to ${expectedPath}`);
    }, { once: true });
  } else {
    console.log(`  ❌ "${buttonText}" button not found`);
  }
};

testNavigation('Manage Project Areas', '/admin/clinics');
testNavigation('View P&ID Reports', '/admin/reports');
testNavigation('View Analytics', '/admin/analytics');
testNavigation('Check Alerts', '/admin/alerts');

// Summary
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ = Passed');
  console.log('❌ = Failed');
  console.log('⚠️  = Warning');
  console.log('ℹ️  = Information');
  console.log('='.repeat(60));
  console.log('\nIf all tests passed, the Admin Dashboard is working correctly.');
  console.log('If any tests failed, check the specific error messages above.');
  console.log('\nFor detailed logs, check the browser console for messages with prefixes:');
  console.log('  - SUCCESS: (green) - Operations completed successfully');
  console.log('  - WARNING: (yellow) - Non-critical issues');
  console.log('  - ERROR: (red) - Critical errors');
  console.log('  - DATA: (blue) - Data loading information');
}, 3000);

// Export verification results
window.adminDashboardVerification = {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  currentPath: window.location.pathname,
  tests: {
    componentMounted: !!dashboardElement,
    statCards: statCards.length >= 4,
    systemOverview: !!systemOverviewHeading,
    recentActivities: !!recentActivitiesHeading,
    quickActions: !!quickActionsHeading,
  }
};

console.log('\n📊 Verification results saved to window.adminDashboardVerification');
