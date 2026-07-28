import React, { useState } from 'react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(digit);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op) => {
    setEquation(`${display} ${op} `);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const handleDelete = () => {
    if (display.length === 1 || shouldResetDisplay) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    if (!equation) return;
    try {
      const fullExpr = (equation + display)
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      // Evaluate basic arithmetic
      const result = Function(`'use strict'; return (${fullExpr})`)();
      setDisplay(String(Number(result.toFixed(6))));
      setEquation('');
      setShouldResetDisplay(true);
    } catch (err) {
      setDisplay('Error');
      setEquation('');
      setShouldResetDisplay(true);
    }
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-container" style={{ maxWidth: '340px', padding: '1rem', background: '#0f172a' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f59e0b' }}>
            🧮 MUNEER Calculator
          </span>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Calculator Screen Display */}
        <div
          style={{
            background: '#020617',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            textAlign: 'right',
            marginBottom: '1rem',
            border: '1px solid var(--bg-card-border)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', minHeight: '1.2rem' }}>
            {equation}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', overflowX: 'auto' }}>
            {display}
          </div>
        </div>

        {/* Calculator Button Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem'
          }}
        >
          <button type="button" className="btn btn-secondary" style={{ background: '#334155', color: '#ef4444', fontWeight: 'bold' }} onClick={handleClear}>
            C
          </button>
          <button type="button" className="btn btn-secondary" style={{ background: '#334155', color: '#f59e0b' }} onClick={handleDelete}>
            ⌫
          </button>
          <button type="button" className="btn btn-secondary" style={{ background: '#334155', color: '#f59e0b' }} onClick={() => handleOperator('%')}>
            %
          </button>
          <button type="button" className="btn btn-primary" style={{ background: '#6366f1' }} onClick={() => handleOperator('÷')}>
            ÷
          </button>

          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('7')}>7</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('8')}>8</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('9')}>9</button>
          <button type="button" className="btn btn-primary" style={{ background: '#6366f1' }} onClick={() => handleOperator('×')}>
            ×
          </button>

          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('4')}>4</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('5')}>5</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('6')}>6</button>
          <button type="button" className="btn btn-primary" style={{ background: '#6366f1' }} onClick={() => handleOperator('-')}>
            -
          </button>

          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('1')}>1</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('2')}>2</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleDigit('3')}>3</button>
          <button type="button" className="btn btn-primary" style={{ background: '#6366f1' }} onClick={() => handleOperator('+')}>
            +
          </button>

          <button type="button" className="btn btn-secondary" style={{ gridColumn: 'span 2' }} onClick={() => handleDigit('0')}>0</button>
          <button type="button" className="btn btn-secondary" onClick={handleDecimal}>.</button>
          <button type="button" className="btn btn-success" style={{ fontWeight: 'bold', fontSize: '1.2rem' }} onClick={handleCalculate}>
            =
          </button>
        </div>

      </div>
    </div>
  );
}
