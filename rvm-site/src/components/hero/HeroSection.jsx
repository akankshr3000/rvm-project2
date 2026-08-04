import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

/* ─── 3D Machine Body ─── */
function MachineMesh({ phase }) {
  const group = useRef();
  const ringRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.3) * 0.12;
      group.current.position.y = Math.sin(t * 0.5) * 0.04;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += phase === 'processing' ? 0.04 : 0.008;
      const glow = phase === 'processing' ? 1 : 0.4;
      ringRef.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.3 * glow;
      ringRef.current.material.emissiveIntensity = phase === 'processing' ? 2 + Math.sin(t * 5) * 1 : 0.5;
    }
  });

  const greenMat = { color: '#001a00', metalness: 0.9, roughness: 0.1, envMapIntensity: 1 };
  const darkMat = { color: '#050d05', metalness: 0.7, roughness: 0.3 };
  const accentMat = { color: '#00ff41', metalness: 0.1, roughness: 0.5, emissive: '#00ff41', emissiveIntensity: 0.8 };

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* Main cabinet upper */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[2.2, 2.4, 1.2]} />
        <meshStandardMaterial {...greenMat} />
      </mesh>
      {/* Bevel top */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[2.3, 0.08, 1.25]} />
        <meshStandardMaterial color="#001500" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Green glow strip top */}
      <mesh position={[0, 1.82, 0.62]}>
        <boxGeometry args={[2.2, 0.04, 0.02]} />
        <meshStandardMaterial {...accentMat} emissiveIntensity={1.5} />
      </mesh>
      {/* Recycle symbol area */}
      <mesh position={[0, 1.65, 0.61]}>
        <boxGeometry args={[0.5, 0.5, 0.01]} />
        <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.6} transparent opacity={0.9} />
      </mesh>

      {/* Inner chamber */}
      <mesh position={[-0.35, 0.55, 0.05]}>
        <boxGeometry args={[1.35, 1.7, 0.95]} />
        <meshStandardMaterial color="#020802" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Chamber rails */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x - 0.35, 0.55, 0.02]}>
          <boxGeometry args={[0.04, 1.6, 0.04]} />
          <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.4} />
        </mesh>
      ))}

      {/* Screen panel */}
      <mesh position={[0.75, 0.55, 0.61]}>
        <boxGeometry args={[0.6, 1.4, 0.04]} />
        <meshStandardMaterial color="#030a03" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0.75, 0.55, 0.635]}>
        <boxGeometry args={[0.52, 1.28, 0.01]} />
        <meshStandardMaterial
          color={phase === 'reward' ? '#ffaa00' : '#00ff41'}
          emissive={phase === 'reward' ? '#ffaa00' : '#00ff41'}
          emissiveIntensity={phase === 'reward' ? 1.2 : 0.5}
          transparent opacity={0.9}
        />
      </mesh>

      {/* Bottle insertion ring */}
      <mesh ref={ringRef} position={[-0.35, -0.42, 0.62]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.32, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#00ff41"
          emissive="#00ff41"
          emissiveIntensity={1}
          transparent opacity={0.85}
        />
      </mesh>
      {/* Ring inner dark hole */}
      <mesh position={[-0.35, -0.42, 0.60]}>
        <circleGeometry args={[0.27, 32]} />
        <meshStandardMaterial color="#010301" />
      </mesh>
      {/* Ring cross marks */}
      {[0, Math.PI / 2].map((r, i) => (
        <mesh key={i} position={[-0.35, -0.42, 0.63]} rotation={[0, 0, r]}>
          <boxGeometry args={[0.54, 0.015, 0.005]} />
          <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Lower cabinet */}
      <mesh position={[0, -1.3, 0]}>
        <boxGeometry args={[2.2, 0.9, 1.2]} />
        <meshStandardMaterial {...darkMat} />
      </mesh>
      {/* Cabinet door */}
      <mesh position={[-0.4, -1.3, 0.61]}>
        <boxGeometry args={[1.1, 0.8, 0.04]} />
        <meshStandardMaterial color="#080f08" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Door handle */}
      <mesh position={[-0.4, -1.3, 0.64]}>
        <cylinderGeometry args={[0.03, 0.03, 0.25, 12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.3} metalness={0.8} />
      </mesh>
      {/* QR panel */}
      <mesh position={[0.75, -1.15, 0.62]}>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshStandardMaterial color="#050d05" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Feet */}
      {[[-0.75], [0.75]].map(([x], i) => (
        <mesh key={i} position={[x, -1.77, 0]}>
          <boxGeometry args={[0.25, 0.06, 0.8]} />
          <meshStandardMaterial color="#030803" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Ambient glow under machine */}
      <mesh position={[0, -1.82, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#00ff41" emissive="#00ff41" emissiveIntensity={0.15} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

/* ─── 3D Bottle ─── */
function Bottle({ phase }) {
  const ref = useRef();
  const capRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;

    if (phase === 'idle') {
      ref.current.position.y = 1.4 + Math.sin(t * 1.2) * 0.12;
      ref.current.position.x = -0.35;
      ref.current.rotation.z = Math.sin(t * 0.8) * 0.06;
      ref.current.rotation.y = t * 0.3;
      ref.current.scale.setScalar(1);
      ref.current.visible = true;
    } else if (phase === 'entering') {
      // diagonal fall from top-left into slot
      ref.current.position.x = gsap.utils.interpolate(-1.8, -0.35, Math.min(t % 3 / 1.5, 1));
      ref.current.position.y = gsap.utils.interpolate(2.5, -0.42, Math.min(t % 3 / 1.5, 1));
      ref.current.rotation.z = gsap.utils.interpolate(-0.5, 0.2, Math.min(t % 3 / 1.5, 1));
      const s = 1 - Math.min(t % 3 / 1.5, 1) * 0.7;
      ref.current.scale.setScalar(Math.max(s, 0.3));
      ref.current.visible = true;
    } else {
      ref.current.visible = false;
    }
  });

  return (
    <group ref={ref} position={[-0.35, 1.4, 0.8]}>
      {/* Cap */}
      <mesh ref={capRef} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.12, 16]} />
        <meshStandardMaterial color="#00cc33" metalness={0.3} roughness={0.6} emissive="#00cc33" emissiveIntensity={0.2} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.07, 0.11, 0.22, 16]} />
        <meshStandardMaterial color="#c8f0d8" metalness={0.1} roughness={0.05} transparent opacity={0.55} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.68, 20]} />
        <meshStandardMaterial color="#d4f5e0" metalness={0.05} roughness={0.02} transparent opacity={0.45} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.37, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
        <meshStandardMaterial color="#b8ecd0" metalness={0.1} roughness={0.1} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

