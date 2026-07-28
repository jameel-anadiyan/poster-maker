import React, { useState } from 'react';

export default function TemplateSelectModal({
  isOpen,
  templates,
  selectedTemplate,
  onSelectTemplate,
  onConfirmSelection
}) {
  const [activeSelected, setActiveSelected] = useState(selectedTemplate);

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container" style={{ maxWidth: '680px', maxHeight: '92vh' }}>
        
        {/* Header */}
        <div className="crop-modal-header">
          <div className="crop-modal-title">
            <span>🖼️ Step 1: Select a Frame Template</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Choose a template frame to begin editing your customer photo:
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '1rem'
            }}
          >
            {templates.map((tpl) => {
              const isSelected = activeSelected && (activeSelected === tpl.src || activeSelected.startsWith(tpl.src));
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setActiveSelected(tpl.src);
                    onSelectTemplate(tpl.src);
                  }}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '3px solid var(--primary)' : '2px solid var(--bg-card-border)',
                    boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.6)' : 'none',
                    background: 'rgba(15, 23, 42, 0.8)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <img
                    src={tpl.src}
                    alt={tpl.name}
                    style={{ width: '100%', height: '80%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      height: '20%',
                      background: 'rgba(9, 13, 22, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 0.5rem'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#fff' }}>
                      {tpl.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'var(--primary)',
                        color: '#fff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="crop-modal-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Select frame to proceed
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!activeSelected}
            onClick={() => onConfirmSelection(activeSelected)}
          >
            <span>➔</span> Start Editing with Template
          </button>
        </div>

      </div>
    </div>
  );
}
