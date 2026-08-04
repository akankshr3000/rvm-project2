import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import CollegeLogo from '../CollegeLogo';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close on back button
  useEffect(() => {
    const handlePop = () => setMobileOpen(false);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const getLinks = () => {
    if (isLoggedIn) {
      return [
        { to: '/', label: 'Home' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/admin', label: 'Admin' },
        { to: '/about', label: 'About' },
      ];
    }
    return [
      { to: '/', label: 'Home' },
      { to: '/register', label: 'Register' },
      { to: '/admin', label: 'Admin' },
      { to: '/about', label: 'About' },
    ];
  };

  const links = getLinks();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem clamp(1.25rem, 4vw, 2.5rem)',
        borderBottom: '1px solid rgba(0,255,65,0.08)',
        background: 'rgba(5,8,5,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', zIndex: 1001 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/assets/rvm-logo.png" 
              alt="RVM Logo" 
              style={{
                width: '70px',
                height: '70px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px rgba(0,255,65,0.3))',
              }}
            />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
              fontSize: '1.1rem', letterSpacing: '0.1em',
              color: '#e8f5e8',
              textTransform: 'uppercase',
            }}>RVM<span style={{ color: '#00ff41' }}>°</span></span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              textDecoration: 'none',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: '0.72rem', letterSpacing: '0.12em',
              color: location.pathname === to ? '#00ff41' : 'rgba(232,245,232,0.4)',
              transition: 'color 0.2s',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.target.style.color = '#00ff41'}
            onMouseLeave={e => e.target.style.color = location.pathname === to ? '#00ff41' : 'rgba(232,245,232,0.4)'}
            >{label}</Link>
          ))}
        </div>

        {/* Right side - Desktop */}
        <div className="nav-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(0,255,65,0.08)',
                border: '1px solid rgba(0,255,65,0.2)',
                borderRadius: '100px', padding: '0.35rem 0.9rem',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff41' }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.65rem', color: '#00ff41' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(0,255,65,0.15)',
                  borderRadius: 6,
                  color: 'rgba(232,245,232,0.5)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  padding: '0.4rem 0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(0,255,65,0.15)'; e.target.style.color = 'rgba(232,245,232,0.5)'; }}
              >Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                textDecoration: 'none',
                fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                fontWeight: 500, letterSpacing: '0.08em',
                color: 'rgba(232,245,232,0.5)',
                transition: 'color 0.2s',
                textTransform: 'uppercase',
              }}
              onMouseEnter={e => e.target.style.color = '#00ff41'}
              onMouseLeave={e => e.target.style.color = 'rgba(232,245,232,0.5)'}
              >Login</Link>
              <Link to="/register" style={{
                textDecoration: 'none',
                fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.65rem',
                color: '#050805',
                background: '#00ff41',
                borderRadius: '100px', padding: '0.4rem 1rem',
                fontWeight: 700, letterSpacing: '0.05em',
              }}>JOIN →</Link>
            </>
          )}
          <CollegeLogo />
        </div>

        {/* Hamburger - Mobile */}
        <button
          className="nav-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            zIndex: 1001,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          aria-label="Toggle menu"
        >
          <div style={{ width: 24, height: 18, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 0, width: 24, height: 2,
              background: '#e8f5e8', borderRadius: 1,
              transition: 'all 0.3s ease',
              top: mobileOpen ? 8 : 0,
              transform: mobileOpen ? 'rotate(45deg)' : 'none',
            }} />
            <span style={{
              position: 'absolute', left: 0, top: 8, width: 24, height: 2,
              background: '#e8f5e8', borderRadius: 1,
              transition: 'all 0.3s ease',
              opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              position: 'absolute', left: 0, width: 24, height: 2,
              background: '#e8f5e8', borderRadius: 1,
              transition: 'all 0.3s ease',
              top: mobileOpen ? 8 : 16,
              transform: mobileOpen ? 'rotate(-45deg)' : 'none',
            }} />
          </div>
        </button>

        {/* Mobile Logo Container */}
        <div className="nav-mobile-logo" style={{ display: 'none' }}>
           <CollegeLogo />
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className="nav-mobile-overlay"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5,8,5,0.97)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        {links.map(({ to, label }) => (
          <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
            textDecoration: 'none',
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '0.15em',
            color: location.pathname === to ? '#00ff41' : 'rgba(232,245,232,0.6)',
            padding: '1rem 2rem',
            minHeight: 56,
            display: 'flex',
            alignItems: 'center',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
            width: '100%',
            maxWidth: 300,
            justifyContent: 'center',
          }}>{label}</Link>
        ))}

        <div style={{ width: 60, height: 1, background: 'rgba(0,255,65,0.15)', margin: '0.5rem 0' }} />

        {isLoggedIn ? (
          <>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.8rem',
              color: '#00ff41',
              padding: '0.5rem',
            }}>
              {user?.name}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                color: '#ef4444',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                padding: '0.8rem 2rem',
                cursor: 'pointer',
                minHeight: 48,
                textTransform: 'uppercase',
                WebkitTapHighlightColor: 'transparent',
              }}
            >LOGOUT</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMobileOpen(false)} style={{
              textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem',
              fontWeight: 700,
              color: 'rgba(232,245,232,0.6)',
              padding: '0.8rem 2rem',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.1em',
            }}>LOGIN</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} style={{
              textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#050805',
              background: '#00ff41',
              borderRadius: 8,
              padding: '0.8rem 2rem',
              minHeight: 48,
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '0.05em',
            }}>REGISTER →</Link>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-right { display: none !important; }
          .nav-hamburger { display: block !important; }
          .nav-mobile-logo { display: block !important; }
        }
      `}</style>
    </>
  );
}
