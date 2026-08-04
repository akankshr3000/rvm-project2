import { motion } from 'framer-motion';
import { ArrowDownCircle, ScanLine, QrCode, LogIn, Wallet, Gift } from 'lucide-react';

const STEPS = [
  {
    id: '01',
    title: 'Insert Bottle',
    desc: 'User inserts plastic bottle into the machine',
    icon: ArrowDownCircle
  },
  {
    id: '02',
    title: 'Smart Detection',
    desc: '10-inch display shows bottle type & capacity with QR code',
    icon: ScanLine
  },
  {
    id: '03',
    title: 'Scan QR',
    desc: 'User scans QR code displayed on machine screen',
    icon: QrCode
  },
  {
    id: '04',
    title: 'Register / Login',
    desc: 'New users register, existing users log in',
    icon: LogIn
  },
  {
    id: '05',
    title: 'Earn Rewards',
    desc: "Coins are instantly credited to user's dashboard",
    icon: Wallet
  },
  {
    id: '06',
    title: 'Earn Points',
    desc: <>Earn eco-points for every bottle.<br />The bigger the bottle, the higher the reward — up to <span style={{ color: '#00ff88', fontWeight: 600 }}>50 pts</span>.</>,
    icon: Gift
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '8rem clamp(1.5rem, 5vw, 5rem)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(0,255,136,0.03) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1300, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mono"
            style={{ fontSize: '0.7rem', color: '#00ff88', letterSpacing: '0.3em', marginBottom: '1rem', textTransform: 'uppercase' }}
          >
            From bottle to rewards in seconds ⚡
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem', color: '#e8f5e8' }}
          >
            How It <span style={{ color: '#00ff88' }}>Works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ color: 'rgba(232,245,232,0.4)', fontSize: '1.1rem', fontFamily: "'Inter', sans-serif" }}
          >
            A seamless 6-step smart recycling journey.
          </motion.p>
        </div>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="step-card"
            >
              <div className="step-badge">{s.id}</div>
              <div className="icon-container">
                <div className="icon-box">
                  <s.icon size={32} color="#00ff88" strokeWidth={1.5} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#e8f5e8', fontFamily: "'Space Grotesk', sans-serif" }}>{s.title}</h3>
              <p style={{ fontSize: '0.95rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
        }
        .step-card {
          position: relative;
          background: rgba(0, 255, 136, 0.02);
          border: 1px solid rgba(0, 255, 136, 0.1);
          border-radius: 24px;
          padding: 3rem 1.5rem 2.5rem;
          text-align: center;
          backdrop-filter: blur(12px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .step-card:hover {
          background: rgba(0, 255, 136, 0.05);
          border-color: rgba(0, 255, 136, 0.4);
          box-shadow: 0 20px 40px rgba(0, 255, 136, 0.1), 0 0 20px rgba(0, 255, 136, 0.05);
        }
        .step-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #00ff88;
          color: #050805;
          font-family: 'Space Mono', monospace;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 100px;
          box-shadow: 0 4px 15px rgba(0, 255, 136, 0.4);
          z-index: 2;
        }
        .icon-container {
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }
        .icon-box {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 255, 136, 0.08);
          border: 1px solid rgba(0, 255, 136, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .step-card:hover .icon-box {
          background: rgba(0, 255, 136, 0.15);
          border-color: #00ff88;
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
        }
        @media (max-width: 1280px) {
          .steps-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .steps-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .step-card {
            padding: 2.5rem 2rem;
          }
        }
      `}</style>
    </section>
  );
}
