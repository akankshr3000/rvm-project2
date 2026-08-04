import { useState } from 'react';
import { useRVMStore } from '../store/useRVMStore';
import { Link } from 'react-router-dom';

/* ──────────────────────────── DASHBOARD ──────────────────────────── */
export function DashboardPage() {
  const currentUser = useRVMStore((s) => s.currentUser);
  const getTransactionsByUser = useRVMStore((s) => s.getTransactionsByUser);
  const transferPoints = useRVMStore((s) => s.transferPoints);

  const [tForm, setTForm] = useState({ receiver: '', points: '', password: '' });
  const [tStatus, setTStatus] = useState(null);

  if (!currentUser) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', paddingTop: '5rem' }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Not Registered</h2>
      <Link to="/register" style={{ textDecoration: 'none', background: '#00ff41', color: '#050805', padding: '0.8rem 1.5rem', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>REGISTER NOW</Link>
    </div>
  );

  const txns = getTransactionsByUser(currentUser.id);
  const totalCoins = txns.reduce((a, t) => a + t.coins, 0);

  return (
    <div style={{ minHeight: '100vh', padding: '6rem clamp(1.5rem, 5vw, 5rem) 3rem' }}>
      <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff41', letterSpacing: '0.2em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} /> {currentUser.role === 'employee' ? 'EMPLOYEE DASHBOARD' : 'STUDENT DASHBOARD'}
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '2.5rem', letterSpacing: '0.01em' }}>
        Hey, <span style={{ color: '#00ff41' }}>{currentUser.name.split(' ')[0]}</span> 👋
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left — Profile + QR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ border: '1px solid rgba(0,255,65,0.15)', borderRadius: 16, padding: '2rem', background: 'rgba(0,255,65,0.03)', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(0,255,65,0.15)', border: '2px solid rgba(0,255,65,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem' }}>
              {currentUser.name[0]}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{currentUser.name}</h3>
            <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.4)', marginTop: 4 }}>{currentUser.branch || 'Employee'}</div>
            <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.3)', marginTop: 2 }}>{currentUser.phone ? `+91 ${currentUser.phone}` : ''}</div>
          </div>

          {/* Stats */}
          {[
            { label: 'Total Points', value: currentUser.points, color: '#00ff41' },
            { label: 'Coins Earned', value: totalCoins, color: '#f59e0b' },
            { label: 'Bottles Recycled', value: txns.length, color: '#3b82f6' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', background: 'rgba(0,255,65,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
            </div>
          ))}

          {/* Transfer Points */}
          <div style={{ border: '1px solid rgba(0,255,65,0.15)', borderRadius: 16, padding: '1.5rem', background: 'rgba(0,255,65,0.02)' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#00ff41' }}>🔄</span> Transfer Points
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                placeholder="Receiver USN / ID"
                value={tForm.receiver}
                onChange={e => setTForm({ ...tForm, receiver: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  placeholder="Points"
                  type="number"
                  value={tForm.points}
                  onChange={e => setTForm({ ...tForm, points: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                />
                <input
                  placeholder="Your Password"
                  type="password"
                  value={tForm.password}
                  onChange={e => setTForm({ ...tForm, password: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              
              <button
                onClick={() => {
                  const pts = parseInt(tForm.points, 10);
                  if (!pts || pts <= 0) { setTStatus({ type: 'error', msg: 'Enter valid points' }); return; }
                  if (!tForm.receiver.trim()) { setTStatus({ type: 'error', msg: 'Enter receiver ID' }); return; }
                  if (!tForm.password) { setTStatus({ type: 'error', msg: 'Enter password' }); return; }

                  const res = transferPoints(currentUser.id, tForm.password, tForm.receiver.trim(), pts);
                  if (res.success) {
                    setTStatus({ type: 'success', msg: 'Transfer successful!' });
                    setTForm({ receiver: '', points: '', password: '' });
                    setTimeout(() => setTStatus(null), 3000);
                  } else {
                    setTStatus({ type: 'error', msg: res.error });
                  }
                }}
                style={{ width: '100%', padding: '0.75rem', background: '#00ff41', color: '#050805', border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem' }}
              >SEND POINTS</button>

              {tStatus && (
                <div style={{ fontSize: '0.75rem', color: tStatus.type === 'error' ? '#ef4444' : '#00ff41', textAlign: 'center', marginTop: '0.5rem' }}>
                  {tStatus.msg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — History */}
        <div>
          <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem' }}>RECYCLING HISTORY</div>
          {txns.length === 0 ? (
            <div style={{ border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍶</div>
              <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.35)' }}>No transactions yet.</p>
              <Link to="/simulate" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem', background: '#00ff41', color: '#050805', padding: '0.6rem 1.2rem', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.8rem' }}>TRY SIMULATOR</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {txns.map((t) => (
                <div key={t.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid rgba(0,255,65,0.1)',
                  borderRadius: 12, background: 'rgba(0,255,65,0.02)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.1)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,255,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                      {t.type === 'transfer' ? '💸' : t.type === 'claim' ? '🎉' : '🍶'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'capitalize' }}>
                        {t.type === 'transfer' ? (t.senderId === currentUser.id ? 'Sent Points' : 'Received Points') : `${t.label} ${t.type === 'claim' ? '' : 'Bottle'}`}
                      </div>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.35)', marginTop: 2 }}>
                        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(t.date).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: t.type === 'transfer' && t.senderId === currentUser.id ? '#ef4444' : '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem' }}>
                      {t.type === 'transfer' && t.senderId === currentUser.id ? '-' : '+'}{t.points} pts
                    </div>
                    {t.coins > 0 && <div style={{ color: '#f59e0b', fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', marginTop: 2 }}>+{t.coins} 🪙</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── HISTORY ──────────────────────────── */
export function HistoryPage() {
  const getAllTransactions = useRVMStore((s) => s.getAllTransactions);
  const users = useRVMStore((s) => s.users);
  const txns = getAllTransactions();

  const getUserName = (id) => users.find((u) => u.id === id)?.name || 'Unknown';

  return (
    <div style={{ minHeight: '100vh', padding: '6rem clamp(1.5rem, 5vw, 5rem) 3rem' }}>
      <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff41', letterSpacing: '0.2em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} /> TRANSACTION HISTORY
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '2.5rem', letterSpacing: '0.01em' }}>
        All <span style={{ color: '#00ff41' }}>Transactions</span>
      </h1>

      {txns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p className="mono" style={{ color: 'rgba(232,245,232,0.35)' }}>No transactions recorded yet.</p>
          <Link to="/simulate" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none', background: '#00ff41', color: '#050805', padding: '0.7rem 1.5rem', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>OPEN SIMULATOR</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { v: txns.length, l: 'Total Transactions' },
              { v: txns.reduce((a, t) => a + t.points, 0), l: 'Points Distributed' },
              { v: users.length, l: 'Active Users' },
              { v: txns.filter(t => t.bottleType === 'large').length, l: 'Large Bottles' },
            ].map(({ v, l }) => (
              <div key={l} style={{ border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, padding: '1.25rem', background: 'rgba(0,255,65,0.02)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{v}</div>
                <div className="mono" style={{ fontSize: '0.58rem', color: 'rgba(232,245,232,0.35)', marginTop: 4, letterSpacing: '0.08em' }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {txns.map((t) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.5rem',
                border: '1px solid rgba(0,255,65,0.08)',
                borderRadius: 10, background: 'rgba(0,255,65,0.02)',
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,255,65,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍶</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', textTransform: 'capitalize' }}>{t.label} Bottle</div>
                    <div className="mono" style={{ fontSize: '0.58rem', color: 'rgba(232,245,232,0.3)', marginTop: 2 }}>{t.id}</div>
                  </div>
                </div>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)' }}>{getUserName(t.userId)}</div>
                <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.35)' }}>
                  {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
                <div style={{ color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>+{t.points} pts</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────── ADMIN ──────────────────────────── */
export function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');

  const users = useRVMStore((s) => s.users);
  const getAllTransactions = useRVMStore((s) => s.getAllTransactions);
  const txns = getAllTransactions();

  const totalPts = txns.reduce((a, t) => a + t.points, 0);
  const byType = { small: 0, medium: 0, large: 0 };
  txns.forEach(t => { byType[t.bottleType] = (byType[t.bottleType] || 0) + 1; });

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', paddingTop: '5rem' }}>
      <div style={{ fontSize: '3rem' }}>🔐</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>RESTRICTED AREA</h2>
      <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', textAlign: 'center' }}>Admin access only. Please authenticate.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 300 }}>
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '0.9rem 1rem',
            background: 'rgba(0,255,65,0.04)',
            border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: 8, color: '#e8f5e8',
            fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#00ff41'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.15)'}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (password === 'admin123') setIsAdmin(true);
              else alert('Incorrect password');
            }
          }}
        />
        <button
          onClick={() => {
            if (password === 'admin123') setIsAdmin(true);
            else alert('Incorrect password');
          }}
          style={{
            width: '100%', padding: '0.9rem',
            background: '#00ff41', color: '#050805',
            border: 'none', borderRadius: 8,
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >AUTHENTICATE →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '6rem clamp(1.5rem, 5vw, 5rem) 3rem' }}>
      <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff41', letterSpacing: '0.2em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} /> ADMIN PANEL
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '2.5rem', letterSpacing: '0.01em' }}>
        System <span style={{ color: '#00ff41' }}>Dashboard</span>
      </h1>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { v: txns.length, l: 'Total Bottles', icon: '🍶' },
          { v: users.length, l: 'Registered Users', icon: '👤' },
          { v: totalPts, l: 'Points Given', icon: '⚡' },
          { v: byType.small, l: 'Small Bottles', icon: '🔹' },
          { v: byType.medium, l: 'Medium Bottles', icon: '🔷' },
          { v: byType.large, l: 'Large Bottles', icon: '🔵' },
        ].map(({ v, l, icon }) => (
          <div key={l} style={{ border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, padding: '1.25rem', background: 'rgba(0,255,65,0.02)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{v}</div>
            <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.35)', marginTop: 4, letterSpacing: '0.06em' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem' }}>ALL USERS</div>
        <div style={{ border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '0.75rem 1.25rem', background: 'rgba(0,255,65,0.06)', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
            {['Name', 'Phone', 'Branch', 'Joined', 'Points'].map((h) => (
              <div key={h} className="mono" style={{ fontSize: '0.58rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.1em' }}>{h}</div>
            ))}
          </div>
          {users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(232,245,232,0.25)' }}>No users registered yet.</div>
            </div>
          ) : users.map((u, i) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px',
              padding: '0.9rem 1.25rem',
              borderBottom: i < users.length - 1 ? '1px solid rgba(0,255,65,0.06)' : 'none',
              background: i % 2 === 0 ? 'rgba(0,255,65,0.01)' : 'transparent',
            }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.name}</div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(232,245,232,0.5)' }}>+91 {u.phone}</div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(232,245,232,0.5)' }}>{u.branch} • {u.year}</div>
              <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.35)' }}>
                {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
              </div>
              <div style={{ color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem' }}>{u.points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem' }}>RECENT TRANSACTIONS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {txns.slice(0, 20).map((t) => (
            <div key={t.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 1.25rem',
              border: '1px solid rgba(0,255,65,0.08)',
              borderRadius: 8, background: 'rgba(0,255,65,0.01)',
            }}>
              <div className="mono" style={{ fontSize: '0.62rem', color: 'rgba(232,245,232,0.35)' }}>{t.id}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize' }}>{t.label} Bottle</div>
              <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.4)' }}>
                {users.find(u => u.id === t.userId)?.name || 'Simulator'}
              </div>
              <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.3)' }}>
                {new Date(t.date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{ color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>+{t.points}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
