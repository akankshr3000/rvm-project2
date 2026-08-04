import { Link } from 'react-router-dom';

export default function SimulatePage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '4rem', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ 
        padding: '3rem clamp(1.5rem, 5vw, 5rem) 2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        textAlign: 'center'
      }}>
        <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff41', letterSpacing: '0.2em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} /> WATCH DEMO <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} />
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '0.01em' }}>
          Machine <span style={{ color: '#00ff41' }}>Demonstration</span>
        </h1>
      </div>

      {/* Main layout */}
      <div style={{
        padding: '0 clamp(1.5rem, 5vw, 5rem) 2rem',
        maxWidth: 1024, margin: '0 auto', width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* Video Player */}
        <div style={{ 
          position: 'relative', 
          width: '100%',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            borderRadius: '1rem', 
            overflow: 'hidden', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
            background: 'rgba(0, 5, 0, 0.5)',
            backdropFilter: 'blur(10px)',
          }}>
            <video 
              controls 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full rounded-2xl"
              style={{
                width: '100%',
                display: 'block',
                borderRadius: '1rem',
                objectFit: 'cover'
              }}
            >
              <source src="/videos/rvm-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Optional Overlay Text */}
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              background: 'rgba(0, 5, 0, 0.7)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 8px #00ff88',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span className="mono" style={{ fontSize: '0.65rem', color: '#00ff88', letterSpacing: '0.1em' }}>
                Real-time RVM Demonstration
              </span>
            </div>
          </div>
          
          <div style={{
            marginTop: '2rem',
            padding: '1.25rem 2rem',
            background: 'rgba(0, 255, 65, 0.05)',
            border: '1px solid rgba(0, 255, 65, 0.1)',
            borderRadius: '0.75rem',
            color: 'rgba(232, 245, 232, 0.7)',
            fontSize: '0.95rem',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            maxWidth: '650px',
            lineHeight: 1.6
          }}>
            This demo shows how bottles are processed and rewards are credited in real-time.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
