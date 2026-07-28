/* ==========================================================================
   Template Photo Overlay Editor - Core JavaScript Engine with Crop Support
   ========================================================================== */

(function () {
  'use strict';

  // --- Main Editor State Variables ---
  let templateImage = null;
  let originalPhotoImage = null; // Uncropped original image
  let photoImage = null;         // Currently active (cropped) photo image
  let layerOrder = 'template-above'; // 'template-above' or 'photo-above'

  // Photo transform state stored in Native Template Space coordinates
  let photoState = {
    x: 0,        // Center X in native template space
    y: 0,        // Center Y in native template space
    scale: 1.0,  // Scale multiplier
    rotation: 0  // Angle in degrees (-180 to 180)
  };

  // Preview scale factor = previewCanvasWidth / templateNativeWidth
  let previewScaleFactor = 1.0;

  // Active Pointers for Multi-Touch Gestures in Main Viewport
  const activePointers = new Map();
  let prevTouchDistance = 0;
  let prevTouchAngle = 0;
  let isDragging = false;
  let lastPointerPos = { x: 0, y: 0 };

  // --- Crop Modal State Variables ---
  let cropDisplayScale = 1.0;
  let currentAspectPreset = 'free'; // 'free', '1:1', '3:4', '4:3', '16:9'
  let cropBox = { x: 50, y: 50, w: 200, h: 200 };
  let cropDragMode = null; // null, 'move', 'nw', 'ne', 'se', 'sw', 'n', 'e', 's', 'w'
  let cropDragStart = { x: 0, y: 0 };
  let cropBoxStart = { x: 0, y: 0, w: 0, h: 0 };

  // --- DOM Elements ---
  const canvasWrapper = document.getElementById('canvasWrapper');
  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  const canvasHintText = document.getElementById('canvasHintText');

  const photoInput = document.getElementById('photoInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const openCropBtn = document.getElementById('openCropBtn');
  const removePhotoBtn = document.getElementById('removePhotoBtn');
  const photoStatusBadge = document.getElementById('photoStatusBadge');
  const templateDimBadge = document.getElementById('templateDimBadge');

  const layerToggleBtn = document.getElementById('layerToggleBtn');
  const scaleSlider = document.getElementById('scaleSlider');
  const scaleValDisplay = document.getElementById('scaleValDisplay');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');

  const rotateSlider = document.getElementById('rotateSlider');
  const rotateValDisplay = document.getElementById('rotateValDisplay');
  const rotateCwBtn = document.getElementById('rotateCwBtn');
  const rotateCcwBtn = document.getElementById('rotateCcwBtn');

  const resetTransformBtn = document.getElementById('resetTransformBtn');
  const centerPhotoBtn = document.getElementById('centerPhotoBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const step4 = document.getElementById('step4');

  // Nudge Direction Buttons
  const nudgeUp = document.getElementById('nudgeUp');
  const nudgeDown = document.getElementById('nudgeDown');
  const nudgeLeft = document.getElementById('nudgeLeft');
  const nudgeRight = document.getElementById('nudgeRight');

  const refreshTemplatesBtn = document.getElementById('refreshTemplatesBtn');
  const templateCards = document.querySelectorAll('.template-card');

  // Crop Modal Elements
  const cropModal = document.getElementById('cropModal');
  const closeCropModalBtn = document.getElementById('closeCropModalBtn');
  const cancelCropBtn = document.getElementById('cancelCropBtn');
  const resetCropBtn = document.getElementById('resetCropBtn');
  const applyCropBtn = document.getElementById('applyCropBtn');
  const cropViewport = document.getElementById('cropViewport');
  const cropCanvas = document.getElementById('cropCanvas');
  const cropCtx = cropCanvas.getContext('2d');
  const aspectChips = document.querySelectorAll('.aspect-chip');

  // --- Initialization ---
  function init() {
    setupEventListeners();
    setupCropModalListeners();

    // Load default selected template
    const initialSelectedCard = document.querySelector('.template-card.selected');
    if (initialSelectedCard) {
      loadTemplate(initialSelectedCard.dataset.src);
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Template Refresh Button
    if (refreshTemplatesBtn) {
      refreshTemplatesBtn.addEventListener('click', refreshTemplates);
    }

    // Template Selection
    templateCards.forEach(card => {
      card.addEventListener('click', () => {
        templateCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        loadTemplate(card.dataset.src);
      });
    });

    // Upload & Photo Actions
    uploadBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoUpload);
    removePhotoBtn.addEventListener('click', removePhoto);
    openCropBtn.addEventListener('click', openCropModal);

    // Layer Order Toggle
    layerToggleBtn.addEventListener('click', toggleLayerOrder);

    // Scale Controls
    scaleSlider.addEventListener('input', (e) => {
      setPhotoScale(parseFloat(e.target.value));
    });
    zoomInBtn.addEventListener('click', () => setPhotoScale(photoState.scale + 0.1));
    zoomOutBtn.addEventListener('click', () => setPhotoScale(photoState.scale - 0.1));

    // Rotation Controls
    rotateSlider.addEventListener('input', (e) => {
      setPhotoRotation(parseFloat(e.target.value));
    });
    rotateCwBtn.addEventListener('click', () => setPhotoRotation(photoState.rotation + 90));
    rotateCcwBtn.addEventListener('click', () => setPhotoRotation(photoState.rotation - 90));

    // Nudge Controls
    const nudgeAmount = 5;
    nudgeUp.addEventListener('click', () => movePhoto(0, -nudgeAmount));
    nudgeDown.addEventListener('click', () => movePhoto(0, nudgeAmount));
    nudgeLeft.addEventListener('click', () => movePhoto(-nudgeAmount, 0));
    nudgeRight.addEventListener('click', () => movePhoto(nudgeAmount, 0));

    // Reset & Center
    resetTransformBtn.addEventListener('click', resetPhotoTransform);
    centerPhotoBtn.addEventListener('click', centerPhoto);

    // Export / Download
    downloadBtn.addEventListener('click', exportHighResPNG);

    // Main Canvas Pointer Events (Touch + Drag + Pinch + Rotate)
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheelZoom, { passive: false });

    // Window Resize Observer
    window.addEventListener('resize', updateCanvasLayout);
  }

  // --- Refresh / Force Reload Templates from Assets ---
  function refreshTemplates() {
    const timestamp = Date.now();
    
    // Update all card image sources with cache buster
    templateCards.forEach(card => {
      const baseSrc = card.dataset.src.split('?')[0];
      card.dataset.src = baseSrc;
      const img = card.querySelector('img');
      if (img) {
        img.src = `${baseSrc}?v=${timestamp}`;
      }
    });

    // Reload active selected template with cache buster
    const activeCard = document.querySelector('.template-card.selected');
    if (activeCard) {
      loadTemplate(`${activeCard.dataset.src}?v=${timestamp}`);
    }

    if (refreshTemplatesBtn) {
      const origHtml = refreshTemplatesBtn.innerHTML;
      refreshTemplatesBtn.innerHTML = "✓ Updated";
      refreshTemplatesBtn.style.color = "var(--success)";
      setTimeout(() => {
        refreshTemplatesBtn.innerHTML = origHtml;
        refreshTemplatesBtn.style.color = "";
      }, 1500);
    }
  }

  // --- Load Template Image ---
  function loadTemplate(src) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      templateImage = img;
      canvasWrapper.classList.add('has-template');
      templateDimBadge.textContent = `${img.naturalWidth}×${img.naturalHeight}px`;

      if (!photoImage) {
        photoState.x = img.naturalWidth / 2;
        photoState.y = img.naturalHeight / 2;
      }

      updateCanvasLayout();
      updateStepStatus();
    };
    img.onerror = () => {
      console.error("Failed to load template image:", src);
    };
  }

  // --- Handle Photo Upload ---
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        originalPhotoImage = img;
        photoImage = img; // Default to uncropped initial photo
        removePhotoBtn.classList.remove('hidden');
        openCropBtn.classList.remove('hidden');

        photoStatusBadge.textContent = "Loaded";
        photoStatusBadge.style.background = "var(--primary-light)";
        photoStatusBadge.style.color = "var(--primary)";

        resetPhotoTransform();
        updateStepStatus();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    photoInput.value = "";
  }

  // --- Remove Photo ---
  function removePhoto() {
    originalPhotoImage = null;
    photoImage = null;
    removePhotoBtn.classList.add('hidden');
    openCropBtn.classList.add('hidden');
    photoStatusBadge.textContent = "No Photo";
    photoStatusBadge.style.background = "";
    photoStatusBadge.style.color = "";
    renderCanvas();
    updateStepStatus();
  }

  // --- Reset Photo Transform ---
  function resetPhotoTransform() {
    if (!templateImage) return;

    photoState.x = templateImage.naturalWidth / 2;
    photoState.y = templateImage.naturalHeight / 2;

    if (photoImage) {
      const scaleW = templateImage.naturalWidth / photoImage.naturalWidth;
      const scaleH = templateImage.naturalHeight / photoImage.naturalHeight;
      photoState.scale = Math.min(scaleW, scaleH) * 0.95;
    } else {
      photoState.scale = 1.0;
    }

    photoState.rotation = 0;
    updateUIControls();
    renderCanvas();
  }

  function centerPhoto() {
    if (!templateImage) return;
    photoState.x = templateImage.naturalWidth / 2;
    photoState.y = templateImage.naturalHeight / 2;
    renderCanvas();
  }

  function movePhoto(dxNative, dyNative) {
    if (!photoImage) return;
    photoState.x += dxNative;
    photoState.y += dyNative;
    renderCanvas();
  }

  function setPhotoScale(val) {
    photoState.scale = Math.max(0.05, Math.min(10.0, val));
    updateUIControls();
    renderCanvas();
  }

  function setPhotoRotation(val) {
    let deg = val % 360;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    photoState.rotation = deg;
    updateUIControls();
    renderCanvas();
  }

  function toggleLayerOrder() {
    if (layerOrder === 'template-above') {
      layerOrder = 'photo-above';
      layerToggleBtn.textContent = "Photo ABOVE Template";
      layerToggleBtn.style.background = "var(--accent-pink)";
      layerToggleBtn.style.color = "#fff";
    } else {
      layerOrder = 'template-above';
      layerToggleBtn.textContent = "Template ABOVE Photo";
      layerToggleBtn.style.background = "var(--primary-light)";
      layerToggleBtn.style.color = "var(--primary)";
    }
    renderCanvas();
  }

  function updateUIControls() {
    scaleSlider.value = photoState.scale.toFixed(2);
    scaleValDisplay.textContent = `${Math.round(photoState.scale * 100)}%`;

    rotateSlider.value = Math.round(photoState.rotation);
    rotateValDisplay.textContent = `${Math.round(photoState.rotation)}°`;
  }

  function updateStepStatus() {
    step1.classList.remove('active');
    step2.classList.remove('active');
    step3.classList.remove('active');
    step4.classList.remove('active');

    if (!templateImage) {
      step1.classList.add('active');
      canvasHintText.textContent = "Step 1: Select a template from the sidebar";
    } else if (!photoImage) {
      step2.classList.add('active');
      canvasHintText.textContent = "Step 2: Upload or take a photo";
    } else {
      step3.classList.add('active');
      canvasHintText.textContent = "Drag, Pinch-to-Zoom or Rotate photo";
    }
  }

  function updateCanvasLayout() {
    if (!templateImage) return;

    const containerWidth = canvasWrapper.clientWidth;
    const templateAspect = templateImage.naturalWidth / templateImage.naturalHeight;

    let displayWidth = containerWidth;
    let displayHeight = containerWidth / templateAspect;

    canvas.width = displayWidth;
    canvas.height = displayHeight;

    previewScaleFactor = displayWidth / templateImage.naturalWidth;
    renderCanvas();
  }

  function renderCanvas() {
    if (!templateImage) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCheckerboard(ctx, canvas.width, canvas.height);

    if (layerOrder === 'template-above') {
      if (photoImage) drawPhotoLayer(ctx, previewScaleFactor);
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);
      if (photoImage) drawPhotoLayer(ctx, previewScaleFactor);
    }
  }

  function drawPhotoLayer(targetCtx, scaleFactor) {
    if (!photoImage) return;

    targetCtx.save();
    const cx = photoState.x * scaleFactor;
    const cy = photoState.y * scaleFactor;
    targetCtx.translate(cx, cy);

    targetCtx.rotate((photoState.rotation * Math.PI) / 180);

    const drawW = photoImage.naturalWidth * photoState.scale * scaleFactor;
    const drawH = photoImage.naturalHeight * photoState.scale * scaleFactor;

    targetCtx.drawImage(photoImage, -drawW / 2, -drawH / 2, drawW, drawH);
    targetCtx.restore();
  }

  function drawCheckerboard(targetCtx, width, height) {
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
  }

  // --- Pointer & Touch Gesture Handling ---
  function handlePointerDown(e) {
    if (!photoImage) return;
    canvas.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 1) {
      isDragging = true;
      lastPointerPos = { x: e.clientX, y: e.clientY };
    } else if (activePointers.size === 2) {
      isDragging = false;
      const pts = Array.from(activePointers.values());
      prevTouchDistance = getDistance(pts[0], pts[1]);
      prevTouchAngle = getAngle(pts[0], pts[1]);
    }
  }

  function handlePointerMove(e) {
    if (!photoImage || !activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 1 && isDragging) {
      const dxScreen = e.clientX - lastPointerPos.x;
      const dyScreen = e.clientY - lastPointerPos.y;
      lastPointerPos = { x: e.clientX, y: e.clientY };

      photoState.x += dxScreen / previewScaleFactor;
      photoState.y += dyScreen / previewScaleFactor;

      renderCanvas();
    } else if (activePointers.size === 2) {
      const pts = Array.from(activePointers.values());
      const currentDist = getDistance(pts[0], pts[1]);
      const currentAngle = getAngle(pts[0], pts[1]);

      if (prevTouchDistance > 0) {
        const zoomRatio = currentDist / prevTouchDistance;
        setPhotoScale(photoState.scale * zoomRatio);
      }

      const angleDelta = currentAngle - prevTouchAngle;
      setPhotoRotation(photoState.rotation + angleDelta);

      prevTouchDistance = currentDist;
      prevTouchAngle = currentAngle;
    }
  }

  function handlePointerUp(e) {
    activePointers.delete(e.pointerId);
    if (activePointers.size < 2) {
      prevTouchDistance = 0;
      prevTouchAngle = 0;
    }
    if (activePointers.size === 1) {
      const remainingPtr = Array.from(activePointers.values())[0];
      lastPointerPos = { x: remainingPtr.x, y: remainingPtr.y };
      isDragging = true;
    } else if (activePointers.size === 0) {
      isDragging = false;
    }
  }

  function handleWheelZoom(e) {
    if (!photoImage) return;
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setPhotoScale(photoState.scale * zoomFactor);
  }

  function getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getAngle(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  }

  // ==========================================================================
  // Interactive Photo Crop Engine Logic
  // ==========================================================================

  function setupCropModalListeners() {
    closeCropModalBtn.addEventListener('click', closeCropModal);
    cancelCropBtn.addEventListener('click', closeCropModal);
    resetCropBtn.addEventListener('click', initDefaultCropBox);
    applyCropBtn.addEventListener('click', applyCrop);

    // Aspect Ratio Presets
    aspectChips.forEach(chip => {
      chip.addEventListener('click', () => {
        aspectChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentAspectPreset = chip.dataset.ratio;
        applyAspectPreset();
      });
    });

    // Crop Canvas Touch/Pointer Events
    cropCanvas.addEventListener('pointerdown', handleCropPointerDown);
    cropCanvas.addEventListener('pointermove', handleCropPointerMove);
    cropCanvas.addEventListener('pointerup', handleCropPointerUp);
    cropCanvas.addEventListener('pointercancel', handleCropPointerUp);
  }

  function openCropModal() {
    if (!originalPhotoImage) return;
    cropModal.classList.remove('hidden');

    // Layout Crop Canvas in Viewport
    const maxW = cropViewport.clientWidth || 550;
    const maxH = 450;

    const imgAspect = originalPhotoImage.naturalWidth / originalPhotoImage.naturalHeight;
    let canvasW = maxW;
    let canvasH = maxW / imgAspect;

    if (canvasH > maxH) {
      canvasH = maxH;
      canvasW = maxH * imgAspect;
    }

    cropCanvas.width = canvasW;
    cropCanvas.height = canvasH;
    cropDisplayScale = canvasW / originalPhotoImage.naturalWidth;

    initDefaultCropBox();
  }

  function closeCropModal() {
    cropModal.classList.add('hidden');
  }

  function initDefaultCropBox() {
    if (!originalPhotoImage) return;
    const margin = 20;
    cropBox = {
      x: margin,
      y: margin,
      w: cropCanvas.width - margin * 2,
      h: cropCanvas.height - margin * 2
    };

    if (currentAspectPreset !== 'free') {
      applyAspectPreset();
    } else {
      renderCropCanvas();
    }
  }

  function applyAspectPreset() {
    if (currentAspectPreset === 'free') {
      renderCropCanvas();
      return;
    }

    let targetRatio = 1.0;
    if (currentAspectPreset === '1:1') targetRatio = 1.0;
    else if (currentAspectPreset === '3:4') targetRatio = 3 / 4;
    else if (currentAspectPreset === '4:3') targetRatio = 4 / 3;
    else if (currentAspectPreset === '16:9') targetRatio = 16 / 9;

    let newW = cropBox.w;
    let newH = newW / targetRatio;

    if (newH > cropCanvas.height - 20) {
      newH = cropCanvas.height - 20;
      newW = newH * targetRatio;
    }

    cropBox.w = newW;
    cropBox.h = newH;
    cropBox.x = (cropCanvas.width - newW) / 2;
    cropBox.y = (cropCanvas.height - newH) / 2;

    renderCropCanvas();
  }

  function renderCropCanvas() {
    if (!originalPhotoImage) return;

    // Draw Original Image
    cropCtx.clearRect(0, 0, cropCanvas.width, cropCanvas.height);
    cropCtx.drawImage(originalPhotoImage, 0, 0, cropCanvas.width, cropCanvas.height);

    // Dark Mask Overlay
    cropCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    cropCtx.fillRect(0, 0, cropCanvas.width, cropCanvas.height);

    // Clear Cropped Region
    cropCtx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    cropCtx.drawImage(
      originalPhotoImage,
      cropBox.x / cropDisplayScale,
      cropBox.y / cropDisplayScale,
      cropBox.w / cropDisplayScale,
      cropBox.h / cropDisplayScale,
      cropBox.x,
      cropBox.y,
      cropBox.w,
      cropBox.h
    );

    // Crop Box Border
    cropCtx.strokeStyle = '#0d9488'; // Teal border
    cropCtx.lineWidth = 2;
    cropCtx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    // Rule of Thirds Grid
    cropCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    cropCtx.lineWidth = 1;
    const thirdW = cropBox.w / 3;
    const thirdH = cropBox.h / 3;

    cropCtx.beginPath();
    cropCtx.moveTo(cropBox.x + thirdW, cropBox.y);
    cropCtx.lineTo(cropBox.x + thirdW, cropBox.y + cropBox.h);
    cropCtx.moveTo(cropBox.x + thirdW * 2, cropBox.y);
    cropCtx.lineTo(cropBox.x + thirdW * 2, cropBox.y + cropBox.h);

    cropCtx.moveTo(cropBox.x, cropBox.y + thirdH);
    cropCtx.lineTo(cropBox.x + cropBox.w, cropBox.y + thirdH);
    cropCtx.moveTo(cropBox.x, cropBox.y + thirdH * 2);
    cropCtx.lineTo(cropBox.x + cropBox.w, cropBox.y + thirdH * 2);
    cropCtx.stroke();

    // Corner Handles
    const handles = getCropHandles();
    cropCtx.fillStyle = '#ffffff';
    cropCtx.strokeStyle = '#0d9488';
    cropCtx.lineWidth = 2;

    Object.values(handles).forEach(h => {
      cropCtx.beginPath();
      cropCtx.arc(h.x, h.y, 6, 0, Math.PI * 2);
      cropCtx.fill();
      cropCtx.stroke();
    });
  }

  function getCropHandles() {
    const { x, y, w, h } = cropBox;
    return {
      nw: { x: x, y: y },
      ne: { x: x + w, y: y },
      se: { x: x + w, y: y + h },
      sw: { x: x, y: y + h },
      n:  { x: x + w / 2, y: y },
      e:  { x: x + w, y: y + h / 2 },
      s:  { x: x + w / 2, y: y + h },
      w:  { x: x, y: y + h / 2 }
    };
  }

  function handleCropPointerDown(e) {
    const rect = cropCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    cropCanvas.setPointerCapture(e.pointerId);
    cropDragStart = { x: px, y: py };
    cropBoxStart = { ...cropBox };

    // Check hit on corner/edge handles
    const handles = getCropHandles();
    const hitRadius = 14;
    cropDragMode = null;

    for (const [key, h] of Object.entries(handles)) {
      if (Math.hypot(px - h.x, py - h.y) <= hitRadius) {
        cropDragMode = key;
        break;
      }
    }

    // Hit inside crop box -> move box
    if (!cropDragMode && px >= cropBox.x && px <= cropBox.x + cropBox.w && py >= cropBox.y && py <= cropBox.y + cropBox.h) {
      cropDragMode = 'move';
    }
  }

  function handleCropPointerMove(e) {
    if (!cropDragMode) return;

    const rect = cropCanvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const dx = px - cropDragStart.x;
    const dy = py - cropDragStart.y;

    const minSize = 40;

    if (cropDragMode === 'move') {
      let newX = cropBoxStart.x + dx;
      let newY = cropBoxStart.y + dy;

      newX = Math.max(0, Math.min(cropCanvas.width - cropBoxStart.w, newX));
      newY = Math.max(0, Math.min(cropCanvas.height - cropBoxStart.h, newY));

      cropBox.x = newX;
      cropBox.y = newY;
    } else {
      let { x, y, w, h } = cropBoxStart;

      if (cropDragMode.includes('e')) w = Math.max(minSize, Math.min(cropCanvas.width - x, cropBoxStart.w + dx));
      if (cropDragMode.includes('s')) h = Math.max(minSize, Math.min(cropCanvas.height - y, cropBoxStart.h + dy));
      if (cropDragMode.includes('w')) {
        const possibleW = cropBoxStart.w - dx;
        if (possibleW >= minSize) {
          w = possibleW;
          x = cropBoxStart.x + dx;
        }
      }
      if (cropDragMode.includes('n')) {
        const possibleH = cropBoxStart.h - dy;
        if (possibleH >= minSize) {
          h = possibleH;
          y = cropBoxStart.y + dy;
        }
      }

      cropBox = { x, y, w, h };

      if (currentAspectPreset !== 'free') {
        applyAspectPreset();
        return;
      }
    }

    renderCropCanvas();
  }

  function handleCropPointerUp(e) {
    cropDragMode = null;
  }

  function applyCrop() {
    if (!originalPhotoImage) return;

    // Map crop box to original image dimensions
    const sx = Math.max(0, cropBox.x / cropDisplayScale);
    const sy = Math.max(0, cropBox.y / cropDisplayScale);
    const sw = Math.min(originalPhotoImage.naturalWidth - sx, cropBox.w / cropDisplayScale);
    const sh = Math.min(originalPhotoImage.naturalHeight - sy, cropBox.h / cropDisplayScale);

    if (sw <= 0 || sh <= 0) return;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = sw;
    croppedCanvas.height = sh;
    const cCtx = croppedCanvas.getContext('2d');

    cCtx.drawImage(originalPhotoImage, sx, sy, sw, sh, 0, 0, sw, sh);

    const croppedImg = new Image();
    croppedImg.onload = () => {
      photoImage = croppedImg;
      resetPhotoTransform();
      closeCropModal();
    };
    croppedImg.src = croppedCanvas.toDataURL('image/png');
  }

  // --- High-Resolution Offscreen Canvas Exporter ---
  function exportHighResPNG() {
    if (!templateImage) {
      alert("Please select a template frame first!");
      return;
    }

    step4.classList.add('active');

    const exportCanvas = document.createElement('canvas');
    const nativeW = templateImage.naturalWidth;
    const nativeH = templateImage.naturalHeight;

    exportCanvas.width = nativeW;
    exportCanvas.height = nativeH;
    const exportCtx = exportCanvas.getContext('2d');

    if (layerOrder === 'template-above') {
      if (photoImage) drawPhotoLayer(exportCtx, 1.0);
      exportCtx.drawImage(templateImage, 0, 0, nativeW, nativeH);
    } else {
      exportCtx.drawImage(templateImage, 0, 0, nativeW, nativeH);
      if (photoImage) drawPhotoLayer(exportCtx, 1.0);
    }

    exportCanvas.toBlob((blob) => {
      if (!blob) {
        alert("Failed to generate export image.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      link.download = `swa-diamonds-overlay-${timestamp}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  // Start Application
  document.addEventListener('DOMContentLoaded', init);

})();
