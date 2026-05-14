import React from 'react';

function Logo({ size = 'medium' }) {
  const sizes = {
    small: { width: 80, height: 44, fontSize: 28, textSize: 10 },
    medium: { width: 150, height: 82, fontSize: 52, textSize: 12 },
    large: { width: 200, height: 110, fontSize: 72, textSize: 14 }
  };

  const s = sizes[size];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: `${s.fontSize}px`,
        fontWeight: 'bold',
        color: '#c9a961',
        letterSpacing: '2px',
        fontFamily: 'Georgia, serif',
        lineHeight: '1',
        marginBottom: '4px'
      }}>
        S.S
      </div>
      <div style={{
        fontSize: `${s.textSize}px`,
        color: '#c9a961',
        letterSpacing: '3px',
        fontFamily: 'Georgia, serif',
        fontWeight: '500'
      }}>
        JEWELLERS
      </div>
    </div>
  );
}

export default Logo;
