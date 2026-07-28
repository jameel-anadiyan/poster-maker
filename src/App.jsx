import React, { useState, useEffect, useRef } from 'react';

import Header from './components/Header';
import StepNav from './components/StepNav';
import TemplateGallery from './components/TemplateGallery';
import PhotoUpload from './components/PhotoUpload';
import CanvasEditor from './components/CanvasEditor';
import ControlsPanel from './components/ControlsPanel';
import CropModal from './components/CropModal';
import AdminModal from './components/AdminModal';

const INITIAL_TEMPLATES = [
  { id: 'happy-cust', name: 'Happy Cust', src: 'assets/templates/Happy cust.png' }
];

export default function App() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [selectedTemplateSrc, setSelectedTemplateSrc] = useState('assets/templates/Happy cust.png');
  const [templateImage, setTemplateImage] = useState(null);
  const [nativeDim, setNativeDim] = useState({ width: 800, height: 1100 });

  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);

  const [layerOrder, setLayerOrder] = useState('template-above');
  const [photoState, setPhotoState] = useState({
    x: 400,
    y: 550,
    scale: 1.0,
    rotation: 0
  });

  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const canvasEditorRef = useRef(null);

  useEffect(() => {
    if (!selectedTemplateSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplateSrc;
    img.onload = () => {
      setTemplateImage(img);
      setNativeDim({ width: img.naturalWidth, height: img.naturalHeight });

      if (!photoImage) {
        setPhotoState((prev) => ({
          ...prev,
          x: img.naturalWidth / 2,
          y: img.naturalHeight / 2
        }));
      }
    };
  }, [selectedTemplateSrc]);

  const handleSelectTemplate = (src) => {
    setSelectedTemplateSrc(src);
  };

  const handleAddTemplate = (newTpl) => {
    setTemplates((prev) => [...prev, newTpl]);
    setSelectedTemplateSrc(newTpl.src);
  };

  const handleDeleteTemplate = (idToDelete) => {
    setTemplates((prev) => {
      const filtered = prev.filter((t) => t.id !== idToDelete);
      if (filtered.length > 0 && selectedTemplateSrc) {
        const deletedItem = prev.find((t) => t.id === idToDelete);
        if (deletedItem && selectedTemplateSrc.includes(deletedItem.src)) {
          setSelectedTemplateSrc(filtered[0].src);
        }
      }
      return filtered;
    });
  };

  const handlePhotoUpload = (dataUrl) => {
    const img = new Image();
    img.onload = () => {
      setOriginalPhoto(img);
      setPhotoImage(img);
      resetPhotoTransform(img, templateImage);
    };
    img.src = dataUrl;
  };

  const handleRemovePhoto = () => {
    setOriginalPhoto(null);
    setPhotoImage(null);
  };

  const resetPhotoTransform = (pImg = photoImage, tImg = templateImage) => {
    if (!tImg) return;
    let initialScale = 1.0;
    if (pImg) {
      const scaleW = tImg.naturalWidth / pImg.naturalWidth;
      const scaleH = tImg.naturalHeight / pImg.naturalHeight;
      initialScale = Math.min(scaleW, scaleH) * 0.95;
    }

    setPhotoState({
      x: tImg.naturalWidth / 2,
      y: tImg.naturalHeight / 2,
      scale: initialScale,
      rotation: 0
    });
  };

  const handleCenterPhoto = () => {
    if (!templateImage) return;
    setPhotoState((prev) => ({
      ...prev,
      x: templateImage.naturalWidth / 2,
      y: templateImage.naturalHeight / 2
    }));
  };

  const handleMovePhoto = (dx, dy) => {
    setPhotoState((prev) => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const handleChangeScale = (val) => {
    const clampedScale = Math.max(0.05, Math.min(10.0, val));
    setPhotoState((prev) => ({ ...prev, scale: clampedScale }));
  };

  const handleChangeRotation = (val) => {
    let deg = val % 360;
    if (deg > 180) deg -= 360;
    if (deg < -180) deg += 360;
    setPhotoState((prev) => ({ ...prev, rotation: deg }));
  };

  const handleToggleLayerOrder = () => {
    setLayerOrder((prev) =>
      prev === 'template-above' ? 'photo-above' : 'template-above'
    );
  };

  const handleApplyCrop = (croppedImg) => {
    setPhotoImage(croppedImg);
    resetPhotoTransform(croppedImg, templateImage);
  };

  let activeStep = 1;
  if (!templateImage) activeStep = 1;
  else if (!photoImage) activeStep = 2;
  else activeStep = 3;

  return (
    <>
      <Header onOpenAdmin={() => setIsAdminOpen(true)} />
      <StepNav activeStep={activeStep} />

      <main className="app-container">
        {/* Left Column: Canvas & Adjustments */}
        <section className="viewport-section">
          <CanvasEditor
            ref={canvasEditorRef}
            templateImage={templateImage}
            photoImage={photoImage}
            photoState={photoState}
            onUpdatePhotoState={setPhotoState}
            layerOrder={layerOrder}
          />

          <ControlsPanel
            photoState={photoState}
            onChangeScale={handleChangeScale}
            onChangeRotation={handleChangeRotation}
            onMovePhoto={handleMovePhoto}
            onResetTransform={() => resetPhotoTransform()}
            onCenterPhoto={handleCenterPhoto}
            layerOrder={layerOrder}
            onToggleLayerOrder={handleToggleLayerOrder}
          />
        </section>

        {/* Right Column: Template Picker, Upload & Download */}
        <aside className="controls-sidebar">
          <TemplateGallery
            templates={templates}
            selectedTemplate={selectedTemplateSrc}
            onSelectTemplate={handleSelectTemplate}
            nativeDim={nativeDim}
          />

          <PhotoUpload
            photoImage={photoImage}
            onPhotoUpload={handlePhotoUpload}
            onOpenCrop={() => setIsCropOpen(true)}
            onRemovePhoto={handleRemovePhoto}
          />

          <div className="panel-card export-panel">
            <div className="panel-title">
              <span>4. Download HD Image</span>
            </div>
            <button
              type="button"
              className="btn btn-success btn-full"
              onClick={() => {
                if (canvasEditorRef.current) {
                  canvasEditorRef.current.exportHighResPNG();
                }
              }}
            >
              <span>💾</span> Download High-Res PNG
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Exports at full native template resolution preserving transparent PNG quality.
            </p>
          </div>
        </aside>
      </main>

      <CropModal
        isOpen={isCropOpen}
        originalPhoto={originalPhoto}
        onClose={() => setIsCropOpen(false)}
        onApplyCrop={handleApplyCrop}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        templates={templates}
        onAddTemplate={handleAddTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />

      <footer className="app-footer">
        <p>SWA Diamonds • React Template Photo Overlay & Crop Editor • Built for Mobile & Desktop</p>
      </footer>
    </>
  );
}
