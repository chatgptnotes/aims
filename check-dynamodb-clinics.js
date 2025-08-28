// Script to check what clinics are stored in DynamoDB
console.log('🔍 CHECKING DYNAMODB FOR CLINICS...');

// Function to check DynamoDB clinics
async function checkDynamoDBClinics() {
  try {
    console.log('📊 Checking DynamoDB for clinics...');
    
    // Import DynamoService
    const DynamoService = await import('./src/services/dynamoService.js');
    
    // Check if DynamoDB is available
    if (DynamoService.default.isAvailable()) {
      console.log('✅ DynamoDB is available');
      
      // Test connection
      try {
        await DynamoService.default.testConnection();
        console.log('✅ DynamoDB connection successful');
        
        // Get clinics from DynamoDB
        const clinics = await DynamoService.default.get('clinics');
        console.log(`📊 Found ${clinics.length} clinics in DynamoDB`);
        
        if (clinics.length > 0) {
          clinics.forEach((clinic, index) => {
            console.log(`🔍 Clinic ${index + 1}:`, {
              name: clinic.name,
              email: clinic.email,
              id: clinic.id,
              isActive: clinic.isActive,
              isActivated: clinic.isActivated,
              subscriptionStatus: clinic.subscriptionStatus
            });
          });
        } else {
          console.log('📭 No clinics found in DynamoDB');
        }
        
      } catch (connectionError) {
        console.error('❌ DynamoDB connection failed:', connectionError);
      }
    } else {
      console.log('❌ DynamoDB is not available');
    }
    
  } catch (error) {
    console.error('❌ Error checking DynamoDB:', error);
  }
}

// Also check localStorage for comparison
function checkLocalStorageClinics() {
  try {
    console.log('💾 Checking localStorage for clinics...');
    const data = localStorage.getItem('clinics');
    const clinics = data ? JSON.parse(data) : [];
    console.log(`📊 Found ${clinics.length} clinics in localStorage`);
    
    if (clinics.length > 0) {
      clinics.forEach((clinic, index) => {
        console.log(`🔍 localStorage Clinic ${index + 1}:`, {
          name: clinic.name,
          email: clinic.email,
          id: clinic.id,
          isActive: clinic.isActive
        });
      });
    } else {
      console.log('📭 No clinics found in localStorage');
    }
  } catch (error) {
    console.error('❌ Error checking localStorage:', error);
  }
}

// Run both checks
checkLocalStorageClinics();
checkDynamoDBClinics();
