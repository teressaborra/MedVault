import React, { useState, useRef, useEffect } from 'react';
import './ImageUpload.css';
import { uploadImageToCloudinary } from '../utils/cloudinary';

function ImageUpload({ 
  label, 
  currentImage,
  existingImage, // Alias for currentImage
  onUploadComplete,
  onUpload, // Alias for onUploadComplete 
  onUploadError,
  acceptedFormats = 'image/*,application/pdf',
  helpText = 'Upload government ID, license, or certificate (Max 10MB)',
  folder // Optional folder parameter
}) {
  // Support both prop names
  const initialImage = currentImage || existingImage || null;
  const uploadCallback = onUploadComplete || onUpload;
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(initialImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Update preview when existingImage prop changes (e.g., when profile loads)
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setUploadProgress(0);
    
    // Create preview for images (not for PDFs)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null); // For PDFs, we'll show an icon instead
    }

    // Upload to Cloudinary
    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      
      setPreviewUrl(uploadedUrl);
      if (uploadCallback) {
        uploadCallback(uploadedUrl);
      }
      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setPreviewUrl(initialImage);
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (uploadCallback) {
      uploadCallback('');
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes('cloudinary.com');
  };

  const isPdfUrl = (url) => {
    if (!url) return false;
    return url.match(/\.pdf$/i);
  };

  return (
    <div className="image-upload-container">
      {label && <label className="upload-label">{label}</label>}
      
      <div className="upload-area">
        {!previewUrl && !uploading && (
          <div className="upload-placeholder" onClick={handleClickUpload}>
            <div className="upload-icon">📁</div>
            <p className="upload-text">Click to upload document</p>
            {helpText && <p className="upload-help-text">{helpText}</p>}
          </div>
        )}

        {uploading && (
          <div className="upload-progress">
            <div className="progress-spinner"></div>
            <p>Uploading... {uploadProgress}%</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {previewUrl && !uploading && (
          <div className="preview-container">
            {isImageUrl(previewUrl) && (
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="preview-image"
              />
            )}
            {isPdfUrl(previewUrl) && (
              <div className="pdf-preview">
                <div className="pdf-icon">📄</div>
                <p>PDF Document</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-pdf-link"
                >
                  View Document
                </a>
              </div>
            )}
            {!isImageUrl(previewUrl) && !isPdfUrl(previewUrl) && (
              <div className="document-preview">
                <div className="doc-icon">📎</div>
                <p>Document Uploaded</p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-doc-link"
                >
                  View Document
                </a>
              </div>
            )}
            <div className="preview-actions">
              <button 
                type="button"
                className="btn-change" 
                onClick={handleClickUpload}
              >
                Change
              </button>
              <button 
                type="button"
                className="btn-remove" 
                onClick={handleRemoveImage}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {error && (
        <div className="upload-error">
          ⚠️ {error}
        </div>
      )}

      {!error && previewUrl && !uploading && (
        <div className="upload-success">
          ✓ Document uploaded successfully
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
