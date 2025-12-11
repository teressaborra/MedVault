// Cloudinary Configuration and Upload Utilities
// Using SIGNED uploads for security (API secret stays on backend)

const BACKEND_URL = 'http://localhost:8080';

/**
 * Get upload signature from backend
 * @returns {Promise<Object>} - Signature data from backend
 */
const getUploadSignature = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/cloudinary/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: 'medvault/documents' })
    });

    if (!response.ok) {
      throw new Error('Failed to get upload signature');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting signature:', error);
    throw new Error('Failed to authenticate upload. Please try again.');
  }
};

/**
 * Upload image to Cloudinary with signed upload (SECURE)
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Optional callback for upload progress (0-100)
 * @returns {Promise<string>} - Returns the secure URL of uploaded image
 */
export const uploadImageToCloudinary = async (file, onProgress = null) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP) or PDF');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Get signature from backend
    const signatureData = await getUploadSignature();

    // Prepare form data with signed parameters
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('api_key', signatureData.apiKey);
    formData.append('folder', signatureData.folder);

    // Upload to Cloudinary with signature
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url; // Return the secure URL of the uploaded image
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {FileList|Array} files - Array of files to upload
 * @param {Function} onProgress - Optional callback for overall progress
 * @returns {Promise<Array<string>>} - Returns array of secure URLs
 */
export const uploadMultipleImages = async (files, onProgress = null) => {
  const uploadPromises = Array.from(files).map((file, index) => 
    uploadImageToCloudinary(file, (progress) => {
      if (onProgress) {
        const overallProgress = ((index + progress / 100) / files.length) * 100;
        onProgress(Math.round(overallProgress));
      }
    })
  );

  return Promise.all(uploadPromises);
};

/**
 * Check if Cloudinary backend is configured
 * @returns {Promise<boolean>}
 */
export const isCloudinaryConfigured = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/cloudinary/config`);
    const data = await response.json();
    return data.success && data.cloudName && data.cloudName !== 'YOUR_CLOUD_NAME';
  } catch (error) {
    console.error('Error checking Cloudinary config:', error);
    return false;
  }
};

const cloudinaryUtils = {
  uploadImageToCloudinary,
  uploadMultipleImages,
  isCloudinaryConfigured
};

export default cloudinaryUtils;
