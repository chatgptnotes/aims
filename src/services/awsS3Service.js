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
      // Check if we have AWS credentials
      if (!this.accessKeyId || !this.secretAccessKey || this.accessKeyId === 'demo_access_key') {
        console.warn('⚠️ AWS credentials not configured - using mock S3 service');
        this.useMockService = true;
        return;
      }

      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId,
          secretAccessKey: this.secretAccessKey,
        },
      });

      console.log('✅ AWS S3 client initialized successfully');
      this.useMockService = false;
    } catch (error) {
      console.error('❌ Error initializing AWS S3 client:', error);
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

      // Generate unique file name with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueFileName = `${timestamp}_${fileName}`;
      const key = `reports/${uniqueFileName}`;

      // Prepare upload parameters
      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: file.type || 'application/pdf',
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
          ...metadata
        },
        // Set appropriate permissions
        ACL: 'private', // Files are private by default
      };

      // Upload file to S3
      const command = new PutObjectCommand(uploadParams);
      const response = await this.s3Client.send(command);

      console.log('✅ File uploaded successfully to S3');

      // Return file information
      return {
        success: true,
        fileName: uniqueFileName,
        key: key,
        bucket: this.bucketName,
        region: this.region,
        uploadedAt: new Date().toISOString(),
        size: file.size,
        type: file.type,
        etag: response.ETag,
        url: await this.getSignedUrl(key) // Get initial signed URL
      };

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
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create mock file data
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueFileName = `${timestamp}_${fileName}`;
    const key = `reports/${uniqueFileName}`;

    // Store file in localStorage for demo (convert to base64)
    const reader = new FileReader();
    const fileData = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
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
      throw new Error('File size exceeds 50MB limit');
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