import { useEffect, useRef } from 'react';

const sdgGoals = [
  { num: '11', title: 'Sustainable Cities', color: '#f59e0b' },
  { num: '12', title: 'Responsible Consumption', color: '#00ff41' },
  { num: '13', title: 'Climate Action', color: '#3b82f6' },
  { num: '15', title: 'Life on Land', color: '#10b981' },
];

const components = [
  { icon: '📡', title: 'Bottle Detector', desc: 'Infrared sensors detect and classify plastic bottle size in real-time.' },
  { icon: '⚙️', title: 'Shredding Unit', desc: 'High-torque motor shreds bottles into flakes, reducing volume by 90%.' },
  { icon: '🖥️', title: 'Smart Display', desc: 'Touchscreen UI shows user points, history, and QR scanner output.' },
  { icon: '♻️', title: 'Storage Chamber', desc: 'Sealed compartment stores shredded plastic for periodic collection.' },
  { icon: '📱', title: 'QR Scanner', desc: 'Identifies users via phone-generated QR codes for instant credit.' },
  { icon: '🔋', title: 'Power System', desc: 'Low-power design with solar-ready DC input for off-grid operation.' },
];

const stats = [
  { value: '1,240+', label: 'Bottles Collected', sub: 'and counting' },
  { value: '6,200', label: 'Points Distributed', sub: 'across users' },
  { value: '62 kg', label: 'Plastic Diverted', sub: 'from landfill' },
  { value: '4.8★', label: 'User Rating', sub: 'avg satisfaction' },
];

function SectionLabel({ text }) {
  return (
    <div className="mono" style={{
      fontSize: '0.62rem', letterSpacing: '0.2em',
      color: '#00ff41', marginBottom: '1rem',
      display: 'flex', alignItems: 'center', gap: '0.6rem',
    }}>
      <span style={{ width: 20, height: 1, background: '#00ff41', display: 'inline-block' }} />
      {text}
    </div>
  );
}

