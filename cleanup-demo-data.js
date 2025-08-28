// Cleanup script to remove demo clinic data
console.log('🧹 Starting cleanup of demo clinic data...');

// Get current clinic data from localStorage
const clinicsData = JSON.parse(localStorage.getItem('clinics') || '[]');
console.log('📋 Current clinics:', clinicsData.length);

// Show all current clinics
console.log('Current clinic data:');
clinicsData.forEach((clinic, index) => {
  console.log(`${index + 1}. ${clinic.name} - ${clinic.email} (ID: ${clinic.id})`);
});

// Remove demo/test clinics
const realClinics = clinicsData.filter(clinic => {
  const isDemo = clinic.name.toLowerCase().includes('demo') || 
                 clinic.name.toLowerCase().includes('test') ||
                 clinic.email.toLowerCase().includes('demo') ||
                 clinic.email === 'clinic@demo.com';
  
  if (isDemo) {
    console.log(`🗑️ Removing demo clinic: ${clinic.name} - ${clinic.email}`);
    return false;
  }
  
  return true;
});

// Update localStorage with cleaned data
localStorage.setItem('clinics', JSON.stringify(realClinics));

console.log(`✅ Cleanup complete! Removed ${clinicsData.length - realClinics.length} demo clinics.`);
console.log(`📊 Remaining clinics: ${realClinics.length}`);

// Show remaining clinics
console.log('Remaining clinic data:');
realClinics.forEach((clinic, index) => {
  console.log(`${index + 1}. ${clinic.name} - ${clinic.email} (ID: ${clinic.id})`);
});