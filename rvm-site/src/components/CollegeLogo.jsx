import React from 'react';

/**
 * CollegeLogo Component
 * Displays the college logo in the top right corner of all pages.
 * Positioned fixed to ensure it stays visible during scroll.
 */
const CollegeLogo = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 0 10px rgba(0,255,65,0.15))',
      marginLeft: '1rem', // Space from nav links/buttons
    }}>
      <div style={{
        background: 'rgba(5,8,5,0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '0.8rem',
        borderRadius: '16px',
        border: '1px solid rgba(0,255,65,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,65,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = 'rgba(0,255,65,0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      >
        <img 
          src="/assets/college-logo.png" 
          alt="College Logo" 
          style={{
            height: 'clamp(44px, 7vw, 58px)',
            width: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default CollegeLogo;
