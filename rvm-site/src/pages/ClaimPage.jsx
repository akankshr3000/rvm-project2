import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';

export default function ClaimPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuthStore();

  const [state, setState] = useState('loading'); // loading | valid | expired | claimed | success | error
  const [session, setSession] = useState(null);
  const [claimResult, setClaimResult] = useState(null);
  const [claiming, setClaiming] = useState(false);

  // Load session data
  useEffect(() => {
    if (!token) {
      setState('error');
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await api.get(`/api/machine/session/${token}`);
        if (res.data.success) {
          setSession(res.data.data);
          setState('valid');
        } else if (res.data.message === 'expired') {
          setSession(res.data.data);
          setState('expired');
        } else if (res.data.message === 'claimed') {
          setSession(res.data.data);
          setState('claimed');
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setState('error');
        } else {
          setState('error');
        }
      }
    };

    fetchSession();
  }, [token]);

  // Auto-claim if logged in and coming back from login with pending token
  useEffect(() => {
    if (isLoggedIn && state === 'valid' && !claiming) {
      // Check if we should auto-claim (coming from login redirect)
      const pendingToken = sessionStorage.getItem('pending_claim_token');
      if (pendingToken === token) {
        sessionStorage.removeItem('pending_claim_token');
        handleClaim();
      }
    }
  }, [isLoggedIn, state]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await api.post('/api/machine/claim', { token });
      if (res.data.success) {
        setClaimResult(res.data.data);
        setState('success');
        // Fire confetti
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#00ff41', '#ffffff', '#f59e0b'],
          });
        } catch {}
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Claim failed';
      if (msg === 'Already claimed') setState('claimed');
      else if (msg === 'QR code expired') setState('expired');
      else setState('error');
    } finally {
      setClaiming(false);
    }
  };

  const handleLoginToClaim = () => {
    sessionStorage.setItem('pending_claim_token', token);
    navigate('/login');
  };

  const capacityLabels = {
    small: 'Small Bottle · below 500ml',
    medium: 'Medium Bottle · 500ml',
    large: 'Large Bottle · above 500ml',
  };

  // Loading state
  if (state === 'loading' || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(0,255,65,0.15)',
          borderTopColor: '#00ff41',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Valid - ready to claim
  if (state === 'valid') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem', flexDirection: 'column',
      }}>
        {/* Floating bottle */}
        <div style={{
          fontSize: '4rem', marginBottom: '1.5rem',
          animation: 'float 2.5s ease-in-out infinite',
        }}>🍶</div>

        {/* Badge */}
        <div style={{
          fontFamily: "'Space Mono', 'Inter', monospace",
          fontSize: '0.72rem', color: '#00ff41',
          border: '1px solid rgba(0,255,65,0.25)',
          borderRadius: 100, padding: '0.5rem 1.25rem',
          marginBottom: '2rem', letterSpacing: '0.05em',
        }}>
          {session ? capacityLabels[session.bottle_capacity] || session.bottle_capacity : 'Bottle'}
        </div>

        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: '1.1rem',
          color: 'rgba(232,245,232,0.5)', marginBottom: '0.5rem',
        }}>You're about to earn</div>

        <div style={{
          fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 700,
          color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif",
          marginBottom: '2rem', lineHeight: 1,
        }}>
          +{session?.coins_value || 0} COINS
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleClaim}
            disabled={claiming}
            style={{
              width: '100%', maxWidth: 400, padding: '1rem',
              background: '#00ff41', color: '#050805',
              border: 'none', borderRadius: 8,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: '1rem',
              letterSpacing: '0.05em', cursor: 'pointer',
              minHeight: 56, transition: 'all 0.2s',
              boxShadow: '0 0 30px rgba(0,255,65,0.3)',
              opacity: claiming ? 0.7 : 1,
            }}
          >{claiming ? 'CLAIMING...' : 'CLAIM MY COINS →'}</button>
        ) : (
          <>
            <button
              onClick={handleLoginToClaim}
              style={{
                width: '100%', maxWidth: 400, padding: '1rem',
                background: '#00ff41', color: '#050805',
                border: 'none', borderRadius: 8,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700, fontSize: '1rem',
                letterSpacing: '0.05em', cursor: 'pointer',
                minHeight: 56, transition: 'all 0.2s',
                boxShadow: '0 0 30px rgba(0,255,65,0.3)',
              }}
            >LOGIN TO CLAIM →</button>
            <Link to="/register" style={{
              marginTop: '1rem', color: '#00ff41',
              fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              textDecoration: 'none',
            }}>New here? Register in 30 seconds →</Link>
          </>
        )}

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
        `}</style>
      </div>
    );
  }

  // Success
  if (state === 'success') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem', flexDirection: 'column', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(0,255,65,0.15)',
          border: '3px solid #00ff41',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', marginBottom: '1.5rem',
          animation: 'scaleIn 0.5s ease',
        }}>✓</div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Coins Credited!
        </h2>

        <div style={{
          fontSize: '1.2rem', color: '#00ff41',
          fontFamily: "'Inter', sans-serif", marginBottom: '0.5rem',
        }}>
          +{claimResult?.coins_earned} COINS added to your wallet
        </div>

        <div style={{
          fontSize: '0.8rem', color: 'rgba(232,245,232,0.4)',
          fontFamily: "'Space Mono', 'Inter', monospace", marginBottom: '2rem',
        }}>
          New balance: {claimResult?.new_balance} coins
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%', maxWidth: 400, padding: '1rem',
            background: '#00ff41', color: '#050805',
            border: 'none', borderRadius: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '0.9rem',
            letterSpacing: '0.05em', cursor: 'pointer',
            minHeight: 56,
          }}
        >VIEW MY DASHBOARD →</button>

        <style>{`
          @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // Expired
  if (state === 'expired') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 16, padding: '3rem 2rem',
          boxShadow: '0 0 40px rgba(239,68,68,0.08)',
          width: '100%', maxWidth: 460,
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏱</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>QR Code Expired</h2>
          <p style={{
            fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.8rem',
            color: 'rgba(232,245,232,0.4)', marginBottom: '0.5rem',
          }}>This QR was valid for 5 minutes.</p>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
            color: 'rgba(232,245,232,0.35)',
          }}>Please insert a new bottle at the machine.</p>
        </div>
      </div>
    );
  }

  // Already claimed
  if (state === 'claimed') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{
          textAlign: 'center', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 16, padding: '3rem 2rem',
          boxShadow: '0 0 40px rgba(245,158,11,0.08)',
          width: '100%', maxWidth: 460,
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✓</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Already Claimed</h2>
          <p style={{
            fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.8rem',
            color: 'rgba(232,245,232,0.4)',
          }}>These coins were already credited to an account.</p>
        </div>
      </div>
    );
  }

  // Error / invalid
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 460 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ef4444' }}>Invalid QR Code</h2>
        <p style={{
          fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.8rem',
          color: 'rgba(232,245,232,0.4)', marginBottom: '2rem',
        }}>This code is not valid or has already been used.</p>
        <button onClick={() => navigate('/dashboard')} style={{
          padding: '0.75rem 1.5rem',
          background: 'transparent', color: '#00ff41',
          border: '1px solid #00ff41', borderRadius: 8,
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
          fontSize: '0.9rem', cursor: 'pointer',
        }}>GO TO DASHBOARD</button>
      </div>
    </div>
  );
}
