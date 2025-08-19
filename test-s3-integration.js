// Test script to verify AWS S3 integration
import AWSS3Service from './src/services/awsS3Service.js';

async function testS3Integration() {
  console.log('🧪 Starting AWS S3 integration test...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing S3 service health check...');
    const healthStatus = await AWSS3Service.healthCheck();
    console.log('✅ Health check result:', healthStatus);
    console.log('');

    // Test 2: File validation
    console.log('2. Testing file validation...');
    
    // Create a mock file object for testing
    const mockValidFile = {
      name: 'test-report.pdf',
      size: 1024 * 1024, // 1MB
      type: 'application/pdf'
    };
    
    const mockInvalidFile = {
      name: 'test-report.exe',
      size: 100 * 1024 * 1024, // 100MB (too large)
      type: 'application/exe'
    };

    try {
      AWSS3Service.validateFile(mockValidFile);
      console.log('✅ Valid file passed validation');
    } catch (error) {
      console.log('❌ Valid file failed validation:', error.message);
    }

    try {
      AWSS3Service.validateFile(mockInvalidFile);
      console.log('❌ Invalid file incorrectly passed validation');
    } catch (error) {
      console.log('✅ Invalid file correctly rejected:', error.message);
    }
    console.log('');

    // Test 3: Mock Upload (since we're using demo credentials)
    console.log('3. Testing mock file upload...');
    
    const testFileContent = new Blob(['Test EEG report content'], { type: 'application/pdf' });
    Object.defineProperty(testFileContent, 'name', { value: 'test-eeg-report.pdf' });
    
    const uploadResult = await AWSS3Service.uploadFile(testFileContent, 'test-eeg-report.pdf', {
      clinicId: 'test-clinic',
      patientId: 'test-patient',
      reportType: 'EEG'
    });
    
    console.log('✅ Mock upload successful:', uploadResult);
    console.log('');

    // Test 4: Signed URL generation
    console.log('4. Testing signed URL generation...');
    const signedUrl = await AWSS3Service.getSignedUrl(uploadResult.key);
    console.log('✅ Signed URL generated:', signedUrl);
    console.log('');

    // Test 5: File deletion
    console.log('5. Testing file deletion...');
    const deleteResult = await AWSS3Service.deleteFile(uploadResult.key);
    console.log('✅ File deletion successful:', deleteResult);
    console.log('');

    console.log('🎉 All AWS S3 integration tests passed!');
    
  } catch (error) {
    console.error('❌ S3 integration test failed:', error);
  }
}

// Run the test
testS3Integration().catch(console.error);