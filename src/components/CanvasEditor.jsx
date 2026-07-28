import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const CanvasEditor = forwardRef(function CanvasEditor(
  {
    templateImage,
    photoImage,
    photoState,
    onUpdatePhotoState,
    layerOrder
  },
  ref
) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const previewScaleRef = useRef(1.0);

  const activePointersRef = useRef(new Map());
  const prevTouchDistRef = useRef(0);
  const prevTouchAngleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    exportHighResPNG: () => {
      generateHighResBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
        link.download = `swa-diamonds-overlay-${timestamp}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    },

    shareToWhatsApp: () => {
      if (!templateImage) {
        alert("Please select a template frame first!");
        return;
      }

      generateHighResBlob(async (blob) => {
        if (!blob) {
          alert("Failed to generate poster image.");
          return;
        }

        const file = new File([blob], 'swa-diamonds-poster.png', { type: 'image/png' });

        // Check if device supports native file attachment sharing (iOS Safari, Android Chrome)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'SWA Diamonds Poster',
              text: 'Check out your custom SWA Diamonds Happy Customer poster!'
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.error('Error sharing image attachment:', err);
              fallbackWhatsAppShare(blob);
            }
          }
        } else {
          fallbackWhatsAppShare(blob);
        }
      });
    }
  }));

  const generateHighResBlob = (callback) => {
    if (!templateImage) {
      alert("Please select a template frame first!");
      return;
    }

    const exportCanvas = document.createElement('canvas');
    const nativeW = templateImage.naturalWidth;
    const nativeH = templateImage.naturalHeight;

    exportCanvas.width = nativeW;
    exportCanvas.height = nativeH;
    const exportCtx = exportCanvas.getContext('2d');

    if (layerOrder === 'template-above') {
      if (photoImage) drawPhotoLayer(exportCtx, photoImage, photoState, 1.0);
      exportCtx.drawImage(templateImage, 0, 0, nativeW, nativeH);
    } else {
      exportCtx.drawImage(templateImage, 0, 0, nativeW, nativeH);
      if (photoImage) drawPhotoLayer(exportCtx, photoImage, photoState, 1.0);
    }

    exportCanvas.toBlob(callback, 'image/png');
  };

  const fallbackWhatsAppShare = (blob) => {
    // 1. Download image to device
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `swa-diamonds-poster-${Date.now()}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Alert user & open WhatsApp
    alert("Poster image downloaded to your photos/downloads! Opening WhatsApp — select your contact and attach the downloaded image.");
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent('Check out your custom SWA Diamonds poster image!'), '_blank');
  };

  useEffect(() => {
    updateCanvasLayout();
    window.addEventListener('resize', updateCanvasLayout);
    return () => window.removeEventListener('resize', updateCanvasLayout);
  }, [templateImage]);

  useEffect(() => {
    renderCanvas();
  }, [templateImage, photoImage, photoState, layerOrder]);

  const updateCanvasLayout = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !templateImage) return;

    const containerW = container.clientWidth;
    const templateAspect = templateImage.naturalWidth / templateImage.naturalHeight;

    const displayW = containerW;
    const displayH = containerW / templateAspect;

    canvas.width = displayW;
    canvas.height = displayH;

    previewScaleRef.current = displayW / templateImage.naturalWidth;
    renderCanvas();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImage) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCheckerboard(ctx, canvas.width, canvas.height);

    const scaleFactor = previewScaleRef.current;

    if (layerOrder === 'template-above') {
      if (photoImage) drawPhotoLayer(ctx, photoImage, photoState, scaleFactor);
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
      if (photoImage) drawPhotoLayer(ctx, photoImage, photoState, scaleFactor);
    }
  };

  const drawPhotoLayer = (targetCtx, img, state, scaleFactor) => {
    if (!img) return;

    targetCtx.save();
    const cx = state.x * scaleFactor;
    const cy = state.y * scaleFactor;
    targetCtx.translate(cx, cy);

    targetCtx.rotate((state.rotation * Math.PI) / 180);

    const drawW = img.naturalWidth * state.scale * scaleFactor;
    const drawH = img.naturalHeight * state.scale * scaleFactor;

    targetCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    targetCtx.restore();
  };

  const drawCheckerboard = (targetCtx, width, height) => {
    const tileSize = 16;
    targetCtx.fillStyle = '#0f172a';
    targetCtx.fillRect(0, 0, width, height);

    targetCtx.fillStyle = '#1e293b';
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        if ((Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0) {
          targetCtx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
  };

  const handlePointerDown = (e) => {
    if (!photoImage) return;
    const canvas = canvasRef.current;
    canvas.setPointerCapture(e.pointerId);

    const pointers = activePointersRef.current;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      isDraggingRef.current = true;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    } else if (pointers.size === 2) {
      isDraggingRef.current = false;
      const pts = Array.from(pointers.values());
      prevTouchDistRef.current = getDistance(pts[0], pts[1]);
      prevTouchAngleRef.current = getAngle(pts[0], pts[1]);
    }
  };

  const handlePointerMove = (e) => {
    const pointers = activePointersRef.current;
    if (!photoImage || !pointers.has(e.pointerId)) return;

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1 && isDraggingRef.current) {
      const dxScreen = e.clientX - lastPointerPosRef.current.x;
      const dyScreen = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      const scaleFactor = previewScaleRef.current;
      onUpdatePhotoState((prev) => ({
        ...prev,
        x: prev.x + dxScreen / scaleFactor,
        y: prev.y + dyScreen / scaleFactor
      }));
    } else if (pointers.size === 2) {
      const pts = Array.from(pointers.values());
      const currentDist = getDistance(pts[0], pts[1]);
      const currentAngle = getAngle(pts[0], pts[1]);

      let zoomRatio = 1.0;
      if (prevTouchDistRef.current > 0) {
        zoomRatio = currentDist / prevTouchDistRef.current;
      }
      const angleDelta = currentAngle - prevTouchAngleRef.current;

      onUpdatePhotoState((prev) => {
        let newScale = Math.max(0.05, Math.min(10.0, prev.scale * zoomRatio));
        let newDeg = (prev.rotation + angleDelta) % 360;
        if (newDeg > 180) newDeg -= 360;
        if (newDeg < -180) newDeg += 360;
        return { ...prev, scale: newScale, rotation: newDeg };
      });

      prevTouchDistRef.current = currentDist;
      prevTouchAngleRef.current = currentAngle;
    }
  };

  const handlePointerUp = (e) => {
    const pointers = activePointersRef.current;
    pointers.delete(e.pointerId);

    if (pointers.size < 2) {
      prevTouchDistRef.current = 0;
      prevTouchAngleRef.current = 0;
    }

    if (pointers.size === 1) {
      const remainingPtr = Array.from(pointers.values())[0];
      lastPointerPosRef.current = { x: remainingPtr.x, y: remainingPtr.y };
      isDraggingRef.current = true;
    } else if (pointers.size === 0) {
      isDraggingRef.current = false;
    }
  };

  const handleWheel = (e) => {
    if (!photoImage) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    onUpdatePhotoState((prev) => ({
      ...prev,
      scale: Math.max(0.05, Math.min(10.0, prev.scale * zoomFactor))
    }));
  };

  const getDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  const aspectStyle = templateImage
    ? { aspectRatio: `${templateImage.naturalWidth} / ${templateImage.naturalHeight}` }
    : {};

  return (
    <div
      className="canvas-wrapper has-template"
      ref={containerRef}
      style={aspectStyle}
    >
      <canvas
        ref={canvasRef}
        id="editorCanvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      />
      <div className="canvas-hint">
        <span className="canvas-hint-icon">👆</span>
        <span>
          {!templateImage
            ? 'Step 1: Select a template'
            : !photoImage
            ? 'Step 2: Upload or take a photo'
            : 'Drag, Pinch-to-Zoom or Rotate photo'}
        </span>
      </div>
    </div>
  );
});

export default CanvasEditor;
