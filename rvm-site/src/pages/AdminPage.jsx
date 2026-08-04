import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
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

export function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joined');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) return;
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, txnRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/users'),
          api.get('/api/admin/transactions'),
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (usersRes.data.success) setUsers(usersRes.data.data.users);
        if (txnRes.data.success) setTransactions(txnRes.data.data.transactions);
      } catch (err) {
        console.error('Admin data error:', err);
      }
    };
    fetchData();
  }, [isAdmin]);

  const handleSearch = async (val) => {
    setSearch(val);
    try {
      const res = await api.get(`/api/admin/users?search=${val}&sort=${sortBy}`);
      if (res.data.success) setUsers(res.data.data.users);
    } catch {}
  };

  const handleSort = async (val) => {
    setSortBy(val);
    try {
      const res = await api.get(`/api/admin/users?search=${search}&sort=${val}`);
      if (res.data.success) setUsers(res.data.data.users);
    } catch {}
  };

  const handleDeleteRow = async (e, userId, userName) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to completely remove ${userName}? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/api/admin/user/${userId}`);
        if (res.data.success) {
          setUsers(users.filter(u => u.id !== userId));
        } else {
          alert(res.data.message || 'Failed to remove user.');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error removing user');
      }
    }
  };

  const filteredTxns = transactions.filter(t => {
    if (txnFilter === 'all') return true;
    if (txnFilter === 'credits') return t.type === 'credit';
    if (txnFilter === 'transfers') return t.type === 'transfer_sent' || t.type === 'transfer_received';
    return true;
  });

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', paddingTop: '5rem' }}>
      <div style={{ fontSize: '3rem' }}>🔐</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>RESTRICTED AREA</h2>
      <p className="mono" style={{ fontSize: '0.75rem', color: 'rgba(232,245,232,0.4)', textAlign: 'center' }}>Admin access only. Please authenticate.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 300 }}>
        <input type="password" placeholder="Admin Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '0.9rem 1rem',
            background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: 8, color: '#e8f5e8',
            fontFamily: "'Inter', sans-serif", fontSize: '0.8rem',
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#00ff41'}
          onBlur={e => e.target.style.borderColor = 'rgba(0,255,65,0.15)'}
          onKeyDown={e => { if (e.key === 'Enter') { if (password === 'admin123') setIsAdmin(true); else alert('Incorrect password'); } }}
        />
        <button onClick={() => { if (password === 'admin123') setIsAdmin(true); else alert('Incorrect password'); }}
          style={{
            width: '100%', padding: '0.9rem', background: '#00ff41', color: '#050805',
            border: 'none', borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
          }}
        >AUTHENTICATE →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(5rem, 10vw, 6rem) clamp(1rem, 4vw, 5rem) 3rem' }}>
      <div className="mono" style={{ fontSize: '0.6rem', color: '#00ff41', letterSpacing: '0.2em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 14, height: 1, background: '#00ff41', display: 'inline-block' }} /> ADMIN PANEL
      </div>
      <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '2.5rem', letterSpacing: '0.01em' }}>
        System <span style={{ color: '#00ff41' }}>Dashboard</span>
      </h1>

      {/* KPI Cards */}
      {stats && (
        <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { v: stats.total_users, l: 'Total Users', icon: '👤' },
            { v: stats.total_coins, l: 'Coins Distributed', icon: '🪙' },
            { v: stats.total_bottles, l: 'Total Bottles', icon: '🍶' },
            { v: stats.total_transfers, l: 'Total Transfers', icon: '🔄' },
          ].map(({ v, l, icon }) => (
            <div key={l} style={{
              border: '1px solid rgba(0,255,65,0.12)', borderRadius: 12,
              padding: '1.5rem', background: 'rgba(0,255,65,0.02)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>
                <AnimatedNumber value={v} />
              </div>
              <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.35)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottle Chart */}
      {stats && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>Bottle Distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Small', count: stats.small_count },
              { label: 'Medium', count: stats.medium_count },
              { label: 'Large', count: stats.large_count },
            ].map(({ label, count }) => {
              const max = Math.max(stats.small_count, stats.medium_count, stats.large_count, 1);
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="mono" style={{ width: 60, fontSize: '0.65rem', color: 'rgba(232,245,232,0.5)', textAlign: 'right' }}>{label}</div>
                  <div style={{ flex: 1, height: 24, background: 'rgba(0,255,65,0.06)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%', background: 'linear-gradient(90deg, rgba(0,255,65,0.4), #00ff41)',
                      borderRadius: 6, width: `${(count / max) * 100}%`,
                      transition: 'width 1.5s ease-out', minWidth: count > 0 ? 8 : 0,
                    }} />
                  </div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#00ff41', width: 40 }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Transactions */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>All Transactions</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'credits', label: 'Credits' },
            { key: 'transfers', label: 'Transfers' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTxnFilter(key)} style={{
              background: 'transparent', border: 'none',
              color: txnFilter === key ? '#e8f5e8' : 'rgba(232,245,232,0.35)',
              fontFamily: "'Space Mono', 'Inter', monospace", fontSize: '0.65rem',
              fontWeight: 600, cursor: 'pointer', padding: '0.4rem 0.75rem',
              borderBottom: txnFilter === key ? '2px solid #00ff41' : '2px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 500, overflowY: 'auto' }}>
          {filteredTxns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(232,245,232,0.3)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>No transactions yet.</div>
          ) : (
            filteredTxns.slice(0, 50).map(t => (
              <TransactionItem key={t.id} transaction={t} />
            ))
          )}
        </div>
      </div>

      {/* All Users */}
      <div>
        <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>All Users</div>
        
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <input placeholder="Search by name or USN..." value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '0.7rem 1rem',
              background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,255,65,0.12)',
              borderRadius: 8, color: '#e8f5e8', fontSize: '0.8rem', outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <select value={sortBy} onChange={e => handleSort(e.target.value)} style={{
            padding: '0.7rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,65,0.12)',
            borderRadius: 8, color: '#e8f5e8', fontSize: '0.75rem', outline: 'none',
            fontFamily: "'Inter', sans-serif",
          }}>
            <option value="joined">Sort: Newest</option>
            <option value="coins">Sort: Coins</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="admin-users-table" style={{ border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 1fr 0.7fr 80px 60px 40px', padding: '0.75rem 1.25rem', background: 'rgba(0,255,65,0.06)', borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
            {['', 'Name', 'USN', 'Branch', 'Year', 'Coins', 'View', ''].map((h, idx) => (
              <div key={idx} className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(232,245,232,0.25)', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>No users found.</div>
          ) : users.map((u, i) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '48px 1fr 1fr 1fr 0.7fr 80px 60px 40px',
              padding: '0.85rem 1.25rem', alignItems: 'center',
              borderBottom: i < users.length - 1 ? '1px solid rgba(0,255,65,0.06)' : 'none',
              background: i % 2 === 0 ? 'rgba(0,255,65,0.01)' : 'transparent',
              transition: 'border-color 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.06)'}
            onClick={() => navigate(`/admin/user/${u.id}`)}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#00ff41', color: '#050805',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.75rem', fontFamily: "'Space Grotesk', sans-serif",
              }}>{u.name?.[0]?.toUpperCase()}</div>
              <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{u.name}</div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'rgba(232,245,232,0.5)' }}>{u.usn}</div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'rgba(232,245,232,0.4)' }}>{u.branch || '—'}</div>
              <div className="mono" style={{ fontSize: '0.68rem', color: 'rgba(232,245,232,0.4)' }}>{u.year || '—'}</div>
              <div style={{ color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem' }}>{u.coins}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.65rem', color: 'rgba(0,255,65,0.6)' }}>View →</div>
              <div 
                onClick={(e) => handleDeleteRow(e, u.id, u.name)}
                style={{ 
                  fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#ef4444', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.05)', width: 26, height: 26, borderRadius: 6,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                title="Remove User"
              >
                🗑️
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Cards */}
        <div className="admin-users-cards" style={{ display: 'none', flexDirection: 'column', gap: '0.75rem' }}>
          {users.map(u => (
            <div key={u.id} onClick={() => navigate(`/admin/user/${u.id}`)} style={{
              border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12,
              padding: '1rem 1.25rem', background: 'rgba(0,255,65,0.02)',
              display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onTouchStart={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)'}
            onTouchEnd={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.1)'}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#00ff41', color: '#050805',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
              }}>{u.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.name}</div>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)' }}>{u.usn}</div>
              </div>
              <div style={{ color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem' }}>{u.coins}</div>
              <div 
                onClick={(e) => handleDeleteRow(e, u.id, u.name)}
                style={{ 
                  fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: '#ef4444', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(239, 68, 68, 0.1)', width: 32, height: 32, borderRadius: 6,
                  marginLeft: '0.5rem'
                }}
              >
                🗑️
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .admin-users-table { display: none !important; }
          .admin-users-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

// User Detail Page
export function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/admin/user/${id}`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error('User detail error:', err);
      }
    };
    fetchUser();
  }, [id]);

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem' }}>
      <div style={{ color: 'rgba(232,245,232,0.4)' }}>Loading...</div>
    </div>
  );

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you absolutely sure you want to completely remove ${data.user.name}? This action cannot be undone.`)) {
      try {
        const res = await api.delete(`/api/admin/user/${data.user.id}`);
        if (res.data.success) {
          navigate('/admin');
        } else {
          alert(res.data.message || 'Failed to remove user.');
        }
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Error removing user');
      }
    }
  };

  const { user, transactions, stats } = data;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(5rem, 10vw, 6rem) clamp(1rem, 4vw, 5rem) 3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'transparent', border: 'none', color: 'rgba(232,245,232,0.4)',
          fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>← All Users</button>

        <button onClick={handleDeleteUser} style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444',
          padding: '0.5rem 1rem', borderRadius: 8, fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s', letterSpacing: '0.05em'
        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
           onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>
          REMOVE USER
        </button>
      </div>

      {/* Profile Card */}
      <div style={{
        border: '1px solid rgba(0,255,65,0.15)', borderRadius: 16,
        padding: '2rem', background: 'rgba(0,255,65,0.03)', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#00ff41', color: '#050805',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.5rem', fontFamily: "'Space Grotesk', sans-serif",
          flexShrink: 0,
        }}>{user.name?.[0]?.toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.3rem' }}>{user.name}</h2>
          <div className="mono" style={{ fontSize: '0.68rem', color: 'rgba(232,245,232,0.4)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span>{user.usn}</span>
            <span>·</span>
            <span>{user.email}</span>
            <span>·</span>
            <span>{user.branch || 'N/A'}</span>
            <span>·</span>
            <span>{user.year || 'N/A'}</span>
            <span>·</span>
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{user.coins}</div>
          <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.35)', letterSpacing: '0.1em' }}>TOTAL COINS</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { v: stats.total_credited, l: 'Total Credited' },
          { v: stats.total_sent, l: 'Total Sent' },
          { v: stats.total_received, l: 'Total Received' },
        ].map(({ v, l }) => (
          <div key={l} style={{
            border: '1px solid rgba(0,255,65,0.1)', borderRadius: 12,
            padding: '1.25rem', background: 'rgba(0,255,65,0.02)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{v}</div>
            <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.35)', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div>
        <div className="mono" style={{ fontSize: '0.58rem', color: '#00ff41', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>Transaction History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(232,245,232,0.3)', fontSize: '0.8rem' }}>No transactions.</div>
          ) : (
            transactions.map(t => <TransactionItem key={t.id} transaction={t} currentUserId={user.id} />)
          )}
        </div>
      </div>
    </div>
  );
}
