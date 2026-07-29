import React, { useState, useEffect, useRef } from 'react';

import StepNav from './components/StepNav';
import TemplateGallery from './components/TemplateGallery';
import PhotoUpload from './components/PhotoUpload';
import CanvasEditor from './components/CanvasEditor';
import ControlsPanel from './components/ControlsPanel';
import CropModal from './components/CropModal';
import AdminModal from './components/AdminModal';
import TemplateSelectModal from './components/TemplateSelectModal';
import MobileQuickBar from './components/MobileQuickBar';

const INITIAL_TEMPLATES = [
  { id: 'happy-customer', name: 'Happy Customer', src: 'assets/templates/HAPPY CUSTOMER.png', filename: 'HAPPY CUSTOMER.png' },
  { id: 'birthday-template', name: 'Birthday Template', src: 'assets/templates/birthday_template.png', filename: 'birthday_template.png' },
  { id: 'anniversary-template', name: 'Anniversary Template', src: 'assets/templates/Anniversary template.png', filename: 'Anniversary template.png' },
  { id: 'anniversary-portrait', name: 'Anniversary (Portrait)', src: 'assets/templates/anniversary(portrait frame).png', filename: 'anniversary(portrait frame).png' },
  { id: 'birthday-portrait', name: 'Birthday (Portrait)', src: 'assets/templates/birthday(portrait frame).png', filename: 'birthday(portrait frame).png' },
  { id: 'happy-portrait', name: 'Happy (Portrait)', src: 'assets/templates/happy(portrait frame).png', filename: 'happy(portrait frame).png' }
];

const STORAGE_KEY = 'template_editor_custom_templates';

export default function App() {
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedCustoms = JSON.parse(saved);
        if (Array.isArray(parsedCustoms) && parsedCustoms.length > 0) {
          const customIds = new Set(parsedCustoms.map((t) => t.id));
          const defaultsFiltered = INITIAL_TEMPLATES.filter((t) => !customIds.has(t.id));
          return [...defaultsFiltered, ...parsedCustoms];
        }
      }
    } catch (err) {
      console.error('Failed to load saved templates from localStorage:', err);
    }
    return INITIAL_TEMPLATES;
  });

  const [selectedTemplateSrc, setSelectedTemplateSrc] = useState('');
  const [templateImage, setTemplateImage] = useState(null);
  const [nativeDim, setNativeDim] = useState({ width: 1080, height: 1080 });

  const [originalPhoto, setOriginalPhoto] = useState(null);
  const [photoImage, setPhotoImage] = useState(null);

  const [layerOrder, setLayerOrder] = useState('template-above');
  const [photoState, setPhotoState] = useState({
    x: 540,
    y: 540,
    scale: 1.0,
    rotation: 0
  });

  const [isTemplateSelectOpen, setIsTemplateSelectOpen] = useState(true);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const canvasEditorRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchDiskTemplates();
  }, []);

  const fetchDiskTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const diskList = await res.json();
        if (Array.isArray(diskList) && diskList.length > 0) {
          setTemplates(diskList);
        }
      }
    } catch (err) {
      console.warn('Using default initial templates:', err);
    }
  };

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

  const handleConfirmTemplateSelection = (src) => {
    setSelectedTemplateSrc(src);
    setIsTemplateSelectOpen(false);
  };

  const handleAddTemplate = async (name, base64Data) => {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageBase64: base64Data })
      });

      if (res.ok) {
        const savedTpl = await res.json();
        setTemplates((prev) => [...prev, savedTpl]);
        setSelectedTemplateSrc(`${savedTpl.src}?v=${Date.now()}`);
        return savedTpl;
      }
    } catch (err) {}

    const fallbackTpl = {
      id: `custom-${Date.now()}`,
      name,
      src: base64Data
    };
    setTemplates((prev) => [...prev, fallbackTpl]);
    setSelectedTemplateSrc(base64Data);
    return fallbackTpl;
  };

  const handleDeleteTemplate = async (tplToDelete) => {
    try {
      if (tplToDelete.filename) {
        await fetch('/api/templates', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: tplToDelete.filename })
        });
      }
    } catch (err) {}

    const updated = templates.filter((t) => t.id !== tplToDelete.id);
    setTemplates(updated);

    if (updated.length > 0) {
      setSelectedTemplateSrc(updated[0].src);
    }
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
  if (isTemplateSelectOpen || !templateImage) activeStep = 1;
  else if (!photoImage) activeStep = 2;
  else activeStep = 3;

  return (
    <>
      <StepNav
        activeStep={activeStep}
        onChangeTemplate={() => setIsTemplateSelectOpen(true)}
      />

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
            onSelectTemplate={(src) => {
              handleSelectTemplate(src);
              setIsTemplateSelectOpen(false);
            }}
            nativeDim={nativeDim}
          />

          <PhotoUpload
            photoImage={photoImage}
            onPhotoUpload={handlePhotoUpload}
            onOpenCrop={() => setIsCropOpen(true)}
            onRemovePhoto={handleRemovePhoto}
            inputRef={photoInputRef}
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

      {/* Floating Sticky Action Bar for Mobile Screens */}
      <MobileQuickBar
        photoImage={photoImage}
        onTriggerUpload={() => photoInputRef.current && photoInputRef.current.click()}
        onOpenCrop={() => setIsCropOpen(true)}
        onDownload={() => {
          if (canvasEditorRef.current) {
            canvasEditorRef.current.exportHighResPNG();
          }
        }}
      />

      {/* Initial Template Selection Intro Modal */}
      <TemplateSelectModal
        isOpen={isTemplateSelectOpen}
        templates={templates}
        selectedTemplate={selectedTemplateSrc || (templates[0] ? templates[0].src : '')}
        onSelectTemplate={handleSelectTemplate}
        onConfirmSelection={handleConfirmTemplateSelection}
      />

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
