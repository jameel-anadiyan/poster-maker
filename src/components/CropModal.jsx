import React, { useState, useEffect, useRef } from 'react';

export default function CropModal({ isOpen, originalPhoto, onClose, onApplyCrop }) {
  const [aspectPreset, setAspectPreset] = useState('free');
  const canvasRef = useRef(null);

  const cropBoxRef = useRef({ x: 50, y: 50, w: 200, h: 200 });
  const displayScaleRef = useRef(1.0);
  const dragModeRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const boxStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (isOpen && originalPhoto) {
      setTimeout(() => initCropCanvas(), 50);
    }
  }, [isOpen, originalPhoto]);

  const initCropCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalPhoto) return;

    const viewport = canvas.parentElement;
    const maxW = viewport.clientWidth || 550;
    const maxH = 450;

    const imgAspect = originalPhoto.naturalWidth / originalPhoto.naturalHeight;
    let canvasW = maxW;
    let canvasH = maxW / imgAspect;

    if (canvasH > maxH) {
      canvasH = maxH;
      canvasW = maxH * imgAspect;
    }

    canvas.width = canvasW;
    canvas.height = canvasH;
    displayScaleRef.current = canvasW / originalPhoto.naturalWidth;

    initDefaultBox(canvasW, canvasH);
  };

  const initDefaultBox = (canvasW, canvasH) => {
    const margin = 20;
    cropBoxRef.current = {
      x: margin,
      y: margin,
      w: canvasW - margin * 2,
      h: canvasH - margin * 2
    };
    renderCropCanvas();
  };

  const renderCropCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalPhoto) return;
    const ctx = canvas.getContext('2d');
    const cropBox = cropBoxRef.current;
    const displayScale = displayScaleRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalPhoto, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.drawImage(
      originalPhoto,
      cropBox.x / displayScale,
      cropBox.y / displayScale,
      cropBox.w / displayScale,
      cropBox.h / displayScale,
      cropBox.x,
      cropBox.y,
      cropBox.w,
      cropBox.h
    );

    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    const thirdW = cropBox.w / 3;
    const thirdH = cropBox.h / 3;

    ctx.beginPath();
    ctx.moveTo(cropBox.x + thirdW, cropBox.y);
    ctx.lineTo(cropBox.x + thirdW, cropBox.y + cropBox.h);
    ctx.moveTo(cropBox.x + thirdW * 2, cropBox.y);
    ctx.lineTo(cropBox.x + thirdW * 2, cropBox.y + cropBox.h);

    ctx.moveTo(cropBox.x, cropBox.y + thirdH);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + thirdH);
    ctx.moveTo(cropBox.x, cropBox.y + thirdH * 2);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + thirdH * 2);
    ctx.stroke();

    const { x, y, w, h } = cropBox;
    const handles = {
      nw: { x: x, y: y },
      ne: { x: x + w, y: y },
      se: { x: x + w, y: y + h },
      sw: { x: x, y: y + h },
      n:  { x: x + w / 2, y: y },
      e:  { x: x + w, y: y + h / 2 },
      s:  { x: x + w / 2, y: y + h },
      w:  { x: x, y: y + h / 2 }
    };

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2;

    Object.values(handles).forEach((handle) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  };

  const applyAspect = (preset) => {
    setAspectPreset(preset);
    if (preset === 'free') {
      renderCropCanvas();
      return;
    }

    let targetRatio = 1.0;
    if (preset === '1:1') targetRatio = 1.0;
    else if (preset === '3:4') targetRatio = 3 / 4;
    else if (preset === '4:3') targetRatio = 4 / 3;
    else if (preset === '16:9') targetRatio = 16 / 9;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let newW = cropBoxRef.current.w;
    let newH = newW / targetRatio;

    if (newH > canvas.height - 20) {
      newH = canvas.height - 20;
      newW = newH * targetRatio;
    }

    cropBoxRef.current = {
      w: newW,
      h: newH,
      x: (canvas.width - newW) / 2,
      y: (canvas.height - newH) / 2
    };

    renderCropCanvas();
  };

  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    canvas.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: px, y: py };
    boxStartRef.current = { ...cropBoxRef.current };

    const { x, y, w, h } = cropBoxRef.current;
    const handles = {
      nw: { x: x, y: y },
      ne: { x: x + w, y: y },
      se: { x: x + w, y: y + h },
      sw: { x: x, y: y + h },
      n:  { x: x + w / 2, y: y },
      e:  { x: x + w, y: y + h / 2 },
      s:  { x: x + w / 2, y: y + h },
      w:  { x: x, y: y + h / 2 }
    };

    dragModeRef.current = null;
    for (const [key, handle] of Object.entries(handles)) {
      if (Math.hypot(px - handle.x, py - handle.y) <= 14) {
        dragModeRef.current = key;
        break;
      }
    }

    if (
      !dragModeRef.current &&
      px >= x &&
      px <= x + w &&
      py >= y &&
      py <= y + h
    ) {
      dragModeRef.current = 'move';
    }
  };

  const handlePointerMove = (e) => {
    if (!dragModeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const dx = px - dragStartRef.current.x;
    const dy = py - dragStartRef.current.y;

    const minSize = 40;
    const mode = dragModeRef.current;
    const start = boxStartRef.current;

    if (mode === 'move') {
      let newX = start.x + dx;
      let newY = start.y + dy;
      newX = Math.max(0, Math.min(canvas.width - start.w, newX));
      newY = Math.max(0, Math.min(canvas.height - start.h, newY));
      cropBoxRef.current.x = newX;
      cropBoxRef.current.y = newY;
    } else {
      let { x, y, w, h } = start;
      if (mode.includes('e')) w = Math.max(minSize, Math.min(canvas.width - x, start.w + dx));
      if (mode.includes('s')) h = Math.max(minSize, Math.min(canvas.height - y, start.h + dy));
      if (mode.includes('w')) {
        const possibleW = start.w - dx;
        if (possibleW >= minSize) {
          w = possibleW;
          x = start.x + dx;
        }
      }
      if (mode.includes('n')) {
        const possibleH = start.h - dy;
        if (possibleH >= minSize) {
          h = possibleH;
          y = start.y + dy;
        }
      }

      cropBoxRef.current = { x, y, w, h };
    }

    renderCropCanvas();
  };

  const handlePointerUp = () => {
    dragModeRef.current = null;
  };

  const handleApply = () => {
    if (!originalPhoto) return;
    const displayScale = displayScaleRef.current;
    const cropBox = cropBoxRef.current;

    const sx = Math.max(0, cropBox.x / displayScale);
    const sy = Math.max(0, cropBox.y / displayScale);
    const sw = Math.min(originalPhoto.naturalWidth - sx, cropBox.w / displayScale);
    const sh = Math.min(originalPhoto.naturalHeight - sy, cropBox.h / displayScale);

    if (sw <= 0 || sh <= 0) return;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = sw;
    croppedCanvas.height = sh;
    const cCtx = croppedCanvas.getContext('2d');

    cCtx.drawImage(originalPhoto, sx, sy, sw, sh, 0, 0, sw, sh);

    const croppedImg = new Image();
    croppedImg.onload = () => {
      onApplyCrop(croppedImg);
      onClose();
    };
    croppedImg.src = croppedCanvas.toDataURL('image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container">
        <div className="crop-modal-header">
          <div className="crop-modal-title">
            <span>✂️ Crop Image</span>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="aspect-preset-bar">
          {['free', '1:1', '3:4', '4:3', '16:9'].map((preset) => (
            <button
              key={preset}
              type="button"
              className={`aspect-chip ${aspectPreset === preset ? 'active' : ''}`}
              onClick={() => applyAspect(preset)}
            >
              {preset === 'free' ? 'Free' : preset}
            </button>
          ))}
        </div>

        <div className="crop-viewport">
          <canvas
            ref={canvasRef}
            id="cropCanvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>

        <div className="crop-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) initDefaultBox(canvas.width, canvas.height);
            }}
          >
            Reset Crop
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-accent" onClick={handleApply}>
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
