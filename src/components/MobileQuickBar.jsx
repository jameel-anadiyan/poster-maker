import React from 'react';

export default function MobileQuickBar({
  photoImage,
  onTriggerUpload,
  onOpenCrop,
  onDownload,
  onWhatsAppShare
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
        className="btn btn-secondary mobile-quick-btn"
        style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', border: 'none' }}
        onClick={onWhatsAppShare}
        title="Share Poster Attachment to WhatsApp"
      >
        <span>💬</span> WhatsApp
      </button>

      <button
        type="button"
        className="btn btn-success mobile-quick-btn"
        onClick={onDownload}
      >
        <span>💾</span> Download
      </button>
    </div>
  );
}
