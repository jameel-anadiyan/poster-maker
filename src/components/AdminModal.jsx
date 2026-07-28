import React, { useState } from 'react';

export default function AdminModal({
  isOpen,
  onClose,
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onResetDefaults
}) {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Add Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === '5005') {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Incorrect Password! Access Denied.');
    }
  };

  const handleClose = () => {
    setPasswordInput('');
    setAuthError('');
    setIsAuthenticated(false);
    setNewTemplateName('');
    setSelectedFile(null);
    onClose();
  };

  const handleAddTemplateSubmit = (e) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !selectedFile) {
      alert('Please enter a template name and select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newTpl = {
        id: `custom-${Date.now()}`,
        name: newTemplateName.trim(),
        src: event.target.result
      };
      onAddTemplate(newTpl);
      setNewTemplateName('');
      setSelectedFile(null);
      alert(`Template "${newTpl.name}" added & saved permanently!`);
    };
    reader.readAsDataURL(selectedFile);
  };

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container" style={{ maxWidth: '580px' }}>
        
        {/* Modal Header */}
        <div className="crop-modal-header">
          <div className="crop-modal-title">
            <span>⚙️ Admin Console</span>
            {isAuthenticated && (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>
                💾 Persistent Auto-Save
              </span>
            )}
          </div>
          <button type="button" className="close-modal-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Auth Screen */}
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Enter the admin passkey to access template management tools:
            </p>
            <div className="control-group">
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Admin Password:</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  padding: '0.65rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--bg-card-border)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            {authError && (
              <p style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: '600' }}>
                {authError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Unlock Admin Console
              </button>
            </div>
          </form>
        ) : (
          /* Admin Dashboard Content */
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto' }}>
            
            {/* Section 1: Add New Template Form */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-card-border)' }}>
              <h3 style={{ fontSize: '0.92rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                ➕ Add New Frame Template (Saved Permanently)
              </h3>
              <form onSubmit={handleAddTemplateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Template Display Name:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SWA Custom Anniversary Frame"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--bg-card-border)',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                    Select Template PNG File (with transparent cutout):
                  </label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)'
                    }}
                  />
                </div>
                <button type="submit" className="btn btn-accent" style={{ alignSelf: 'flex-start', minHeight: '38px' }}>
                  <span>💾</span> Add & Save Template
                </button>
              </form>
            </div>

            {/* Section 2: Manage Existing Templates List */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  🖼️ Saved Templates ({templates.length})
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                  onClick={() => {
                    if (confirm('Reset gallery to default asset templates? Custom added templates will be removed.')) {
                      onResetDefaults();
                    }
                  }}
                >
                  ↺ Reset Defaults
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(15, 23, 42, 0.8)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--bg-card-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={tpl.src}
                        alt={tpl.name}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{tpl.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {tpl.id.startsWith('custom-') ? 'Custom Persistent Template' : 'Default Asset'}
                        </div>
                      </div>
                    </div>
                    {templates.length > 1 ? (
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: '0.3rem 0.65rem', minHeight: '32px', fontSize: '0.75rem' }}
                        onClick={() => {
                          if (confirm(`Delete template "${tpl.name}"?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Default Frame</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="crop-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
}
