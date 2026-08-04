import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PinPad from '../components/PinPad';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  // Navigation Steps: 'email' -> 'otp' -> 'reset' -> 'success'
  const [step, setStep] = useState('email');
  
  // Step 1: Identifier
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [displayEmail, setDisplayEmail] = useState(''); // Stores the masked email for display
  const [realEmail, setRealEmail] = useState(''); // Stores the actual email for API calls
  
  // Step 2: OTP
  const [otpArray, setOtpArray] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef([]);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState(false);
  
  // Step 3: Reset
  const [resetToken, setResetToken] = useState('');
  const [newPinError, setNewPinError] = useState('');
  const [firstPin, setFirstPin] = useState(null);
  const [isSamePinError, setIsSamePinError] = useState(false);

  // Global UI
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const navigate = useNavigate();

  // Reset resend timer logic
  useEffect(() => {
    let interval;
    if (step === 'otp') {
      if (resendTimer > 0) {
        setCanResend(false);
        interval = setInterval(() => {
          setResendTimer(prev => prev - 1);
        }, 1000);
      } else {
        setCanResend(true);
      }
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const showToast = (msg, duration = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  };

  const handleSendOTP = async () => {
    if (!identifier.trim()) {
      setIdentifierError('Enter your registered email or USN');
      return;
    }
    setIdentifierError('');
    setSubmitting(true);

    try {
      const res = await api.post('/api/auth/forgot-password', {
        identifier: identifier.trim()
      });

      if (res.data.success) {
        setDisplayEmail(res.data.displayEmail || identifier.trim());
        showToast('OTP successfully dispatched to your email.');
        setOtpSentNotice(true);
        // If coming from resend, don't change step, just clear OTP array
        if (step !== 'otp') {
          setStep('otp');
          setResendTimer(30);
        } else {
          setOtpArray(['', '', '', '']);
          if (otpInputs.current[0]) otpInputs.current[0].focus();
        }
      }
    } catch (err) {
      setIdentifierError(err.response?.data?.message || 'User not found or failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || submitting) return;
    setSubmitting(true);
    try {
      // Use the canonical email (realEmail) if we have it, else fall back to identifier
      const targetEmail = realEmail || identifier.trim();
      const res = await api.post('/api/auth/resend-otp', { email: targetEmail, type: 'forgot' });
      if (res.data.success) {
        showToast('OTP resent successfully');
        setOtpSentNotice(true);
        setResendTimer(30);
        setCanResend(false);
        setOtpArray(['', '', '', '']);
        if (otpInputs.current[0]) otpInputs.current[0].focus();
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const newOtp = [...otpArray];

    if (!val) {
      // Handles deletion
      newOtp[index] = '';
      setOtpArray(newOtp);
      return;
    }
    
    // Typing single digit
    newOtp[index] = val.slice(-1);
    setOtpArray(newOtp);
    setOtpError('');
    
    // Auto advance focus
    if (index < 3) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Auto reverse focus on backspace if box is currently empty
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpArray.join('');
    if (fullOtp.length !== 4) {
      setOtpError('Please fill in all 4 digits');
      return;
    }

    setSubmitting(true);
    setOtpError('');

    try {
      const res = await api.post('/api/auth/verify-otp', {
        identifier: identifier.trim(),
        otp: fullOtp
      });

      if (res.data.success) {
        setResetToken(res.data.resetToken);
        // Store the real email returned by the server for the reset call
        if (res.data.email) setRealEmail(res.data.email);
        setStep('reset');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP');
      setOtpArray(['', '', '', '']);
      if (otpInputs.current[0]) otpInputs.current[0].focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewPin = useCallback((pinValue) => {
    setFirstPin(pinValue);
    setNewPinError('');
    setIsSamePinError(false);
  }, []);

  const handleConfirmReset = useCallback(async (confirmPinValue) => {
    if (confirmPinValue !== firstPin) {
      setNewPinError("PINs don't match, try again");
      setFirstPin(null);
      setTimeout(() => setNewPinError(''), 12000);
      return;
    }

    setSubmitting(true);
    try {
      // Use the real email from verify-otp, falling back to identifier
      const emailForReset = realEmail || identifier.trim();
      console.log('RESET SENDING:', { email: emailForReset, resetToken, newPin: '****' });

      const res = await api.post('/api/auth/reset-password', {
        email: emailForReset,
        resetToken,
        newPin: confirmPinValue
      });

      console.log('RESET RESPONSE:', res.data);

      if (res.data.success) {
        showToast('PIN successfully reset! Redirecting to login...');
        // 🔥 Auto-redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.log('RESET ERROR:', err.response?.data);
      const errMsg = err.response?.data?.message || 'Reset failed';
      // Detect "same PIN" error from backend and show user-friendly message
      if (errMsg.toLowerCase().includes('same') && errMsg.toLowerCase().includes('pin')) {
        setNewPinError('Your new PIN cannot be the same as your current PIN. Please choose a different PIN.');
        setIsSamePinError(true);
        setFirstPin(null);
        // Don't auto-clear this error — user must enter a new PIN to dismiss it
      } else {
        setNewPinError(errMsg);
        setIsSamePinError(false);
        setFirstPin(null);
        setTimeout(() => setNewPinError(''), 12000);
      }
    } finally {
      setSubmitting(false);
    }
  }, [firstPin, realEmail, identifier, resetToken, navigate]);

  const inputStyle = (err) => ({
    width: '100%', padding: '0.9rem 1rem',
    background: 'rgba(0,255,65,0.04)',
    border: `1px solid ${err ? '#ef4444' : 'rgba(0,255,65,0.15)'}`,
    borderRadius: 8,
    color: '#e8f5e8',
    fontFamily: "'Space Mono', 'Inter', monospace",
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
    letterSpacing: '0.05em',
  });

  const otpBoxStyle = (err) => ({
    width: '3.5rem', height: '4rem',
    background: 'rgba(0,255,65,0.02)',
    border: `2px solid ${err ? '#ef4444' : 'rgba(0,255,65,0.15)'}`,
    borderRadius: 12,
    color: '#00ff41',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.75rem',
    fontWeight: 700,
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        
        {step !== 'success' && (
          <>
            <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#00ff41', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 16, height: 1, background: '#00ff41', display: 'inline-block' }} /> RECOVERY
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '0.5rem' }}>
              Reset your <span style={{ color: '#00ff41' }}>PIN.</span>
            </h1>
          </>
        )}

        {/* STEP 1: Email Input */}
        {step === 'email' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Enter your registered Email or USN to receive a 4-digit verification code.
            </p>

            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(232,245,232,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Email or USN
              </label>
              <input
                style={inputStyle(identifierError)}
                placeholder="e.g. user@rvm.com or 1RV20CS001"
                value={identifier}
                onChange={e => { setIdentifier(e.target.value); setIdentifierError(''); }}
                onFocus={(e) => { e.target.style.borderColor = '#00ff41'; e.target.style.boxShadow = '0 0 15px rgba(0,255,65,0.15) inset'; }}
                onBlur={(e) => { e.target.style.borderColor = identifierError ? '#ef4444' : 'rgba(0,255,65,0.15)'; e.target.style.boxShadow = 'none'; }}
                onKeyDown={e => { if (e.key === 'Enter') handleSendOTP(); }}
              />
              {identifierError && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{identifierError}</div>}
            </div>

            <button onClick={handleSendOTP} disabled={submitting} className="action-btn" style={{
              width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              background: submitting ? 'rgba(0,255,65,0.1)' : '#00ff41', color: submitting ? '#00ff41' : '#050805',
              border: '1px solid', borderColor: submitting ? 'rgba(0,255,65,0.3)' : '#00ff41', borderRadius: 8,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.05em', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '0.5rem'
            }}>
              {submitting ? (
                <><span className="spinner"></span> SENDING...</>
              ) : 'SEND OTP →'}
            </button>

            <Link to="/login" style={{
              textAlign: 'center', color: 'rgba(232,245,232,0.4)', textDecoration: 'none', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", marginTop: '1rem', transition: 'color 0.2s'
            }} onMouseEnter={e=>e.target.style.color='#00ff41'} onMouseLeave={e=>e.target.style.color='rgba(232,245,232,0.4)'}>
              ← Back to Login
            </Link>
          </div>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
              We've dispatched a secure code to <br/><b style={{color: '#00ff41', fontSize: '0.8rem'}}>{displayEmail}</b>
            </p>

            {/* OTP Sent Email Notice */}
            {otpSentNotice && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                animation: 'fadeIn 0.3s ease',
              }}>
                <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
                <p style={{
                  margin: 0, fontSize: '0.72rem', lineHeight: 1.55,
                  color: 'rgba(147, 197, 253, 0.95)',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  OTP has been sent to your registered email. If you don't receive it within a minute, please check your <b style={{ color: '#93c5fd' }}>Spam</b> or <b style={{ color: '#93c5fd' }}>Junk</b> folder.
                </p>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.62rem', letterSpacing: '0.12em', color: 'rgba(232,245,232,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                4-Digit OTP
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', margin: '1rem 0' }}>
                {otpArray.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpInputs.current[index] = el}
                    style={otpBoxStyle(otpError)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e, index)}
                    onKeyDown={e => handleOtpKeyDown(e, index)}
                    onFocus={e => { e.target.style.borderColor = '#00ff41'; e.target.style.boxShadow = '0 0 20px rgba(0,255,65,0.2) inset'; }}
                    onBlur={e => { e.target.style.borderColor = otpError ? '#ef4444' : 'rgba(0,255,65,0.15)'; e.target.style.boxShadow = 'none'; }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {otpError && <div style={{ color: '#ef4444', fontSize: '0.65rem', marginTop: 4, fontFamily: "'Inter', sans-serif", textAlign: 'center' }}>{otpError}</div>}
            </div>

            <button type="submit" disabled={submitting || otpArray.join('').length < 4} style={{
              width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              background: (submitting || otpArray.join('').length < 4) ? 'rgba(0,255,65,0.1)' : '#00ff41', 
              color: (submitting || otpArray.join('').length < 4) ? '#00ff41' : '#050805',
              border: '1px solid', borderColor: (submitting || otpArray.join('').length < 4) ? 'rgba(0,255,65,0.3)' : '#00ff41',
              borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.05em', cursor: (submitting || otpArray.join('').length < 4) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '0.5rem'
            }}>
              {submitting ? (
                <><span className="spinner"></span> VERIFYING...</>
              ) : 'VERIFY OTP →'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep('email')} style={{
                background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)', textDecoration: 'none', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'color 0.2s'
              }} onMouseEnter={e=>e.target.style.color='#00ff41'} onMouseLeave={e=>e.target.style.color='rgba(232,245,232,0.4)'}>
                ← Wrong email
              </button>

              <button type="button" onClick={handleResendOTP} disabled={!canResend || submitting} style={{
                background: 'transparent', border: 'none', color: canResend ? '#00ff41' : 'rgba(232,245,232,0.3)', textDecoration: 'none', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", cursor: canResend && !submitting ? 'pointer' : 'default', transition: 'color 0.2s'
              }}>
                {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset PIN */}
        {step === 'reset' && !firstPin && (
          <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            {/* Same PIN error alert */}
            {isSamePinError && newPinError && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                animation: 'fadeIn 0.3s ease',
              }}>
                <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                <p style={{
                  margin: 0, fontSize: '0.72rem', lineHeight: 1.55,
                  color: 'rgba(252, 165, 165, 0.95)',
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {newPinError}
                </p>
              </div>
            )}
            <PinPad
              label="Set your new 4-digit PIN"
              onComplete={handleNewPin}
              error={isSamePinError ? newPinError : ''}
              onClearError={() => { setNewPinError(''); setIsSamePinError(false); }}
            />
          </div>
        )}

        {step === 'reset' && firstPin && (
          <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
            <PinPad
              key="confirm"
              label="Confirm your new PIN"
              onComplete={handleConfirmReset}
              error={newPinError && !isSamePinError ? newPinError : ''}
              onClearError={() => setNewPinError('')}
            />
            {submitting && (
              <div style={{
                textAlign: 'center', marginTop: '1.5rem', color: '#00ff41',
                fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <span className="spinner"></span> Resetting your PIN...
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'scaleUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>🎉</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '1rem' }}>
              PIN reset <span style={{ color: '#00ff41' }}>successful.</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'rgba(232,245,232,0.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              Your account is secure. You can now log in.
            </p>
            
            <Link to="/login" style={{
              display: 'inline-block', width: '100%', padding: '1rem', boxSizing: 'border-box',
              background: '#00ff41', color: '#050805', border: 'none', borderRadius: 8, textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
              letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 30px rgba(0,255,65,0.25)'
            }}
            onMouseEnter={e => e.target.style.boxShadow = '0 0 45px rgba(0,255,65,0.4)'}
            onMouseLeave={e => e.target.style.boxShadow = '0 0 30px rgba(0,255,65,0.25)'}
            >
              GO TO LOGIN →
            </Link>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @keyframes scaleUp {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .spinner {
          border: 2px solid rgba(0, 255, 65, 0.2);
          border-top-color: #00ff41;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        button.action-btn:not(:disabled):hover {
          box-shadow: 0 0 45px rgba(0,255,65,0.4) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
