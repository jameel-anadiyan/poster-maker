import React, { useState } from 'react';

const INITIAL_TEMPLATES = [
  { id: 'happy-cust', name: 'Happy Cust', src: 'assets/templates/Happy cust.png' }
];

export default function TemplateGallery({ selectedTemplate, onSelectTemplate, nativeDim }) {
  const [templates] = useState(INITIAL_TEMPLATES);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    const timestamp = Date.now();
    setCacheBuster(timestamp);
    setRefreshing(true);

    if (selectedTemplate) {
      onSelectTemplate(`${selectedTemplate.split('?')[0]}?v=${timestamp}`);
    }

    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="panel-card template-panel">
      <div className="panel-title">
        <span>1. Select Template</span>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', color: refreshing ? 'var(--success)' : '' }}
            onClick={handleRefresh}
            title="Reload Templates from Assets"
          >
            {refreshing ? '✓ Updated' : '🔄 Refresh'}
          </button>
          <span className="badge" id="templateDimBadge">
            {nativeDim ? `${nativeDim.width}×${nativeDim.height}px` : 'Native HD'}
          </span>
        </div>
      </div>
      <div className="template-grid" id="templateGrid">
        {templates.map((tpl) => {
          const fullSrc = `${tpl.src}?v=${cacheBuster}`;
          const isSelected = selectedTemplate && selectedTemplate.startsWith(tpl.src);
          return (
            <div
              key={tpl.id}
              className={`template-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectTemplate(fullSrc)}
            >
              <img src={fullSrc} alt={tpl.name} />
              <span className="template-name">{tpl.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
