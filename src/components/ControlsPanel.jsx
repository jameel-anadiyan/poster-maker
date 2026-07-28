import React from 'react';

export default function ControlsPanel({
  photoState,
  onChangeScale,
  onChangeRotation,
  onMovePhoto,
  onResetTransform,
  onCenterPhoto,
  layerOrder,
  onToggleLayerOrder
}) {
  const nudgeAmount = 5;

  return (
    <div className="panel-card adjust-panel">
      <div className="panel-title">
        <span>3. Adjust & Align Photo</span>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
          onClick={onResetTransform}
        >
          ↺ Reset
        </button>
      </div>

      {/* Layer Z-Order Toggle */}
      <div className="toggle-row">
        <span className="toggle-label">
          <span>🥞 Layer Order:</span>
        </span>
        <button
          type="button"
          className="layer-switch-btn"
          style={
            layerOrder === 'photo-above'
              ? { background: 'var(--accent-pink)', color: '#fff' }
              : { background: 'var(--primary-light)', color: 'var(--primary)' }
          }
          onClick={onToggleLayerOrder}
        >
          {layerOrder === 'template-above'
            ? 'Template ABOVE Photo'
            : 'Photo ABOVE Template'}
        </button>
      </div>

      {/* Scale Slider */}
      <div className="control-group">
        <div className="control-header">
          <span>🔍 Scale / Zoom</span>
          <span className="control-val">{Math.round(photoState.scale * 100)}%</span>
        </div>
        <div className="slider-row">
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            style={{ minHeight: '36px' }}
            onClick={() => onChangeScale(photoState.scale - 0.1)}
          >
            -
          </button>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.01"
            value={photoState.scale}
            onChange={(e) => onChangeScale(parseFloat(e.target.value))}
          />
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            style={{ minHeight: '36px' }}
            onClick={() => onChangeScale(photoState.scale + 0.1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="control-group">
        <div className="control-header">
          <span>🔄 Rotation</span>
          <span className="control-val">{Math.round(photoState.rotation)}°</span>
        </div>
        <div className="slider-row">
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            style={{ minHeight: '36px' }}
            onClick={() => onChangeRotation(photoState.rotation - 90)}
          >
            ↺ -90°
          </button>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={Math.round(photoState.rotation)}
            onChange={(e) => onChangeRotation(parseFloat(e.target.value))}
          />
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            style={{ minHeight: '36px' }}
            onClick={() => onChangeRotation(photoState.rotation + 90)}
          >
            ↻ +90°
          </button>
        </div>
      </div>

      {/* Nudge Directional Controls */}
      <div className="control-group">
        <div className="control-header">
          <span>🎯 Fine Nudge (5px)</span>
        </div>
        <div className="nudge-pad">
          <div></div>
          <button
            type="button"
            className="nudge-btn"
            title="Move Up"
            onClick={() => onMovePhoto(0, -nudgeAmount)}
          >
            ▲
          </button>
          <div></div>
          <button
            type="button"
            className="nudge-btn"
            title="Move Left"
            onClick={() => onMovePhoto(-nudgeAmount, 0)}
          >
            ◄
          </button>
          <button
            type="button"
            className="nudge-btn"
            title="Center Photo"
            onClick={onCenterPhoto}
          >
            ⦿
          </button>
          <button
            type="button"
            className="nudge-btn"
            title="Move Right"
            onClick={() => onMovePhoto(nudgeAmount, 0)}
          >
            ►
          </button>
          <div></div>
          <button
            type="button"
            className="nudge-btn"
            title="Move Down"
            onClick={() => onMovePhoto(0, nudgeAmount)}
          >
            ▼
          </button>
          <div></div>
        </div>
      </div>
    </div>
  );
}
