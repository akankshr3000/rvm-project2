import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Robust safety wrapper for dynamic images that might 404
function AvatarImage({ src, alt, fallback }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{fallback}</span>;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  );
}

export default function ContributorCarousel({ team }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 900; // Threshold for breaking Flex Row into Flex Column

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % team.length);
  }, [team.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + team.length) % team.length);
  }, [team.length]);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(nextSlide, 5000); // Slightly longer for reading
      return () => clearInterval(timer);
    }
  }, [isHovered, nextSlide]);

  const activeMember = team[currentIndex];

  // Stacked Coverflow Variants
  const getAvatarVariants = (positionIndex) => {
    if (positionIndex === 0) return { x: 0, scale: 1.05, rotateZ: 0, zIndex: 10, opacity: 1, filter: 'blur(0px)' };
    if (positionIndex === 1) return { x: 140, scale: 0.85, rotateZ: 10, zIndex: 5, opacity: 0.5, filter: 'blur(4px)' };
    if (positionIndex === -1) return { x: -140, scale: 0.85, rotateZ: -10, zIndex: 5, opacity: 0.5, filter: 'blur(4px)' };
    return { x: 0, scale: 0.6, rotateZ: 0, zIndex: 0, opacity: 0, filter: 'blur(10px)' };
  };

  const arrowStyle = {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', color: '#00ff88',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none', WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div 
      style={{ 
        width: '100%', 
        maxWidth: 1200, 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        background: 'linear-gradient(145deg, rgba(0,255,65,0.03), rgba(0,0,0,0.4))',
        border: '1px solid rgba(0,255,65,0.1)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LEFT SIDE: 3D Stacked Images */}
      <div style={{
        flex: isMobile ? 'none' : '0 0 50%',
        padding: '4rem 1rem',
        borderRight: isMobile ? 'none' : '1px solid rgba(0,255,65,0.1)',
        borderBottom: isMobile ? '1px solid rgba(0,255,65,0.1)' : 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(5,8,5,0.5)',
        overflow: 'hidden'
      }}>
        
        <div style={{ position: 'relative', height: 420, width: '100%', maxWidth: 450, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AnimatePresence initial={false}>
            {team.map((member, index) => {
              let relativeIndex = index - currentIndex;
              if (relativeIndex > Math.floor(team.length / 2)) relativeIndex -= team.length;
              else if (relativeIndex < -Math.floor((team.length - 1) / 2)) relativeIndex += team.length;

              return (
                <motion.div
                  key={member.name + "-img"}
                  initial={false}
                  animate={getAvatarVariants(relativeIndex)}
                  transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
                  style={{
                    position: 'absolute', width: 280, height: 400, borderRadius: '24px',
                    background: relativeIndex === 0 ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)',
                    border: relativeIndex === 0 ? '2px solid #00ff88' : '1px solid rgba(0,255,136,0.1)',
                    boxShadow: relativeIndex === 0 ? '0 20px 50px rgba(0,255,136,0.25)' : '0 10px 30px rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4.5rem', fontWeight: 700, color: relativeIndex === 0 ? '#00ff88' : 'rgba(232,245,232,0.3)',
                    cursor: relativeIndex === 0 ? 'default' : 'pointer', pointerEvents: Math.abs(relativeIndex) <= 1 ? 'auto' : 'none',
                    overflow: 'hidden', zIndex: 10 - Math.abs(relativeIndex)
                  }}
                  onClick={() => {
                    if (relativeIndex === 1) nextSlide();
                    if (relativeIndex === -1) prevSlide();
                  }}
                >
                  <AvatarImage 
                    src={member.src} 
                    alt={member.name} 
                    fallback={member.name[0].toUpperCase()} 
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', zIndex: 20 }}>
          <button onClick={prevSlide} style={arrowStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={nextSlide} style={arrowStyle}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,136,0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Info Payload */}
      <div style={{
        flex: 1, padding: isMobile ? '3rem 2rem' : '4rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative'
      }}>
        {/* Faint ambient quote icon */}
        {activeMember.description && (
          <div style={{ position: 'absolute', top: 30, right: 30, fontSize: '8rem', color: 'rgba(0,255,65,0.03)', fontFamily: "serif", lineHeight: 1 }}>"</div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMember.name}
            initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -30, filter: 'blur(5px)' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <h3 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 700, color: '#00ff88', marginBottom: '0.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
              {activeMember.name}
            </h3>
            
            {activeMember.role && (
              <div className="mono" style={{ fontSize: '0.9rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.1em', marginBottom: '2rem', textTransform: 'uppercase' }}>
                {activeMember.role}
              </div>
            )}
            
            {activeMember.description && (
              <p style={{ 
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'rgba(232,245,232,0.8)', 
                lineHeight: 1.8, fontFamily: "'Inter', sans-serif", maxWidth: 600 
              }}>
                "{activeMember.description}"
              </p>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    
    </div>
  );
}