/* ─── Shredded Pieces ─── */
function ShreddedPieces({ visible }) {
  const pieces = useRef([]);
  useFrame((state) => {
    if (!visible) return;
    pieces.current.forEach((p, i) => {
      if (p) p.rotation.z += 0.01 * (i % 3 === 0 ? 1 : -1);
    });
  });
  if (!visible) return null;
  return (
    <group position={[-0.35, -1.6, 0.4]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          ref={el => pieces.current[i] = el}
          position={[(Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.1]}
          rotation={[Math.random(), Math.random(), Math.random()]}
        >
          <boxGeometry args={[0.08 + Math.random() * 0.12, 0.03, 0.01]} />
          <meshStandardMaterial
            color={['#00aa33', '#007722', '#004411', '#00cc44'][i % 4]}
            metalness={0.1} roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Coin Burst ─── */
function CoinBurst({ visible }) {
  const coins = useRef([]);
  useFrame((state) => {
    if (!visible) return;
    const t = state.clock.elapsedTime;
    coins.current.forEach((c, i) => {
      if (c) {
        c.position.y += 0.008;
        c.rotation.y += 0.08;
        c.material.emissiveIntensity = 0.8 + Math.sin(t * 4 + i) * 0.4;
      }
    });
  });
  if (!visible) return null;
  return (
    <group position={[0.75, 0.8, 0.7]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          ref={el => coins.current[i] = el}
          position={[(Math.random() - 0.5) * 0.4, i * 0.12, (Math.random() - 0.5) * 0.2]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <meshStandardMaterial
            color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1}
            metalness={0.9} roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Main Scene ─── */
function Scene({ phase }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 3]} intensity={0.6} color="#ffffff" />
      <pointLight position={[-2, 0, 2]} intensity={0.8} color="#00ff41" />
      <pointLight position={[2, 1, 2]} intensity={0.4} color="#00aa33" />
      <spotLight position={[0, 5, 3]} angle={0.4} penumbra={0.5} intensity={1} color="#00ff41" castShadow />
      <MachineMesh phase={phase} />
      <Bottle phase={phase} />
      <ShreddedPieces visible={phase === 'processing' || phase === 'reward'} />
      <CoinBurst visible={phase === 'reward'} />
    </>
  );
}

/* ─── Phase label on screen overlay ─── */
const PHASES = ['idle', 'entering', 'processing', 'reward'];
const PHASE_DURATION = [3000, 2500, 2500, 3000];

export default function HeroSection() {
  // ─── Toggle: set to false to show old 3D animation instead of video ───
  const useVideo = true;

  const heroRef = useRef();
  const titleRef = useRef();
  const [phase, setPhase] = useState('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // auto cycle phases
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (phaseIndex + 1) % PHASES.length;
      setPhaseIndex(next);
      setPhase(PHASES[next]);
    }, PHASE_DURATION[phaseIndex]);
    return () => clearTimeout(timer);
  }, [phaseIndex]);

  // title animation on mount
  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(titleRef.current.children,
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out', delay: 0.3 }
    );
  }, []);

  const screenText = {
    idle: { line1: 'START', line2: 'RECYCLING', sub: 'Tap to begin', color: '#00ff41' },
    entering: { line1: 'SCANNING', line2: 'BOTTLE', sub: 'Detecting...', color: '#00ff41' },
    processing: { line1: 'STARTING', line2: '...', sub: 'Loading points', color: '#00ff41' },
    reward: { line1: 'REWARDS', line2: 'EARNED', sub: 'Coins: 4 • 10 pts', color: '#f59e0b' },
  }[phase];

  return (
    <section ref={heroRef} className="hero-section" style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      paddingTop: '5rem',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', right: '5%', top: '50%',
        transform: 'translateY(-50%)',
        width: '50vw', height: '70vh',
        background: 'radial-gradient(ellipse, rgba(0,255,65,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Left — Text */}
      <div className="hero-text" style={{
        flex: '1 1 50%', paddingLeft: 'clamp(1.5rem, 6vw, 6rem)',
        position: 'relative', zIndex: 2,
      }}>
        <div className="mono" style={{
          fontSize: '0.65rem', letterSpacing: '0.2em',
          color: '#00ff41', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <span style={{ width: 24, height: 1, background: '#00ff41', display: 'inline-block' }} />
          SMART REVERSE VENDING MACHINE
        </div>

        <div ref={titleRef} style={{ overflow: 'hidden' }}>
          {['Recycle.', 'Earn.', 'Impact.'].map((word, i) => (
            <div key={i} style={{
              display: 'block',
              fontSize: 'clamp(3.5rem, 8vw, 7rem)',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '0.01em',
              color: i === 1 ? '#00ff41' : '#e8f5e8',
            }}>{word}</div>
          ))}
        </div>

        <p style={{
          marginTop: '2rem', maxWidth: 440,
          color: 'rgba(232,245,232,0.5)',
          fontSize: '0.95rem', lineHeight: 1.7,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
        }}>
          Drop your plastic bottle. Get rewarded instantly.<br />
          Powering a sustainable campus, one bottle at a time.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <Link to="/register" style={{
            textDecoration: 'none',
            background: '#00ff41', color: '#050805',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: '0.85rem', letterSpacing: '0.06em',
            padding: '0.9rem 2rem', borderRadius: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 0 30px rgba(0,255,65,0.3)',
          }}>Sign up</Link>
          <Link to="/simulate" className="hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all duration-300" style={{
            textDecoration: 'none',
            border: '1px solid rgba(0,255,65,0.25)',
            color: 'rgba(232,245,232,0.6)',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '0.78rem', letterSpacing: '0.08em',
            padding: '0.9rem 1.5rem', borderRadius: '8px',
            transition: 'all 0.2s',
          }}>Experience RVM ⚡</Link>
        </div>
      </div>

      {/* Right — Video or 3D Canvas */}
      <div className="hero-media" style={{
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 'clamp(1rem, 4vw, 4rem)',
        position: 'relative',
        zIndex: 2,
      }}>
        {useVideo ? (
          <div className="hero-video-container" style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            aspectRatio: '9 / 16',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid rgba(0,255,65,0.12)',
            background: 'rgba(0,5,0,0.6)',
            transform: 'scale(0.95)',
          }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                opacity: videoLoaded ? 1 : 0,
                transition: 'opacity 0.8s ease',
              }}
            >
              <source src="/videos/machine-flow.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay to match theme */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(5,8,5,0.1) 0%, rgba(5,8,5,0.25) 100%)',
              pointerEvents: 'none',
              opacity: videoLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }} />
            {/* Green glow border overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: 20,
              boxShadow: 'inset 0 0 30px rgba(0,255,65,0.06), 0 0 40px rgba(0,255,65,0.05)',
              pointerEvents: 'none',
            }} />
          </div>
        ) : (
          <div style={{
            width: '100%', maxWidth: 480,
            aspectRatio: '9 / 16',
            position: 'relative',
          }}>
            <Canvas
              camera={{ position: [0, 0, 5.5], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent', borderRadius: 20 }}
            >
              <Scene phase={phase} />
            </Canvas>

            {/* Screen overlay UI */}
            <div style={{
              position: 'absolute',
              top: '18%', right: '14%',
              width: '15%',
              background: 'rgba(2,8,2,0.92)',
              border: `1px solid ${screenText.color}33`,
              borderRadius: 6,
              padding: '0.6rem 0.4rem',
              textAlign: 'center',
              transition: 'all 0.5s',
              pointerEvents: 'none',
            }}>
              <div className="mono" style={{ fontSize: '0.5rem', color: screenText.color, fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.2 }}>
                {screenText.line1}<br />{screenText.line2}
              </div>
              {phase === 'processing' && (
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: '2px solid rgba(0,255,65,0.2)',
                  borderTop: '2px solid #00ff41',
                  margin: '0.4rem auto',
                  animation: 'spin 0.8s linear infinite',
                }} />
              )}
              {phase === 'reward' && (
                <div style={{ fontSize: '0.9rem', margin: '0.3rem 0' }}>🪙🪙🪙</div>
              )}
              <div className="mono" style={{ fontSize: '0.38rem', color: 'rgba(232,245,232,0.4)', marginTop: 3 }}>{screenText.sub}</div>
            </div>

            {/* Phase indicator dots */}
            <div style={{
              position: 'absolute', bottom: '8%', left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: '0.5rem',
            }}>
              {PHASES.map((p, i) => (
                <div key={p} style={{
                  width: i === phaseIndex ? 20 : 6,
                  height: 6, borderRadius: 3,
                  background: i === phaseIndex ? '#00ff41' : 'rgba(0,255,65,0.2)',
                  transition: 'all 0.4s',
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive hero layout */
        @media (max-width: 1024px) {
          .hero-section {
            flex-wrap: wrap !important;
            padding-top: 6rem !important;
          }
          .hero-text {
            flex: 1 1 100% !important;
            padding-right: clamp(1.5rem, 6vw, 6rem) !important;
          }
          .hero-media {
            flex: 1 1 100% !important;
            justify-content: center !important;
            padding: 2rem 1.5rem 3rem !important;
          }
          .hero-video-container {
            max-width: 360px !important;
          }
        }

        @media (max-width: 640px) {
          .hero-video-container {
            max-width: 300px !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </section>
  );
}
