// File Storage Service for Logo Management
// Handles file uploads with validation, compression, and storage

class FileStorageService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    this.compressionQuality = 0.8;
  }

  /**
   * Validate file before processing
   */
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Compress image if needed
   */
  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions (max 800px width/height)
          const maxDimension = 800;
          let { width, height } = img;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          // Set canvas size
          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            file.type,
            this.compressionQuality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert file to base64 (temporary solution until cloud storage is implemented)
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName, clinicId) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `clinic-${clinicId}-logo-${timestamp}.${extension}`;
  }

  /**
   * Upload logo with validation and compression
   */
  async uploadLogo(file, clinicId, logoType = 'primary') {
    try {
      console.log(`🖼️ Uploading ${logoType} logo for clinic ${clinicId}`);

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Compress if needed
      let processedFile = file;
      if (file.size > 1024 * 1024) { // 1MB
        console.log('📦 Compressing large image...');
        processedFile = await this.compressImage(file);
        console.log(`📦 Compressed from ${file.size} to ${processedFile.size} bytes`);
      }

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(file.name, clinicId);

      // Convert to base64 (in production, this would upload to S3/CDN)
      const base64Data = await this.fileToBase64(processedFile);

      // Create file metadata
      const fileMetadata = {
        id: `logo-${Date.now()}`,
        filename: uniqueFilename,
        originalName: file.name,
        size: processedFile.size,
        type: processedFile.type,
        clinicId,
        logoType,
        uploadedAt: new Date().toISOString(),
        base64Data, // In production, this would be a cloud URL
      };

      console.log('✅ Logo uploaded successfully:', fileMetadata.filename);

      return {
        success: true,
        data: fileMetadata,
        url: base64Data, // Return base64 data as URL for immediate use
      };

    } catch (error) {
      console.error('❌ Logo upload failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload logo'
      };
    }
  }

  /**
   * Delete logo
   */
  async deleteLogo(logoId, clinicId) {
    try {
      console.log(`🗑️ Deleting logo ${logoId} for clinic ${clinicId}`);

      // In production, this would delete from cloud storage
      // For now, we'll just log the deletion

      return {
        success: true,
        message: 'Logo deleted successfully'
      };
    } catch (error) {
      console.error('❌ Logo deletion failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete logo'
      };
    }
  }

  /**
   * Get logo URL by ID
   */
  async getLogoUrl(logoId) {
    try {
      // In production, this would fetch from cloud storage
      // For now, return placeholder or stored base64 data

      return {
        success: true,
        url: null // Would return actual URL in production
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get logo URL'
      };
    }
  }

  /**
   * Validate logo dimensions (for specific requirements)
   */
  validateLogoDimensions(file, minWidth = 100, minHeight = 50) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValid = img.width >= minWidth && img.height >= minHeight;
        resolve({
          isValid,
          dimensions: { width: img.width, height: img.height },
          message: isValid
            ? 'Logo dimensions are valid'
            : `Logo must be at least ${minWidth}x${minHeight} pixels. Current: ${img.width}x${img.height}`
        });
      };
      img.onerror = () => resolve({ isValid: false, message: 'Could not read image dimensions' });
      img.src = URL.createObjectURL(file);
    });
  }
}

// Create and export singleton instance
const fileStorageService = new FileStorageService();
export default fileStorageService;