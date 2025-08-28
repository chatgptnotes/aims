// Script to add test clinics for testing data loading
console.log('🧪 Adding test clinics to localStorage...');

// Sample clinic data
const testClinics = [
  {
    id: 'clinic-1',
    name: 'Test Clinic 1',
    email: 'test1@clinic.com',
    contactPerson: 'Dr. Test One',
    phone: '+1234567890',
    address: '123 Test Street, Test City',
    isActive: true,
    isActivated: true,
    subscriptionStatus: 'trial',
    reportsUsed: 5,
    reportsAllowed: 10,
    createdAt: new Date().toISOString(),
    registrationMethod: 'test_created'
  },
  {
    id: 'clinic-2', 
    name: 'Test Clinic 2',
    email: 'test2@clinic.com',
    contactPerson: 'Dr. Test Two',
    phone: '+0987654321',
    address: '456 Test Avenue, Test Town',
    isActive: true,
    isActivated: true,
    subscriptionStatus: 'basic',
    reportsUsed: 8,
    reportsAllowed: 50,
    createdAt: new Date().toISOString(),
    registrationMethod: 'test_created'
  }
];

// Save to localStorage
localStorage.setItem('clinics', JSON.stringify(testClinics));

console.log('✅ Test clinics added to localStorage:');
testClinics.forEach((clinic, index) => {
  console.log(`${index + 1}. ${clinic.name} (${clinic.email})`);
});

console.log('🔄 Refreshing page in 2 seconds...');
setTimeout(() => {
  window.location.reload();
}, 2000);
