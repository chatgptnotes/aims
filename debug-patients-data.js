// Debugging script to check patient data inconsistency
// Open browser console and paste this script to see what's happening

console.log('=== PATIENT DATA DEBUG ANALYSIS ===');

// Check localStorage data
const patients = JSON.parse(localStorage.getItem('patients') || '[]');
const reports = JSON.parse(localStorage.getItem('reports') || '[]');

console.log('📋 Raw localStorage patients:', patients.length);
console.table(patients.map(p => ({
  id: p.id?.substring(0, 8),
  name: p.name,
  clinicId: p.clinicId,
  clinicIdType: typeof p.clinicId,
  createdAt: p.createdAt?.substring(0, 10)
})));

console.log('📊 Raw localStorage reports:', reports.length);
console.table(reports.map(r => ({
  id: r.id?.substring(0, 8),
  patientId: r.patientId?.substring(0, 8),
  clinicId: r.clinicId,
  clinicIdType: typeof r.clinicId,
  fileName: r.fileName
})));

// Check current user data
const authData = JSON.parse(localStorage.getItem('user') || '{}');
console.log('👤 Current user:', {
  name: authData.name,
  clinicId: authData.clinicId,
  clinicIdType: typeof authData.clinicId,
  role: authData.role
});

// Find patients by clinic ID (both strict and loose)
const userClinicId = authData.clinicId;
const strictMatch = patients.filter(p => p.clinicId === userClinicId);
const looseMatch = patients.filter(p => p.clinicId == userClinicId);

console.log('🔍 Patient filtering results:');
console.log('Strict match (===):', strictMatch.length, strictMatch.map(p => p.name));
console.log('Loose match (==):', looseMatch.length, looseMatch.map(p => p.name));

// Check for clinic ID mismatches
const uniqueClinicIds = [...new Set(patients.map(p => p.clinicId))];
console.log('🏥 Unique clinic IDs found:', uniqueClinicIds.map(id => ({ id, type: typeof id })));

// Check reports association
reports.forEach(report => {
  const patient = patients.find(p => p.id === report.patientId);
  if (!patient) {
    console.warn('⚠️ Report without patient:', report.fileName, 'patientId:', report.patientId);
  }
});

// Additional debugging commands
console.log('\n=== DEBUGGING COMMANDS ===');
console.log('Run these in console:');
console.log('1. window.debugPatients() - Full analysis');
console.log('2. window.clearPatientsCache() - Clear all cache');
console.log('3. window.showPatientsRaw() - Show raw data');

window.debugPatients = function() {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.table(patients.map(p => ({
    name: p.name,
    clinicId: p.clinicId,
    matches: p.clinicId === user.clinicId,
    strictType: typeof p.clinicId,
    userType: typeof user.clinicId
  })));
};

window.clearPatientsCache = function() {
  localStorage.removeItem('dbCache_patients');
  localStorage.removeItem('dbCache_reports');
  console.log('✅ Cache cleared. Refresh page.');
};

window.showPatientsRaw = function() {
  console.log('Raw patients:', localStorage.getItem('patients'));
  console.log('Raw user:', localStorage.getItem('user'));
};

console.log('=== END DEBUG ANALYSIS ===');