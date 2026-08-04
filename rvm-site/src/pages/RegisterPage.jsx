import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import PinPad from '../components/PinPad';
import api from '../utils/api';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ name: '', email: '', usn: '', empId: '' });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'pin' | 'confirmPin'
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [googleUser, setGoogleUser] = useState(null);
  const [googlePin, setGooglePin] = useState('');
  const [registrationToken, setRegistrationToken] = useState(null);
  const toastTimeoutRef = useRef(null);
  
  const showToast = (msg, duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };
  const [timer, setTimer] = useState(0);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.redirectMessage || null;
 
  // Timer for Resend OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleGoogleUsnSubmit = () => {
    const e = {};
    if (role === 'student' && !form.usn.trim()) e.usn = 'Enter your USN number';
    if (role === 'employee' && !form.empId.trim()) e.empId = 'Enter your Employee ID';
    if (Object.keys(e).length) { setErrors(e); return; }
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

    setSubmitting(true);
    try {
      const usnFinal = role === 'student' ? form.usn.trim().toUpperCase() : form.empId.trim().toUpperCase();
      const res = await api.post('/api/auth/googleRegister', {
        usn: usnFinal,
        name: googleUser.name,
        email: googleUser.email,
        pin: confirmPinValue,
        role,
      });

      const isSuccessMsg = res.data?.message?.includes('User registered') || res.data?.message?.includes('User created');
      const isSuccess = res.status === 200 || res.status === 201 || res.data?.success || isSuccessMsg;

      if (res.data?.message?.includes('already exists') || res.data?.error?.includes('already exists')) {
        showToast('User already exists. Redirecting to login...', 12000);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      if (isSuccess) {
        if (res.data?.data?.user && res.data?.data?.token) {
          login(res.data.data.user, res.data.data.token, keepLoggedIn);
        }

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
      } else {
        throw new Error(res.data?.message || res.data?.error || 'Registration failed');
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      const msg = data.message || data.error || err.message || 'Registration failed';

      if (msg.toLowerCase().includes('already exists')) {
        showToast('User already exists. Redirecting to login...', 12000);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const isFauxError = status === 200 || status === 201 || msg.includes('User registered') || msg.includes('User created');
      
      if (isFauxError) {
        if (data.data?.user && data.data?.token) {
          login(data.data.user, data.data.token, keepLoggedIn);
        }
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
        return;
      }

      setPinError(msg);
      setGooglePin('');
      setTimeout(() => {
        setPinError('');
        setStep('googleUsn');
      }, 12000);
    } finally {
      setSubmitting(false);
    }
  }, [form.usn, form.empId, role, googlePin, googleUser, login, navigate, keepLoggedIn]);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (role === 'student' && !form.usn.trim()) e.usn = 'Enter your USN number';
    if (role === 'employee' && !form.empId.trim()) e.empId = 'Enter your Employee ID';
    return e;
  };

  const handleNext = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    setSubmitting(true);
    try {
      const usn = role === 'student' ? form.usn.trim().toUpperCase() : form.empId.trim().toUpperCase();
      await api.post('/api/auth/register-send-otp', { usn, email: form.email.trim() });
      showToast('Verification code sent to email');
      setTimer(30);
      setTimeout(() => {
        setToast(null);
        setStep('otpVerify');
      }, 1000);
    } catch (err) {
      // 🔴 Explicit Network Error Log
      console.error("NETWORK ERROR in handleNext:", err);
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      
      if (msg.toLowerCase().includes('already exists')) {
        setToast('User already exists. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      showToast(msg, 12000);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerify = useCallback(async (enteredOtp) => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/auth/register-verify-otp', { email: form.email.trim(), otp: enteredOtp });
      if (res.data.success && res.data.registrationToken) {
        setRegistrationToken(res.data.registrationToken);
        setPinError('');
        // Change step immediately so PinPad unmounts and can't fire again
        setStep('pin');
        showToast('Email verified successfully!');
        setTimeout(() => setToast(null), 2000);
      }
    } catch (err) {
      setPinError(err.response?.data?.message || err.message || 'OTP verification failed');
      setTimeout(() => setPinError(''), 12000);
    } finally {
      setSubmitting(false);
    }
  }, [form.email]);

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/auth/resend-otp', { email: form.email.trim(), type: 'register' });
      if (res.data.success) {
        showToast('OTP resent successfully');
        setTimer(30);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resend OTP', 12000);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinSet = useCallback((enteredPin) => {
    setPin(enteredPin);
    setTimeout(() => setStep('confirmPin'), 300);
  }, []);

  const handlePinConfirm = useCallback(async (confirmPinValue) => {
    if (confirmPinValue !== pin) {
      setPinError("PINs don't match, try again");
      setPin('');
      setTimeout(() => {
        setPinError('');
        setStep('pin');
      }, 12000);
      return;
    }

    setSubmitting(true);
    try {
      const usn = role === 'student' ? form.usn.trim().toUpperCase() : form.empId.trim().toUpperCase();
      const res = await api.post('/api/auth/register', {
        usn,
        name: form.name.trim(),
        email: form.email.trim(),
        pin: confirmPinValue,
        role,
        registrationToken,
      });

      const isSuccessMsg = res.data?.message?.includes('User registered') || res.data?.message?.includes('User created');
      const isSuccess = res.status === 200 || res.status === 201 || res.data?.success || isSuccessMsg;

      if (res.data?.message?.includes('already exists') || res.data?.error?.includes('already exists')) {
        showToast('User already exists. Redirecting to login...', 12000);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      if (isSuccess) {
        if (res.data?.data?.user && res.data?.data?.token) {
          login(res.data.data.user, res.data.data.token, keepLoggedIn);
        }

        showToast(`Registration successful. Welcome!`);
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
        throw new Error(res.data?.message || res.data?.error || 'Registration failed');
      }
    } catch (err) {
      // 🔴 Explicit Network Error Log
      console.error("NETWORK ERROR in handlePinConfirm:", err);
      const status = err.response?.status;
      const data = err.response?.data || {};
      const msg = data.message || data.error || err.message || 'Registration failed';

      if (msg.toLowerCase().includes('already exists')) {
        showToast('User already exists. Redirecting to login...', 12000);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const isFauxError = status === 200 || status === 201 || msg.includes('User registered') || msg.includes('User created');
      
      if (isFauxError) {
        if (data.data?.user && data.data?.token) {
          login(data.data.user, data.data.token, keepLoggedIn);
        }
        showToast(`Registration successful. Welcome!`);
        setTimeout(() => {
          const pendingToken = sessionStorage.getItem('pending_claim_token');
          if (pendingToken) {
            sessionStorage.removeItem('pending_claim_token');
            navigate(`/claim?token=${pendingToken}`);
          } else {
            navigate('/dashboard');
          }
        }, 1000);
        return;
      }

      setPinError(msg);
      setPin('');
      setTimeout(() => {
        setPinError('');
        setStep('form');
      }, 12000);
    } finally {
      setSubmitting(false);
    }
  }, [pin, form, role, registrationToken, login, navigate, keepLoggedIn]);

  const handleGoogleSignup = useGoogleLogin({
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
            
            setToast(`Welcome back, ${data.user.name}! Redirecting...`);
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
      console.error("Google signup failed:", err);
      showToast('Google signup failed', 12000);
      setTimeout(() => setToast(null), 3000);
    }
  });

  const inputStyle = (err) => ({
    width: '100%', padding: '0.9rem 1rem',
    background: 'rgba(0,255,65,0.04)',
    border: `1px solid ${err ? '#ef4444' : 'rgba(0,255,65,0.15)'}`,
    borderRadius: 8,
    color: '#e8f5e8',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8rem',
    outline: 'none',
    transition: 'border-color 0.2s',
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
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#00ff41', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 16, height: 1, background: '#00ff41', display: 'inline-block' }} /> REGISTRATION
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '0.5rem' }}>
          Join the<br /><span style={{ color: '#00ff41' }}>eco-loop.</span>
        </h1>
        <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Register once. Earn forever. Your QR is your key.
        </p>

        {/* Redirect banner from login page */}
        {redirectMessage && (
          <div style={{
            background: 'rgba(251,188,5,0.08)',
            border: '1px solid rgba(251,188,5,0.35)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
          }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>⚠️</span>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              color: 'rgba(251,220,100,0.9)',
              lineHeight: 1.5,
            }}>{redirectMessage}</span>
          </div>
        )}

        {step === 'form' && (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => { setRole('student'); setErrors({}); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 8,
                  background: role === 'student' ? 'rgba(0,255,65,0.1)' : 'transparent',
                  border: `1px solid ${role === 'student' ? '#00ff41' : 'rgba(0,255,65,0.15)'}`,
                  color: role === 'student' ? '#00ff41' : 'rgba(232,245,232,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >STUDENT</button>
              <button
                onClick={() => { setRole('employee'); setErrors({}); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 8,
                  background: role === 'employee' ? 'rgba(0,255,65,0.1)' : 'transparent',
                  border: `1px solid ${role === 'employee' ? '#00ff41' : 'rgba(0,255,65,0.15)'}`,
                  color: role === 'employee' ? '#00ff41' : 'rgba(232,245,232,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >EMPLOYEE</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle(errors.name)} placeholder="Enter your full name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#00ff41'}
                  onBlur={e => e.target.style.borderColor = errors.name ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                />
                {errors.name && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.name}</div>}
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle(errors.email)} placeholder="e.g. user@gmail.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#00ff41'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                  type="email"
                />
                {errors.email && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.email}</div>}
              </div>

              {role === 'student' ? (
                <div>
                  <label style={labelStyle}>USN Number</label>
                  <input style={{...inputStyle(errors.usn), textTransform: 'uppercase', fontFamily: "'Space Mono', 'Inter', monospace"}}
                    placeholder="e.g. 1RV20CS001" value={form.usn}
                    onChange={e => setForm({ ...form, usn: e.target.value.toUpperCase() })}
                    onFocus={e => e.target.style.borderColor = '#00ff41'}
                    onBlur={e => e.target.style.borderColor = errors.usn ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                  />
                  {errors.usn && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.usn}</div>}
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Employee ID</label>
                  <input style={{...inputStyle(errors.empId), textTransform: 'uppercase', fontFamily: "'Space Mono', 'Inter', monospace"}}
                    placeholder="e.g. EMP12345" value={form.empId}
                    onChange={e => setForm({ ...form, empId: e.target.value.toUpperCase() })}
                    onFocus={e => e.target.style.borderColor = '#00ff41'}
                    onBlur={e => e.target.style.borderColor = errors.empId ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                  />
                  {errors.empId && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.empId}</div>}
                </div>
              )}


              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'rgba(232,245,232,0.6)', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif", fontSize: '0.75rem',
                marginBottom: '-0.25rem', marginTop: '-0.5rem',
                WebkitTapHighlightColor: 'transparent'
              }}>
                <input
                  type="checkbox"
                  checked={keepLoggedIn}
                  onChange={e => setKeepLoggedIn(e.target.checked)}
                  style={{ accentColor: '#00ff41', cursor: 'pointer', width: 14, height: 14 }}
                /> Keep me logged in
              </label>

              <button onClick={handleNext} style={{
                width: '100%', padding: '1rem',
                background: '#00ff41', color: '#050805',
                border: 'none', borderRadius: 8,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '0.05em', cursor: 'pointer',
                boxShadow: '0 0 30px rgba(0,255,65,0.25)',
                marginTop: '0.5rem', transition: 'all 0.2s',
              }}>CONTINUE →</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(232,245,232,0.1)' }} />
                <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)' }}>OR continue with</div>
                <div style={{ flex: 1, height: 1, background: 'rgba(232,245,232,0.1)' }} />
              </div>

              <button onClick={handleGoogleSignup} type="button" className="google-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ color: 'rgba(232,245,232,0.4)', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif" }}>
                  Already have an account?{' '}
                </span>
                <Link to="/login" style={{ color: '#00ff41', textDecoration: 'none', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  Log in
                </Link>
              </div>
            </div>
          </>
        )}

        {step === 'otpVerify' && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('form')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>← Back to form</button>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#00ff41', marginBottom: '1rem', textAlign: 'center' }}>
              We sent a 4-digit code to {form.email}
            </div>
            <PinPad
              key="otp"
              label="Enter Verification Code"
              onComplete={handleOtpVerify}
              error={pinError}
              onClearError={() => setPinError('')}
            />
            {submitting && (
              <div style={{
                textAlign: 'center', marginTop: '1.5rem',
                color: 'rgba(232,245,232,0.5)',
                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              }}>Verifying code...</div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button 
                onClick={handleResendOtp}
                disabled={timer > 0 || submitting}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: (timer > 0 || submitting) ? 'rgba(232,245,232,0.3)' : '#00ff41',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.75rem',
                  cursor: (timer > 0 || submitting) ? 'default' : 'pointer',
                  transition: 'color 0.2s'
                }}
              >
                {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
              </button>
            </div>
          </div>
        )}

        {step === 'pin' && (
          <div style={{ marginTop: '1rem' }}>
            <button onClick={() => setStep('otpVerify')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>← Back to verification</button>
            <PinPad
              label="Set your 4-digit PIN"
              onComplete={handlePinSet}
              error=""
              onClearError={() => {}}
            />
          </div>
        )}

        {step === 'confirmPin' && (
          <div style={{ marginTop: '1rem' }}>
            <PinPad
              key="confirm"
              label="Confirm your PIN"
              onComplete={handlePinConfirm}
              error={pinError}
              onClearError={() => setPinError('')}
            />
            {submitting && (
              <div style={{
                textAlign: 'center', marginTop: '1.5rem',
                color: 'rgba(232,245,232,0.5)',
                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              }}>Creating your account...</div>
            )}
          </div>
        )}

        {step === 'googleUsn' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <button onClick={() => setStep('form')} style={{
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', cursor: 'pointer',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: 0
            }}>← Cancel</button>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#00ff41', marginBottom: '0.5rem' }}>
              Link your USN to {googleUser?.name}'s Google Account
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <button
                onClick={() => { setRole('student'); setErrors({}); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 8,
                  background: role === 'student' ? 'rgba(0,255,65,0.1)' : 'transparent',
                  border: `1px solid ${role === 'student' ? '#00ff41' : 'rgba(0,255,65,0.15)'}`,
                  color: role === 'student' ? '#00ff41' : 'rgba(232,245,232,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >STUDENT</button>
              <button
                onClick={() => { setRole('employee'); setErrors({}); }}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: 8,
                  background: role === 'employee' ? 'rgba(0,255,65,0.1)' : 'transparent',
                  border: `1px solid ${role === 'employee' ? '#00ff41' : 'rgba(0,255,65,0.15)'}`,
                  color: role === 'employee' ? '#00ff41' : 'rgba(232,245,232,0.4)',
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >EMPLOYEE</button>
            </div>

            {role === 'student' ? (
              <div>
                <label style={labelStyle}>USN Number</label>
                <input style={{...inputStyle(errors.usn), textTransform: 'uppercase', fontFamily: "'Space Mono', 'Inter', monospace"}}
                  placeholder="e.g. 1RV20CS001" value={form.usn}
                  onChange={e => setForm({ ...form, usn: e.target.value.toUpperCase() })}
                  onFocus={e => e.target.style.borderColor = '#00ff41'}
                  onBlur={e => e.target.style.borderColor = errors.usn ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                />
                {errors.usn && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.usn}</div>}
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Employee ID</label>
                <input style={{...inputStyle(errors.empId), textTransform: 'uppercase', fontFamily: "'Space Mono', 'Inter', monospace"}}
                  placeholder="e.g. EMP12345" value={form.empId}
                  onChange={e => setForm({ ...form, empId: e.target.value.toUpperCase() })}
                  onFocus={e => e.target.style.borderColor = '#00ff41'}
                  onBlur={e => e.target.style.borderColor = errors.empId ? '#ef4444' : 'rgba(0,255,65,0.15)'}
                />
                {errors.empId && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{errors.empId}</div>}
              </div>
            )}

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
            <PinPad label="Set your 4-digit PIN" onComplete={handleGooglePinSet} error="" onClearError={() => {}} />
          </div>
        )}

        {step === 'googleConfirmPin' && (
          <div style={{ marginTop: '1rem' }}>
            <PinPad key="confirm" label="Confirm your PIN" onComplete={handleGooglePinConfirm} error={pinError} onClearError={() => setPinError('')} />
            {submitting && (
              <div style={{
                textAlign: 'center', marginTop: '1.5rem',
                color: 'rgba(232,245,232,0.5)',
                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
              }}>Linking account...</div>
            )}
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
