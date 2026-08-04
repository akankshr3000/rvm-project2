import { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import PinPad from '../components/PinPad';
import api from '../utils/api';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [usn, setUsn] = useState('');
  const [usnError, setUsnError] = useState('');
  const [step, setStep] = useState('usn'); // 'usn' | 'pin'
  const [pinError, setPinError] = useState('');
  const [toast, setToast] = useState(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [googleUser, setGoogleUser] = useState(null);
  const [googlePin, setGooglePin] = useState('');
  const toastTimeoutRef = useRef(null);
  const showToast = (msg, duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleGoogleUsnSubmit = () => {
    if (!usn.trim()) {
      setUsnError('Enter your USN number');
      return;
    }
    setUsnError('');
    setStep('googlePin');
  };

  const handleGooglePinSet = useCallback((enteredPin) => {
    setGooglePin(enteredPin);
    setTimeout(() => setStep('googleConfirmPin'), 300);
  }, []);

  const handleGooglePinConfirm = useCallback(async (confirmPinValue) => {
    if (confirmPinValue !== googlePin) {
      setPinError("PINs don't match, try again");
      setGooglePin('');
      setTimeout(() => {
        setPinError('');
        setStep('googlePin');
      }, 12000);
      return;
    }

    try {
      const res = await api.post('/api/auth/googleRegister', {
        usn: usn.trim().toUpperCase(),
        name: googleUser.name,
        email: googleUser.email,
        pin: confirmPinValue,
        role: 'student'
      });

      if (res.data.success) {
        login(res.data.data.user, res.data.data.token, keepLoggedIn);

        showToast(`Registration complete! Redirecting...`);
        setTimeout(() => {
          const pendingToken = sessionStorage.getItem('pending_claim_token');
          if (pendingToken) {
            sessionStorage.removeItem('pending_claim_token');
            navigate(`/claim?token=${pendingToken}`);
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      setPinError(err.response?.data?.message || 'Registration failed');
      setGooglePin('');
      setTimeout(() => {
        setPinError('');
        setStep('googleUsn');
      }, 12000);
    }
  }, [usn, googlePin, googleUser, login, navigate, keepLoggedIn]);

  const [usnChecking, setUsnChecking] = useState(false);

  const handleUsnSubmit = async () => {
    if (!usn.trim()) {
      setUsnError('Enter your USN number');
      return;
    }
    setUsnError('');
    setUsnChecking(true);
    try {
      await api.get(`/api/auth/check-user/${usn.trim()}`);
      // User exists — proceed to PIN
      setStep('pin');
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.exists === false) {
        // Confirmed: USN not in database — redirect to register
        navigate('/register', {
          state: {
            redirectMessage: `No account found for "${usn.trim().toUpperCase()}". Please register first.`,
          },
        });
      } else {
        // Route not found, server error, network issue — show error, stay on USN step
        setUsnError('USN not recognised. Please check and try again.');
      }
    } finally {
      setUsnChecking(false);
    }
  };

  const handlePinComplete = useCallback(async (pinValue) => {
    try {
      const res = await api.post('/api/auth/login', {
        usn: usn.trim().toUpperCase(),
        pin: pinValue,
      });

      if (res.data.success) {
        login(res.data.data.user, res.data.data.token, keepLoggedIn);

        showToast(`Login successful. Welcome back!`);
        setTimeout(() => {
          const pendingToken = sessionStorage.getItem('pending_claim_token');
          if (pendingToken) {
            sessionStorage.removeItem('pending_claim_token');
            navigate(`/claim?token=${pendingToken}`);
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Incorrect USN or PIN';

      // 401 with "Incorrect USN" means the user doesn't exist — send them to register
      if (status === 401 && msg.toLowerCase().includes('incorrect usn')) {
        navigate('/register', {
          state: {
            redirectMessage: `No account found for "${usn.trim().toUpperCase()}". Please register first.`,
          },
        });
        return;
      }

      setPinError(msg);
    }
  }, [usn, login, navigate]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = googleRes.data;

        try {
          const resApi = await api.post('/api/auth/google', { email: userInfo.email });
          const { isNew, data } = resApi.data;

          if (!isNew && data) {
            login(data.user, data.token, keepLoggedIn);

            showToast(`Welcome back, ${data.user.name}! Redirecting...`);
            setTimeout(() => {
              const pendingToken = sessionStorage.getItem('pending_claim_token');
              if (pendingToken) {
                sessionStorage.removeItem('pending_claim_token');
                navigate(`/claim?token=${pendingToken}`);
              } else {
                navigate('/dashboard');
              }
            }, 1000);
          } else {
            // New user needs to register USN and Pin
            const tempUser = {
              id: userInfo.sub || userInfo.id,
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture,
            };
            setGoogleUser(tempUser);
            setStep('googleUsn');
          }
        } catch (backendErr) {
          console.error("Backend auth error:", backendErr);
          const errorDesc = backendErr.response?.data?.message || backendErr.message || String(backendErr);
          showToast("Auth Error: " + errorDesc, 12000);
          setTimeout(() => setToast(null), 5000);
        }
      } catch (googleErr) {
        console.error("Google user info error:", googleErr);
        const gErrDesc = googleErr.response?.data?.error_description || googleErr.message || String(googleErr);
        showToast("Google Auth Error: " + gErrDesc, 12000);
        setTimeout(() => setToast(null), 5000);
      }
    },
    onError: (err) => {
      console.error("Google login failed:", err);
      showToast('Google login failed', 12000);
      setTimeout(() => setToast(null), 3000);
    }
  });

  const inputStyle = (err) => ({
    width: '100%', padding: '0.9rem 1rem',
    background: 'rgba(0,255,65,0.04)',
    border: `1px solid ${err ? '#ef4444' : 'rgba(0,255,65,0.15)'}`,
    borderRadius: 8,
    color: '#e8f5e8',
    fontFamily: "'Space Mono', 'Inter', monospace",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  });

  const labelStyle = {
    display: 'block',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.62rem',
    letterSpacing: '0.12em',
    color: 'rgba(232,245,232,0.4)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#00ff41', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 16, height: 1, background: '#00ff41', display: 'inline-block' }} /> WELCOME BACK
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '0.5rem' }}>
          Welcome back.<br /><span style={{ color: '#00ff41' }}>to the eco-loop.</span>
        </h1>
        <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Track your coins and see your impact.
        </p>

        {step === 'usn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>USN Number</label>
              <input
                style={inputStyle(usnError)}
                placeholder="e.g. 1RV20CS001"
                value={usn}
                onChange={e => { setUsn(e.target.value.toUpperCase()); setUsnError(''); }}
                onFocus={e => e.target.style.borderColor = '#00ff41'}
                onBlur={e => e.target.style.borderColor = usnError ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                onKeyDown={e => { if (e.key === 'Enter') handleUsnSubmit(); }}
              />
              {usnError && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{usnError}</div>}
            </div>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: 'rgba(232,245,232,0.6)', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
              marginBottom: '-0.25rem', marginTop: '-0.25rem',
              WebkitTapHighlightColor: 'transparent'
            }}>
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={e => setKeepLoggedIn(e.target.checked)}
                style={{ accentColor: '#00ff41', cursor: 'pointer', width: 14, height: 14 }}
              /> Keep me logged in
            </label>

            <button onClick={handleUsnSubmit} disabled={usnChecking} style={{
              width: '100%', padding: '1rem',
              background: '#00ff41', color: '#050805',
              border: 'none', borderRadius: 8,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.05em', cursor: usnChecking ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 30px rgba(0,255,65,0.25)',
              transition: 'all 0.2s',
              opacity: usnChecking ? 0.7 : 1,
            }}>{usnChecking ? 'CHECKING...' : 'CONTINUE →'}</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(232,245,232,0.1)' }} />
              <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)' }}>OR continue with</div>
              <div style={{ flex: 1, height: 1, background: 'rgba(232,245,232,0.1)' }} />
            </div>

            <button onClick={handleGoogleLogin} type="button" className="google-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <span style={{ color: 'rgba(232,245,232,0.4)', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif" }}>
                New here?{' '}
              </span>
              <Link to="/register" style={{ color: '#00ff41', textDecoration: 'none', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                Register →
              </Link>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div>
            <button onClick={() => setStep('usn')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>← Back</button>

            <div style={{
              textAlign: 'center', marginBottom: '1.5rem',
              fontFamily: "'Space Mono', 'Inter', monospace",
              fontSize: '0.8rem', color: '#00ff41',
              letterSpacing: '0.1em',
            }}>
              {usn}
            </div>

            <PinPad
              label="Enter your PIN"
              onComplete={handlePinComplete}
              error={pinError}
              onClearError={() => setPinError('')}
            />

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/forgot-pin" style={{
                color: '#00ff41',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                textShadow: '0 0 10px rgba(0,255,65,0.4)',
                transition: 'all 0.2s'
              }}
                onMouseEnter={(e) => e.target.style.textShadow = '0 0 15px rgba(0,255,65,0.8)'}
                onMouseLeave={(e) => e.target.style.textShadow = '0 0 10px rgba(0,255,65,0.4)'}
              >
                Forgot PIN?
              </Link>
            </div>
          </div>
        )}

        {step === 'googleUsn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <button onClick={() => setStep('usn')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: 0
            }}>← Cancel</button>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#00ff41', marginBottom: '0.5rem' }}>
              Link your USN to {googleUser?.name}'s Google Account
            </div>
            <div>
              <label style={labelStyle}>USN Number</label>
              <input
                style={inputStyle(usnError)}
                placeholder="e.g. 1RV20CS001"
                value={usn}
                onChange={e => { setUsn(e.target.value.toUpperCase()); setUsnError(''); }}
                onFocus={e => e.target.style.borderColor = '#00ff41'}
                onBlur={e => e.target.style.borderColor = usnError ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                onKeyDown={e => { if (e.key === 'Enter') handleGoogleUsnSubmit(); }}
              />
              {usnError && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{usnError}</div>}
            </div>
            <button onClick={handleGoogleUsnSubmit} style={{
              width: '100%', padding: '1rem',
              background: '#00ff41', color: '#050805',
              border: 'none', borderRadius: 8,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.05em', cursor: 'pointer', boxShadow: '0 0 30px rgba(0,255,65,0.25)', transition: 'all 0.2s',
            }}>CONTINUE →</button>
          </div>
        )}

        {step === 'googlePin' && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('googleUsn')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>← Back</button>
            <PinPad label="Set your 4-digit PIN" onComplete={handleGooglePinSet} error="" onClearError={() => { }} />
          </div>
        )}

        {step === 'googleConfirmPin' && (
          <div style={{ marginTop: '1rem' }}>
            <PinPad key="confirm" label="Confirm your PIN" onComplete={handleGooglePinConfirm} error={pinError} onClearError={() => setPinError('')} />
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,255,65,0.15)', border: '1px solid rgba(0,255,65,0.3)',
          borderRadius: 8, padding: '0.8rem 1.5rem',
          color: '#00ff41', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
          zIndex: 9999, backdropFilter: 'blur(12px)',
          animation: 'slideDown 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
