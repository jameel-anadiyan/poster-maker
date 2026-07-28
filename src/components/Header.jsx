import React from 'react';

export default function Header({ onOpenAdmin }) {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">💎</div>
        <div>
          <h1 className="brand-title">SWA Diamonds Photo Editor</h1>
        </div>
        <span className="brand-badge">React HD</span>
      </div>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '36px' }}
        onClick={onOpenAdmin}
        title="Open Admin Console (Password: 5005)"
      >
        ⚙️ Admin Console
      </button>
    </header>
  );
}