export default function InfoSections() {
  return (
    <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── STATS MARQUEE ── */}
      <div style={{
        borderTop: '1px solid rgba(0,255,65,0.1)',
        borderBottom: '1px solid rgba(0,255,65,0.1)',
        padding: '1.2rem 0',
        overflow: 'hidden', position: 'relative',
        background: 'rgba(0,255,65,0.02)',
      }}>
        <div style={{
          display: 'flex', gap: '4rem',
          animation: 'marquee 18s linear infinite',
          whiteSpace: 'nowrap', width: 'max-content',
        }}>
          {[...stats, ...stats].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
              <span className="mono" style={{ fontSize: '0.65rem', color: 'rgba(232,245,232,0.4)', letterSpacing: '0.08em' }}>{s.label}</span>
              <span style={{ color: 'rgba(0,255,65,0.3)', fontSize: '0.8rem' }}>◆</span>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── ABOUT RVM ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 6vw, 6rem)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
          <div>
            <SectionLabel text="WHAT IS RVM" />
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.25, letterSpacing: '0.01em' }}>
              A machine that rewards<br /><span style={{ color: '#00ff41' }}>good behavior.</span>
            </h2>
            <p style={{ marginTop: '1.5rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 400 }}>
              A Reverse Vending Machine (RVM) is an automated device that accepts used plastic bottles and rewards users with points. Unlike a regular vending machine that dispenses products, the RVM takes them back — and gives you something in return.
            </p>
            <p style={{ marginTop: '1rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 400 }}>
              Our smart RVM uses QR-based user identification, real-time bottle classification, and instant credit — making recycling tangible, trackable, and rewarding.
            </p>
          </div>
          <div style={{
            background: 'rgba(0,255,65,0.03)',
            border: '1px solid rgba(0,255,65,0.1)',
            borderRadius: 16, padding: '2.5rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stats.map((s) => (
                <div key={s.label} style={{
                  background: 'rgba(0,255,65,0.04)',
                  border: '1px solid rgba(0,255,65,0.1)',
                  borderRadius: 10, padding: '1.2rem',
                }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00ff41', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
                  <div className="mono" style={{ fontSize: '0.6rem', color: 'rgba(232,245,232,0.4)', marginTop: 4, letterSpacing: '0.08em' }}>{s.label}</div>
                  <div className="mono" style={{ fontSize: '0.55rem', color: 'rgba(232,245,232,0.25)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SDG GOALS ── */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 6rem)',
        background: 'rgba(0,255,65,0.015)',
        borderTop: '1px solid rgba(0,255,65,0.08)',
        borderBottom: '1px solid rgba(0,255,65,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionLabel text="SDG ALIGNMENT" />
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '2.5rem' }}>
            Contributing to the<br /><span style={{ color: '#00ff41' }}>Global Goals.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {sdgGoals.map((g) => (
              <div key={g.num} style={{
                border: `1px solid ${g.color}22`,
                borderRadius: 12, padding: '1.5rem',
                background: `${g.color}08`,
                transition: 'transform 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = g.color + '44'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = g.color + '22'; }}
              >
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: g.color, lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif" }}>{g.num}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#e8f5e8' }}>{g.title}</div>
                <div style={{ marginTop: '0.25rem', width: 30, height: 2, background: g.color, borderRadius: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPONENTS ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 6vw, 6rem)', maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel text="MACHINE ANATOMY" />
        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '0.01em', marginBottom: '3rem' }}>
          How the RVM<br /><span style={{ color: '#00ff41' }}>works inside.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', border: '1px solid rgba(0,255,65,0.1)', borderRadius: 16, overflow: 'hidden' }}>
          {components.map((c, i) => (
            <div key={c.title} style={{
              padding: '2rem',
              background: 'rgba(0,255,65,0.02)',
              borderRight: (i + 1) % 3 !== 0 ? '1px solid rgba(0,255,65,0.08)' : 'none',
              borderBottom: i < 3 ? '1px solid rgba(0,255,65,0.08)' : 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,255,65,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,255,65,0.02)'}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{c.title}</div>
              <div className="mono" style={{ fontSize: '0.7rem', color: 'rgba(232,245,232,0.4)', lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHREDDING EXPLAINER ── */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 6vw, 6rem)',
        background: 'rgba(0,255,65,0.015)',
        borderTop: '1px solid rgba(0,255,65,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div style={{
            border: '1px solid rgba(0,255,65,0.15)', borderRadius: 16, padding: '3rem',
            background: 'rgba(0,10,0,0.5)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {['Bottle inserted', 'IR sensor detects size', 'Shredder motor activates', 'Flakes collected in chamber', 'Points credited to user'].map((step, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    border: '1px solid rgba(0,255,65,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontFamily: "'Inter', sans-serif",
                    color: '#00ff41', flexShrink: 0,
                  }}>{i + 1}</div>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'rgba(232,245,232,0.6)' }}>{step}</div>
                  {i < 4 && <div style={{ position: 'absolute', left: 49, marginTop: 28, width: 1, height: 20, background: 'rgba(0,255,65,0.2)' }} />}
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel text="SHREDDING PROCESS" />
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '0.01em' }}>
              Bottle in.<br /><span style={{ color: '#00ff41' }}>Flakes out.</span>
            </h2>
            <p style={{ marginTop: '1.5rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 400 }}>
              The shredder unit uses counter-rotating blades to reduce bottle volume by up to 90%. The resulting flakes are stored in a sealed collection chamber and periodically retrieved for recycling.
            </p>
            <p style={{ marginTop: '1rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', fontWeight: 400 }}>
              This process makes transport cost-effective and prevents re-use of already-submitted bottles.
            </p>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section style={{ padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 6vw, 6rem)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {[
            { label: 'OUR VISION', title: 'A campus where every bottle finds its way back.', body: 'We envision a circular economy on every campus — where students are rewarded for responsible disposal and plastic never reaches a landfill.' },
            { label: 'OUR MISSION', title: 'Make recycling as easy as buying a drink.', body: 'We build smart infrastructure that removes friction from recycling. Scan once, earn always. No manual sorting, no guesswork — just instant gratification for doing good.' },
          ].map(({ label, title, body }) => (
            <div key={label} style={{
              border: '1px solid rgba(0,255,65,0.12)',
              borderRadius: 16, padding: '2.5rem',
              background: 'rgba(0,255,65,0.02)',
            }}>
              <SectionLabel text={label} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0.01em' }}>{title}</h3>
              <p className="mono" style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'rgba(232,245,232,0.45)', lineHeight: 1.7 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
