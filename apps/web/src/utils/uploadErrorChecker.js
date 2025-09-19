// Upload Error Checker Utility
export const checkUploadRequirements = (clinicId, patient, user, file) => {
  const errors = [];
  
  // Check required parameters
  if (!clinicId) {
    errors.push('Clinic ID is missing');
  }
  
  if (!patient) {
    errors.push('Patient object is missing');
  } else if (!patient.id) {
    errors.push('Patient ID is missing');
  }
  
  if (!user) {
    errors.push('User object is missing');
  } else if (!user.name) {
    errors.push('User name is missing');
  }
  
  if (!file) {
    errors.push('File is missing');
  } else {
    // File validation
    if (!file.type) {
      errors.push('File type is missing');
    }
    
    if (!file.name) {
      errors.push('File name is missing');
    }
    
    if (file.size === 0) {
      errors.push('File is empty');
    }
    
    if (file.size > 200 * 1024 * 1024) {
      errors.push('File size exceeds 200MB limit');
    }
  }
  
  return errors;
};

export const logUploadAttempt = (clinicId, patient, user, file) => {
  console.group('🔍 Upload Requirements Check');
  console.log('Clinic ID:', clinicId);
  console.log('Patient:', patient);
  console.log('User:', user);
  console.log('File:', file ? {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified
  } : 'No file');
  
  const errors = checkUploadRequirements(clinicId, patient, user, file);
  if (errors.length > 0) {
    console.error('❌ Upload Errors Found:', errors);
  } else {
    console.log('✅ All requirements met');
  }
  
  console.groupEnd();
  
  return errors;
};

export const logUploadError = (error, context = {}) => {
  console.group('🚨 Upload Error Details');
  console.error('Error:', error);
  console.log('Error message:', error.message);
  console.log('Error stack:', error.stack);
  console.log('Context:', context);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
};