import React, { useRef } from 'react';

export default function PhotoUpload({ photoImage, onPhotoUpload, onOpenCrop, onRemovePhoto }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onPhotoUpload(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="panel-card upload-panel">
      <div className="panel-title">
        <span>2. Photo & Crop</span>
        <span
          className="badge"
          style={
            photoImage
              ? { background: 'var(--primary-light)', color: 'var(--primary)' }
              : {}
          }
        >
          {photoImage ? 'Loaded' : 'No Photo'}
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="upload-btn-group">
        <button
          type="button"
          className="btn btn-primary btn-full"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <span>📷</span> Upload / Take Photo
        </button>
        {photoImage && (
          <div className="action-row">
            <button
              type="button"
              className="btn btn-accent btn-full"
              onClick={onOpenCrop}
            >
              <span>✂️</span> Crop Photo
            </button>
            <button
              type="button"
              className="btn btn-danger btn-icon-only"
              onClick={onRemovePhoto}
              title="Remove Photo"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
