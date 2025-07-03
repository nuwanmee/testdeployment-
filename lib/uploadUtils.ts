// lib/uploadUtils.ts
export const validateFile = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WEBP, or GIF allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Max size is 5MB' };
  }

  return { valid: true };
};

export const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
  
  if (error.message.includes('File')) {
    return error.message;
  }
  
  if (error.response?.status === 413) {
    return 'File too large';
  }
  
  return 'Failed to upload photo. Please try again.';
};