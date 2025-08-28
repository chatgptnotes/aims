// Script to permanently remove all clinics and prevent demo data recreation
console.log('🧹 PERMANENTLY REMOVING ALL CLINICS...');

// Step 1: Clear all clinic data from localStorage
localStorage.removeItem('clinics');
localStorage.setItem('clinics', '[]');

// Step 2: Also clear any backup or cached data
localStorage.removeItem('clinics_backup');
localStorage.removeItem('clinics_cache');

// Step 3: Set a flag to prevent demo data recreation
localStorage.setItem('demo_data_disabled', 'true');
localStorage.setItem('no_demo_clinics', 'true');

console.log('✅ All clinics removed from localStorage');
console.log('✅ Demo data prevention flags set');
console.log('✅ Page will now show empty clinic list');

// Step 4: Reload the page to see the changes
console.log('🔄 Reloading page in 2 seconds...');
setTimeout(() => {
  window.location.reload();
}, 2000);
