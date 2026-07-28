import React from 'react';

export default function StepNav({ activeStep }) {
  return (
    <nav className="step-bar">
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
  );
}
