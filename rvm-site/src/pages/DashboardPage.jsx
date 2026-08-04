import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../utils/api';
import PinPad from '../components/PinPad';
import TransactionItem from '../components/TransactionItem';

function AnimatedNumber({ value, duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return display;
}

export default function DashboardPage() {
  const { user, isLoggedIn, loading, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [bottleStats, setBottleStats] = useState({ small: 0, medium: 0, large: 0 });
  const [transactions, setTransactions] = useState([]);
  const [txnFilter, setTxnFilter] = useState('all');
  const [dataLoading, setDataLoading] = useState(true);

  // Transfer state
  const [transferForm, setTransferForm] = useState({ receiver_usn: '', coins: '' });
  const [receiverName, setReceiverName] = useState(null);
  const [receiverLooking, setReceiverLooking] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPinError, setTransferPinError] = useState('');
  const [toast, setToast] = useState(null);

  const lookupTimeout = useRef(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
    }
  }, [loading, isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchData = async () => {
      try {
        const [profileRes, statsRes, txnRes] = await Promise.all([
          api.get('/api/user/profile'),
          api.get('/api/user/bottle-stats'),
          api.get('/api/user/transactions'),
        ]);
        if (profileRes.data.success) updateUser(profileRes.data.data.user);
        if (statsRes.data.success) setBottleStats(statsRes.data.data.stats);
        if (txnRes.data.success) setTransactions(txnRes.data.data.transactions);
      } catch (err) {
        console.error('Dashboard data error:', err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn]);

  // Debounced receiver lookup
  const handleReceiverChange = (value) => {
    setTransferForm(f => ({ ...f, receiver_usn: value.toUpperCase() }));
    setReceiverName(null);
    setTransferError('');
    clearTimeout(lookupTimeout.current);
    if (value.trim().length >= 3) {
      setReceiverLooking(true);
      lookupTimeout.current = setTimeout(async () => {
        try {
          const res = await api.get(`/api/user/lookup?usn=${value.toUpperCase()}`);
          if (res.data.success) {
            setReceiverName(res.data.data.user.name);
          } else {
            setReceiverName(null);
            setTransferError('User not found');
          }
        } catch { setTransferError('User not found'); }
        setReceiverLooking(false);
      }, 500);
    }
  };

  const canTransfer = receiverName && transferForm.coins > 0 && transferForm.coins <= (user?.coins || 0);

  const handleTransferConfirm = useCallback(async (pinValue) => {
    try {
      const res = await api.post('/api/user/transfer', {
        receiver_usn: transferForm.receiver_usn,
        coins: parseInt(transferForm.coins),
        pin: pinValue,
      });
      if (res.data.success) {
        setShowTransferModal(false);
        updateUser({ coins: res.data.data.new_balance });
        setTransferForm({ receiver_usn: '', coins: '' });
        setReceiverName(null);
        showToast(`✓ ${res.data.data.coins_sent} coins sent to ${res.data.data.receiver_name}!`, 'success');
        // Refresh transactions
        const txnRes = await api.get('/api/user/transactions');
        if (txnRes.data.success) setTransactions(txnRes.data.data.transactions);
      }
    } catch (err) {
      setTransferPinError(err.response?.data?.message || 'Transfer failed');
    }
  }, [transferForm, updateUser]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredTxns = transactions.filter(t => {
    if (txnFilter === 'all') return true;
    if (txnFilter === 'credit') return t.type === 'credit';
    if (txnFilter === 'sent') return t.type === 'transfer_sent';
    if (txnFilter === 'received') return t.type === 'transfer_received';
    return true;
  });

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem' }}>
        <div className="skeleton-card" style={{ width: 200, height: 40, borderRadius: 8 }} />
      </div>
    );
  }

  const maxBottles = Math.max(bottleStats.small, bottleStats.medium, bottleStats.large, 1);

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(5rem, 10vw, 6rem) clamp(1rem, 4vw, 5rem) 3rem' }}>
      {/* Section 1 - Welcome */}
      <div className="w-full px-6 md:px-10 mt-6 relative z-10" style={{ marginBottom: '2rem' }}>
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '0.3rem' }}>
          Hey, <span style={{ color: '#00ff41' }}>{user.name}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(232,245,232,0.5)', fontFamily: "'Inter', sans-serif" }}>
          Welcome back
        </p>
        <div style={{ fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.7rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
          {user.usn} · {user.branch || 'N/A'} · {user.year || 'N/A'}
        </div>
      </div>

      {/* Section 2 - Coin Balance */}
      <div style={{
        border: '1px solid rgba(0,255,136,0.2)',
        borderRadius: 16, 
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 2vw, 2rem)',
        background: 'rgba(0,255,136,0.03)',
        boxShadow: '0 0 50px rgba(0,255,136,0.08)',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ 
          fontSize: 'clamp(5rem, 12vw, 8rem)', 
          fontWeight: 800, 
          color: '#00ff88', 
          fontFamily: "'Space Grotesk', sans-serif", 
          lineHeight: 1,
          textShadow: '0 0 30px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.2)'
        }}>
          <AnimatedNumber value={user.coins || 0} />
        </div>
        <div style={{ 
          fontFamily: "'Space Mono', 'Inter', monospace", 
          fontSize: '1rem', 
          fontWeight: 600,
          color: '#00ff88', 
          marginTop: '1rem', 
          letterSpacing: '0.2em' 
        }}>
          COINS
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.85rem',
          color: 'rgba(232,245,232,0.5)',
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          Earn coins by recycling bottles at the machine
        </div>
      </div>

      {/* Section 3 - Bottle Stats */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Your <span style={{ color: '#00ff41' }}>Recycling Stats</span>
        </h2>
        <div className="dash-bottle-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Small Bottles', count: bottleStats.small, coins: bottleStats.small * 5, caption: '× 5 coins' },
            { label: 'Medium Bottles', count: bottleStats.medium, coins: bottleStats.medium * 10, caption: '× 10 coins' },
            { label: 'Large Bottles', count: bottleStats.large, coins: bottleStats.large * 15, caption: '× 15 coins' },
          ].map(({ label, count, coins, caption }) => (
            <div key={label} style={{
              border: '1px solid rgba(0,255,65,0.12)', borderRadius: 12,
              padding: '1.25rem', background: 'rgba(0,255,65,0.02)',
            }}>
              <div style={{ fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.6rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.06em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                {label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>
                <AnimatedNumber value={count} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'rgba(232,245,232,0.35)', marginTop: '0.25rem' }}>
                {caption} = {coins} coins
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,255,65,0.1)', marginTop: '0.75rem', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: '#00ff41',
                  width: `${maxBottles > 0 ? (count / maxBottles) * 100 : 0}%`,
                  transition: 'width 1.5s ease-out',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 - Transfer */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Transfer <span style={{ color: '#00ff41' }}>Coins</span>
        </h2>
        <div style={{
          border: '1px solid rgba(0,255,65,0.12)', borderRadius: 12,
          padding: '1.5rem', background: 'rgba(0,255,65,0.02)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input
                placeholder="Receiver USN"
                value={transferForm.receiver_usn}
                onChange={e => handleReceiverChange(e.target.value)}
                style={{
                  width: '100%', padding: '0.85rem 1rem',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,255,65,0.12)',
                  borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none',
                  fontFamily: "'Space Mono', 'Inter', monospace", textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              />
              {receiverLooking && <div style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>Looking up...</div>}
              {receiverName && <div style={{ fontSize: '0.72rem', color: '#00ff41', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>→ Sending to: {receiverName}</div>}
              {transferError && <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>{transferError}</div>}
            </div>

            <div>
              <input
                placeholder="Number of Coins"
                type="number"
                min={1}
                max={user?.coins || 0}
                value={transferForm.coins}
                onChange={e => {
                  setTransferForm(f => ({ ...f, coins: e.target.value }));
                  setTransferError('');
                }}
                style={{
                  width: '100%', padding: '0.85rem 1rem',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,255,65,0.12)',
                  borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              {transferForm.coins > (user?.coins || 0) && (
                <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: 4, fontFamily: "'Inter', sans-serif" }}>Insufficient balance</div>
              )}
            </div>

            <button
              onClick={() => { if (canTransfer) setShowTransferModal(true); }}
              disabled={!canTransfer}
              style={{
                width: '100%', padding: '0.85rem',
                background: canTransfer ? '#00ff41' : 'rgba(0,255,65,0.08)',
                color: canTransfer ? '#050805' : 'rgba(232,245,232,0.3)',
                border: 'none', borderRadius: 8,
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                cursor: canTransfer ? 'pointer' : 'default',
                opacity: canTransfer ? 1 : 0.4,
                transition: 'all 0.2s',
              }}
            >Send Coins →</button>
          </div>
        </div>
      </div>

      {/* Section 5 - Transaction History */}
      <div>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, marginBottom: '1rem' }}>
          Transaction <span style={{ color: '#00ff41' }}>History</span>
        </h2>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
          {[
            { key: 'all', label: 'ALL' },
            { key: 'credit', label: 'CREDITED' },
            { key: 'sent', label: 'SENT' },
            { key: 'received', label: 'RECEIVED' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTxnFilter(key)} style={{
              background: 'transparent', border: 'none',
              color: txnFilter === key ? '#e8f5e8' : 'rgba(232,245,232,0.35)',
              fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.65rem',
              fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer',
              padding: '0.5rem 0.75rem', borderRadius: 6,
              borderBottom: txnFilter === key ? '2px solid #00ff41' : '2px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}>{label}</button>
          ))}
        </div>

        {/* Transaction list */}
        {dataLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card" style={{ height: 72, borderRadius: 12, background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.06)' }} />
            ))}
          </div>
        ) : filteredTxns.length === 0 ? (
          <div style={{
            border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12,
            padding: '3rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍶</div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>No transactions yet</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(232,245,232,0.35)' }}>
              Insert a bottle to get started!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {filteredTxns.map((t, i) => (
              <div key={t.id} style={{ animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                <TransactionItem transaction={t} currentUserId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transfer PIN Modal */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
          padding: '1rem',
        }} onClick={() => setShowTransferModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0a120a', border: '1px solid rgba(0,255,65,0.2)',
            borderRadius: 16, padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            width: '100%', maxWidth: 380, position: 'relative',
            animation: 'scaleIn 0.3s ease',
          }}>
            <button onClick={() => setShowTransferModal(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
              fontSize: '1.2rem', cursor: 'pointer',
            }}>✕</button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#e8f5e8', marginBottom: '0.5rem' }}>
                Confirm Transfer
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(232,245,232,0.5)' }}>
                Sending {transferForm.coins} coins to {receiverName}
              </div>
            </div>

            <PinPad
              label="Enter PIN to confirm"
              onComplete={handleTransferConfirm}
              error={transferPinError}
              onClearError={() => setTransferPinError('')}
            />
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success' ? 'rgba(0,255,65,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(0,255,65,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 8, padding: '0.8rem 1.5rem',
          color: toast.type === 'success' ? '#00ff41' : '#ef4444',
          fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
          zIndex: 99999, backdropFilter: 'blur(12px)',
          animation: 'slideDown 0.3s ease',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton-card {
          background: linear-gradient(90deg, #0a140a, #0f1f0f, #0a140a);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @media (max-width: 768px) {
          .dash-bottle-grid { grid-template-columns: 1fr !important; gap: 0.75rem !important; display: flex !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; padding-bottom: 0.5rem; }
          .dash-bottle-grid > div { min-width: 200px; flex-shrink: 0; }
        }
      `}</style>
    </div>
  );
}
