import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-icon">💎</div>
        <div>
          <h1 className="brand-title">SWA Diamonds Photo Editor</h1>
        </div>
        <span className="brand-badge">React HD</span>
      </div>
    </header>
  );
}
