import React, { useState } from 'react';

export default function StepNav({ activeStep, onChangeTemplate }) {
  const [muneerVal, setMuneerVal] = useState(null);

  const handleMuneerClick = () => {
    const randomNum = Math.floor(Math.random() * 101);
    setMuneerVal(randomNum);
  };

  return (
    <div style={{ background: 'rgba(9, 13, 22, 0.95)', borderBottom: '1px solid var(--bg-card-border)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Brand & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.3rem' }}>💎</span>
          <span style={{ fontWeight: '700', fontSize: '1rem', color: '#fff' }}>SWA Diamonds</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', minHeight: '34px' }}
            onClick={onChangeTemplate}
          >
            🖼️ Select Template
          </button>

          <button
            type="button"
            className="btn btn-accent"
            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', minHeight: '34px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', fontWeight: '700' }}
            onClick={handleMuneerClick}
          >
            🎲 MUNEER
          </button>

          {muneerVal !== null && (
            <span
              className="badge"
              style={{
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                fontSize: '0.85rem',
                padding: '0.3rem 0.6rem',
                fontWeight: '700'
              }}
            >
              Result: {muneerVal}
            </span>
          )}
        </div>
      </div>

      {/* Step Wizard Navigation Bar */}
      <nav className="step-bar" style={{ borderBottom: 'none' }}>
        <div className={`step-item ${activeStep === 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span>Choose Template</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-item ${activeStep === 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span>Add & Crop Photo</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-item ${activeStep === 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span>Position & Align</span>
        </div>
        <span className="step-arrow">➔</span>
        <div className={`step-item ${activeStep === 4 ? 'active' : ''}`}>
          <span className="step-number">4</span>
          <span>Download HD</span>
        </div>
      </nav>
    </div>
  );
}
