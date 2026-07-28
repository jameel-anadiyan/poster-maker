import React from 'react';

export default function MobileQuickBar({
  photoImage,
  onTriggerUpload,
  onOpenCrop,
  onDownload
}) {
  return (
    <div className="mobile-quick-bar">
      <button
        type="button"
        className="btn btn-primary mobile-quick-btn"
        onClick={onTriggerUpload}
      >
        <span>📁</span> Upload
      </button>

      {photoImage && (
        <button
          type="button"
          className="btn btn-accent mobile-quick-btn"
          onClick={onOpenCrop}
        >
          <span>✂️</span> Crop
        </button>
      )}

      <button
        type="button"
        className="btn btn-success mobile-quick-btn"
        onClick={onDownload}
      >
        <span>💾</span> Download HD
      </button>
    </div>
  );
}
