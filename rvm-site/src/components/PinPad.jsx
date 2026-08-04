import { useState, useCallback } from 'react';

const PinPad = ({ label = 'Enter your PIN', onComplete, error, onClearError }) => {
  const [pin, setPin] = useState([]);
  const [pressing, setPressing] = useState(null);

  const handleDigit = useCallback((digit) => {
    if (onClearError) onClearError();
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = [...prev, digit];
      if (next.length === 4) {
        setTimeout(() => onComplete?.(next.join('')), 200);
      }
      return next;
    });
  }, [onComplete, onClearError]);

  const handleBackspace = useCallback(() => {
    if (onClearError) onClearError();
    setPin((prev) => prev.slice(0, -1));
  }, [onClearError]);

  const reset = useCallback(() => {
    setPin([]);
  }, []);

  // Expose reset via parent
  PinPad.reset = reset;

  const buttons = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    '←', 0, '✓',
  ];

  return (
    <div style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
      {/* Label */}
      <div style={{
        fontFamily: "'Space Mono', 'Inter', monospace",
        fontSize: '0.72rem',
        color: 'rgba(232,245,232,0.4)',
        textAlign: 'center',
        marginBottom: '1.25rem',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '1.5rem',
        animation: error ? 'pinShake 0.5s ease-in-out' : 'none',
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: `2px solid ${error ? '#ef4444' : pin.length > i ? '#00ff41' : 'rgba(0,255,65,0.25)'}`,
              background: pin.length > i
                ? (error ? '#ef4444' : '#00ff41')
                : 'transparent',
              transition: 'all 0.15s ease',
              transform: pin.length === i + 1 && !error ? 'scale(1.2)' : 'scale(1)',
              boxShadow: pin.length > i && !error ? '0 0 12px rgba(0,255,65,0.4)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Error message */}
      <div style={{
        height: '1.5rem', // Reserved space for error to prevent layout shift
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.5rem',
      }}>
        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '0.72rem',
            textAlign: 'center',
            fontFamily: "'Inter', sans-serif",
            animation: 'errorFadeOut 12s forwards',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Number grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        justifyItems: 'center',
      }}>
        {buttons.map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (btn === '←') handleBackspace();
              else if (btn === '✓') { /* noop, auto-submits at 4 digits */ }
              else handleDigit(btn);
            }}
            onPointerDown={() => setPressing(btn)}
            onPointerUp={() => setPressing(null)}
            onPointerLeave={() => setPressing(null)}
            style={{
              width: 72,
              height: 72,
              minWidth: 72,
              minHeight: 72,
              borderRadius: 12,
              border: '1px solid rgba(0,255,65,0.15)',
              background: pressing === btn
                ? 'rgba(0,255,65,0.15)'
                : 'rgba(0,255,65,0.05)',
              color: btn === '✓'
                ? (pin.length === 4 ? '#00ff41' : 'rgba(232,245,232,0.2)')
                : '#e8f5e8',
              fontSize: '1.2rem',
              fontFamily: "'Space Mono', 'Inter', monospace",
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 80ms ease',
              transform: pressing === btn ? 'scale(0.92)' : 'scale(1)',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
            }}
          >
            {btn}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pinShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes errorFadeOut {
          0% { opacity: 0; transform: translateY(-5px); }
          5% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PinPad;
