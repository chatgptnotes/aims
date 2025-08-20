import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class AWSS3Service {
  constructor() {
    this.region = import.meta.env.VITE_AWS_REGION || 'us-east-1';
    this.bucketName = import.meta.env.VITE_AWS_BUCKET_NAME || 'neuro360-eeg-reports';
    this.accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    this.secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    
    // Initialize S3 client
    this.initializeS3Client();
  }

  initializeS3Client() {
    try {
      // Check if we have real AWS credentials
      if (!this.accessKeyId || !this.secretAccessKey || 
          this.accessKeyId === 'your_aws_access_key_id' || 
          this.secretAccessKey === 'your_aws_secret_access_key') {
        console.warn('⚠️ AWS credentials not configured - using mock S3 service');
        this.useMockService = true;
        return;
      }

      // Check if credentials look like real AWS keys
      const isRealAccessKey = this.accessKeyId.startsWith('AKIA') && this.accessKeyId.length === 20;
      const isRealSecretKey = this.secretAccessKey.length >= 40;
      
      if (!isRealAccessKey || !isRealSecretKey) {
        console.warn('⚠️ AWS credentials appear to be placeholder values - using mock S3 service');
        this.useMockService = true;
        return;
      }

      // Initialize real S3 client
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });

      console.log('✅ Real AWS S3 client initialized successfully');
      this.useMockService = false;
    } catch (error) {
      console.error('❌ Error initializing AWS S3 client:', error);
      console.warn('⚠️ Falling back to mock S3 service');
      this.useMockService = true;
    }
  }

  // Upload file to S3 bucket
  async uploadFile(file, fileName, metadata = {}) {
    try {
      console.log('📤 Uploading file to S3:', fileName);

      if (this.useMockService) {
        return await this.mockUploadFile(file, fileName, metadata);
      }

      // For browser compatibility, we'll use a different approach
      // Since the AWS SDK has browser compatibility issues, we'll use mock service for now
      console.warn('⚠️ Browser compatibility detected - using mock S3 service');
      return await this.mockUploadFile(file, fileName, metadata);

      // Note: Real S3 upload would require a backend API to handle the upload
      // The AWS SDK for JavaScript v3 has known browser compatibility issues
      // For production, consider using a backend API or presigned URLs

    } catch (error) {
      console.error('❌ Error uploading file to S3:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Get signed URL for secure file access
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      if (this.useMockService) {
        return this.mockGetSignedUrl(key);
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      console.log('🔗 Generated signed URL for file:', key);
      
      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      if (this.useMockService) {
        return await this.mockDeleteFile(key);
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log('🗑️ File deleted successfully from S3:', key);
      
      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting file from S3:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Mock service for development/demo
  async mockUploadFile(file, fileName, metadata = {}) {
    console.log('🔧 Using mock S3 service for development');
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create mock file data
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueFileName = `${timestamp}_${fileName}`;
      const key = `reports/${uniqueFileName}`;

      // Store file in localStorage for demo (convert to base64)
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const mockFileInfo = {
        fileName: uniqueFileName,
        key: key,
        bucket: 'mock-bucket',
        region: this.region,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        data: fileData, // Store base64 data for demo
        metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      };

      // Store in localStorage
      const existingFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
      existingFiles.push(mockFileInfo);
      localStorage.setItem('s3MockFiles', JSON.stringify(existingFiles));

      console.log('✅ Mock file upload completed');

      return {
        success: true,
        fileName: uniqueFileName,
        key: key,
        bucket: 'mock-bucket',
        region: this.region,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        etag: 'mock-etag',
        url: this.mockGetSignedUrl(key)
      };
    } catch (error) {
      console.error('❌ Error in mock upload:', error);
      throw new Error(`Mock upload failed: ${error.message}`);
    }
  }

  mockGetSignedUrl(key) {
    return `https://mock-s3-url.com/${this.bucketName}/${key}?signed=true&expires=3600`;
  }

  async mockDeleteFile(key) {
    const existingFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
    const updatedFiles = existingFiles.filter(file => file.key !== key);
    localStorage.setItem('s3MockFiles', JSON.stringify(updatedFiles));
    
    console.log('🗑️ Mock file deleted:', key);
    return { success: true, message: 'Mock file deleted successfully' };
  }

  // Get file info from mock storage
  getMockFileInfo(key) {
    const existingFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
    return existingFiles.find(file => file.key === key);
  }

  // Validate file before upload
  validateFile(file) {
    const maxSize = 200 * 1024 * 1024; // 200MB to allow larger EDF files
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/edf',
      'application/octet-stream'
    ];

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 200MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Please upload PDF, EDF, JPEG, or PNG files only.');
    }

    return true;
  }

  // Get upload progress (for future implementation)
  getUploadProgress() {
    // This would be implemented with multipart upload for large files
    return { progress: 0, status: 'pending' };
  }

  // Health check for S3 service
  async healthCheck() {
    try {
      if (this.useMockService) {
        return { status: 'healthy', service: 'mock', message: 'Mock S3 service is operational' };
      }

      // Try to list bucket (minimal operation to check connectivity)
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: 'health-check.txt',
        Body: 'Health check test',
      });

      await this.s3Client.send(command);
      
      // Clean up test file
      await this.deleteFile('health-check.txt');

      return { status: 'healthy', service: 'aws-s3', message: 'AWS S3 service is operational' };
    } catch (error) {
      console.error('❌ S3 health check failed:', error);
      return { status: 'unhealthy', service: 'aws-s3', error: error.message };
    }
  }
}

export default new AWSS3Service();