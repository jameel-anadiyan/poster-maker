import React, { useState } from 'react';

export default function WhatsAppModal({
  isOpen,
  onClose,
  onSendToNumber,
  onShareNativeFile
}) {
  const [countryCode, setCountryCode] = useState('91');
  const [phoneNum, setPhoneNum] = useState('');
  const [customMsg, setCustomMsg] = useState(
    'Hello! Here is your custom SWA Diamonds Happy Customer poster.'
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNum = phoneNum.replace(/\D/g, '');
    if (!cleanNum) {
      alert('Please enter a valid WhatsApp phone number.');
      return;
    }

    // Full international phone number without leading zeros
    const fullNumber = `${countryCode}${cleanNum.replace(/^0+/, '')}`;
    onSendToNumber(fullNumber, customMsg);
    onClose();
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container" style={{ maxWidth: '520px' }}>
        
        {/* Header */}
        <div className="crop-modal-header">
          <div className="crop-modal-title">
            <span style={{ color: '#25D366' }}>💬 Direct WhatsApp Chat</span>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter the customer's WhatsApp number to automatically download the HD poster and open their chat window directly:
          </p>

          {/* Phone Number Input Group */}
          <div className="control-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Phone Number:</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  padding: '0.6rem 0.6rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--bg-card-border)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              >
                <option value="91">🇮🇳 +91 (India)</option>
                <option value="971">🇦🇪 +971 (UAE)</option>
                <option value="1">🇺🇸 +1 (USA/Canada)</option>
                <option value="44">🇬🇧 +44 (UK)</option>
                <option value="966">🇸🇦 +966 (Saudi Arabia)</option>
                <option value="61">🇦🇺 +61 (Australia)</option>
                <option value="">Custom</option>
              </select>

              <input
                type="tel"
                placeholder="Enter 10-digit number (e.g. 9876543210)"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--bg-card-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="control-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Message (Optional):</label>
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--bg-card-border)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem'
              }}
            >
              <span>💬</span> Open WhatsApp Chat Direct
            </button>

            {onShareNativeFile && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onShareNativeFile();
                  onClose();
                }}
              >
                <span>📲</span> Mobile Native File Share
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="crop-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
