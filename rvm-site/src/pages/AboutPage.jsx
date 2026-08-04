import { motion } from 'framer-motion';
import { Globe, Sparkles, BarChart, Settings, Eye, Target, FileText } from 'lucide-react';
import ContributorCarousel from '../components/ContributorCarousel';

export default function AboutPage() {
  const headingStyle = {
    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
    fontWeight: 700,
    color: '#e8f5e8',
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: '1rem',
  };

  const contributors = [
    {
      name: 'Dr. P. Pani Rama Prasad',
      role: 'Principal Investigator',
      src: '/images/pani.jpg',
      description: `Dr. P. Pani Rama Prasad holds a B.E., M.Tech., and Ph.D. in Computer Science and Engineering, and has over 27 years of teaching experience at Ballari Institute of Technology & Management (BITM), Ballari, where he has contributed significantly to teaching, research, and academic administration. He has published 50+ research papers and holds 15+ patents, with 2 patents granted, and is currently leading a ₹5 Lakh funded research project promoting innovation and applied research.

His teaching interests include Software Engineering, Cloud Computing, Artificial Intelligence, and related emerging technologies, while his research primarily focuses on Software Engineering.

He is currently serving as a Professor in the Department of Computer Science and Engineering at Ballari Institute of Technology & Management, Ballari, Karnataka, India.`
    },
    {
      name: 'Dr.C.K.Srinivas',
      role: 'Co-Principal Investigator',
      src: '/images/ck.jpg',
      description: `Dr. C. K. Srinivasa holds an M.Tech in Computer Science and Engineering from Kuvempu University, Karnataka, India, and has completed his Ph.D. in Software Engineering from Visvesvaraya Technological University (VTU), Belagavi. He has published 35 research papers and holds 17 patents.

His teaching interests include Computer Programming, Computer Graphics, Machine Learning, Artificial Intelligence, Object- Oriented Analysis and Design, and NoSQL.His research primarily focuses on Software Engineering.

He is currently serving as a Professor in the Department of Computer Science and Engineering at Ballari Institute of Technology & Management, Ballari, Karnataka, India.`
    },
    {
      name: 'Dr.R.N. Kulkarni',
      role: 'Investigating Team Member',
      src: '/images/rnk.jpg',
      description: 'Investigating Team Member'
    },
  ];

  const teamMembers = [
    { name: 'Tagore Chowdary Kakarla', role: '', src: '', description: '' },
    { name: 'Sathvik V.S', role: '', src: '', description: '' },
    { name: 'V. Sunila', role: '', src: 'images/sunil.jpg', description: '' },
    { name: 'Sohail', role: '', src: 'images/sohail.jpg', description: '' },
    { name: 'Sooraj B', role: '', src: '/images/sooraj.jpg', description: '' },
    { name: 'Akanksh R', role: '', src: '/images/akanksh.jpg', description: '' },
    { name: 'Mahima Swaroopa.C.K', role: '', src: '/images/mahi.jpg', description: '' },
    { name: 'E Harsha', role: '', src: '/images/harsha.jpg', description: '' },
    { name: 'Harshitha T', role: '', src: '/images/harshitha.jpg', description: '' },
    { name: 'K.P.Sai Pravallika', role: '', src: '/images/kp.jpg', description: '' },
    { name: 'Deekshitha B', role: '', src: '/images/deeksh.jpg', description: '' },
  ];

  const objectives = [
    { icon: <Globe size={24} color="#00ff88" strokeWidth={2} />, title: 'Zero Footprint', desc: 'Significantly reduce plastic waste in campuses and public arenas.' },
    { icon: <Sparkles size={24} color="#00ff88" strokeWidth={2} />, title: 'Gamified Action', desc: 'Instantly reward individuals actively building localized sustainability habits.' },
    { icon: <BarChart size={24} color="#00ff88" strokeWidth={2} />, title: 'Data Analytics', desc: 'Secure live dashboards tracking global hardware distribution impacts.' },
    { icon: <Settings size={24} color="#00ff88" strokeWidth={2} />, title: 'Automated Flow', desc: 'Fully frictionless pipeline spanning bin inserts straight to user accounts.' }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '8rem clamp(1.5rem, 6vw, 15rem) 4rem', overflowX: 'hidden' }}>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ textAlign: 'center', marginBottom: '6rem' }}
      >
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 700, letterSpacing: '0.01em' }}>
          About <span style={{ color: '#00ff41' }}>RVM°</span>
        </h1>
        <p className="mono" style={{ fontSize: '0.9rem', color: 'rgba(232,245,232,0.4)', marginTop: '1rem', letterSpacing: '0.1em' }}>
          RECYCLING. REWARDING. REVOLUTIONIZING.
        </p>
      </motion.div>

      {/* Hero-style About Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(145deg, rgba(0,255,65,0.05), rgba(0,0,0,0.6))',
          border: '1px solid rgba(0,255,65,0.15)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 4rem)',
          marginBottom: '6rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,255,65,0.03)'
        }}
      >
        {/* Glow backdrop */}
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '60%', height: '150%', background: 'radial-gradient(ellipse, rgba(0,255,65,0.08) 0%, transparent 60%)', filter: 'blur(50px)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,255,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,255,65,0.3)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2"><path d="M4 11v8a2 2 0 002 2h12a2 2 0 002-2v-8m-10-8L4 11m16 0l-6-8" /></svg>
            </div>
            <h2 style={{ ...headingStyle, marginBottom: 0 }}>The Smart Solution</h2>
          </div>

          <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'rgba(232,245,232,0.8)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
            The Smart <span style={{ color: '#00ff41', fontWeight: 600 }}>Reverse Vending Machine</span> is an innovative integration of complex
            hardware sensors and engaging gamified software interfaces.
          </p>
          <p style={{ fontSize: 'clamp(1rem, 1.5vw, 1.15rem)', color: 'rgba(232,245,232,0.6)', lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
            We actively encourage and seamlessly track daily plastic recycling across major campuses.
            Every single submission unlocks real-time measurable impact and <span style={{ borderBottom: '1px dashed #00ff41', color: '#00ff41' }}>instant point rewards</span> right into your dashboard wallet.
          </p>
        </div>
      </motion.div>

      {/* Objectives Interactive Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '6rem' }}
      >
        <h2 style={{ ...headingStyle, textAlign: 'center', marginBottom: '3rem' }}>Core Objectives</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {objectives.map((obj, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03, y: -5, borderColor: 'rgba(0,255,65,0.4)', boxShadow: '0 10px 30px rgba(0,255,65,0.08)' }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                background: 'rgba(5,8,5,0.6)',
                border: '1px solid rgba(0,255,65,0.08)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                cursor: 'default',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ marginBottom: '1rem', background: 'rgba(0,255,136,0.05)', width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, border: '1px solid rgba(0,255,136,0.2)' }}>{obj.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e8f5e8', marginBottom: '0.75rem', fontFamily: "'Space Grotesk', sans-serif" }}>{obj.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{obj.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vision & Mission Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '8rem' }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,65,0.08) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(0,255,65,0.2)',
            borderRadius: '20px',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Eye size={32} color="#00ff88" strokeWidth={2} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00ff88', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Vision</h2>
          </div>
          <p style={{ fontSize: '1.05rem', color: 'rgba(232,245,232,0.7)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", position: 'relative', zIndex: 1 }}>
            A world where active sustainability is not seen as a chore, but an engaging and fiercely rewarding daily habit for everyone, creating genuine zero-waste smart communities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(5,8,5,0.9) 0%, rgba(0,255,65,0.05) 100%)',
            border: '1px solid rgba(0,255,65,0.2)',
            borderRadius: '20px',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Target size={32} color="#00ff88" strokeWidth={2} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00ff88', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Mission</h2>
          </div>
          <p style={{ fontSize: '1.05rem', color: 'rgba(232,245,232,0.7)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", position: 'relative', zIndex: 1 }}>
            To deploy interactive, accessible, and highly intelligent reverse vending architectures that seamlessly bridge simple eco-friendly gestures with incredibly satisfying tangible progression loops.
          </p>
        </motion.div>
      </div>

      {/* SDG Goals Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: '8rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.2em', color: '#00ff41', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ width: 16, height: 1, background: '#00ff41', display: 'inline-block' }} />
            UNITED NATIONS
            <span style={{ width: 16, height: 1, background: '#00ff41', display: 'inline-block' }} />
          </div>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: '1rem' }}>
            SDG Goals We <span style={{ color: '#00ff41' }}>Champion</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(232,245,232,0.5)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: 560, margin: '0 auto' }}>
            RVM° directly contributes to the United Nations' 2030 Agenda for Sustainable Development across these key goals.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              num: '11',
              color: '#FF9800',
              emoji: '🏙️',
              title: 'Sustainable Cities & Communities',
              desc: 'Smart waste infrastructure transforms campuses into model sustainable communities, paving the way for smarter, greener urban environments.'
            },
            {
              num: '12',
              color: '#BF360C',
              emoji: '♻️',
              title: 'Responsible Consumption & Production',
              desc: 'By incentivizing recycling with real rewards, RVM° actively promotes circular economy principles and responsible waste habits.'
            },
            {
              num: '13',
              color: '#1565C0',
              emoji: '🌍',
              title: 'Climate Action',
              desc: 'Diverting plastic from landfills and oceans directly reduces greenhouse gas emissions, contributing meaningfully to climate change mitigation.'
            },
            {
              num: '17',
              color: '#4A148C',
              emoji: '🤝',
              title: 'Partnerships for the Goals',
              desc: 'RVM° brings together institutions, students, and technology partners to build scalable sustainability ecosystems that scale beyond a single campus.'
            }
          ].map((sdg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -6, boxShadow: `0 16px 40px ${sdg.color}22` }}
              style={{
                background: 'rgba(5,8,5,0.7)',
                border: `1px solid ${sdg.color}33`,
                borderRadius: '20px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backdropFilter: 'blur(10px)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* SDG Number Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `linear-gradient(135deg, ${sdg.color}cc, ${sdg.color}88)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 20px ${sdg.color}44`,
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{sdg.emoji}</span>
                </div>
                <div>
                  <div className="mono" style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    color: sdg.color,
                    opacity: 1,
                    textShadow: `0 0 10px ${sdg.color}66`,
                    marginBottom: '0.4rem'
                  }}>
                    SDG GOAL {sdg.num}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e8f5e8', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
                    {sdg.title}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(232,245,232,0.55)', lineHeight: 1.65, fontFamily: "'Inter', sans-serif", margin: 0 }}>
                {sdg.desc}
              </p>
              {/* Subtle color glow */}
              <div style={{ position: 'absolute', bottom: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${sdg.color}22, transparent 70%)`, borderRadius: '50%' }} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contributors Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Core Contributors</h2>
          <p className="mono" style={{ fontSize: '0.85rem', color: 'rgba(232,245,232,0.4)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
            THE MINDS WHO BUILT THE ECO-LOOP.
          </p>
        </div>

        <ContributorCarousel team={contributors} />
      </motion.div>

      {/* Team Members Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Our Team <span style={{ color: '#00ff41' }}>&amp; Members</span></h2>
          <p className="mono" style={{ fontSize: '0.85rem', color: 'rgba(232,245,232,0.4)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
            THE PEOPLE WHO POWER THE MISSION.
          </p>
        </div>

        <ContributorCarousel team={teamMembers} />
      </motion.div>

      {/* Recycling Network Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '6rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ ...headingStyle, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Recycling <span style={{ color: '#00ff88' }}>Network</span></h2>
          <p className="mono" style={{ fontSize: '0.85rem', color: 'rgba(232,245,232,0.4)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
            WHERE YOUR PLASTIC GOES NEXT.
          </p>
        </div>

        <div style={{
          background: 'rgba(0,255,136,0.02)',
          border: '1px solid rgba(0,255,136,0.1)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 4rem)',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ fontSize: '1.2rem', color: 'rgba(232,245,232,0.8)', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", maxWidth: '800px', margin: '0 auto 2.5rem' }}>
            After processing and crushing, the plastic materials collected through our RVM are supplied in bulk to certified recycling and manufacturing companies. Explore our verified partners and supply chain details below.
          </p>

          <motion.a
            href="/docs/recycling-partners.pdf"
            target="_blank"
            whileHover={{ scale: 1.05, y: -5, boxShadow: '0 0 20px rgba(0,255,136,0.3)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2rem',
              background: 'transparent',
              border: '2px solid #00ff88',
              borderRadius: '12px',
              color: '#00ff88',
              textDecoration: 'none',
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            <FileText size={20} />
            View Recycling Partners
          </motion.a>
        </div>
      </motion.div>

      {/* With Gratitude / Funding Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
        style={{ marginBottom: '4rem' }}
      >
        <div className="parent-section">
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0.8) 100%)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: '24px',
            padding: 'clamp(2.5rem, 6vw, 5rem)',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,255,136,0.05)',
            zIndex: 1
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="mono" style={{ fontSize: '0.7rem', color: '#00ff88', letterSpacing: '0.3em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Supported by Our Institution
              </div>
              <h2 style={{ ...headingStyle, fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '2rem' }}>
                With <span style={{ color: '#00ff88' }}>Gratitude</span>
              </h2>
              <p style={{
                fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                color: 'rgba(232,245,232,0.9)',
                lineHeight: 1.8,
                fontFamily: "'Inter', sans-serif",
                maxWidth: '900px'
              }}>
                We sincerely thank our institution for their invaluable support and belief in our vision. With a generous funding of <span style={{ color: '#00ff88', fontWeight: 700 }}>₹5,00,000</span>, they empowered us to bring the Smart Reverse Vending Machine (RVM) to life. Their encouragement has been instrumental in driving innovation, sustainability, and real-world impact through our project.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .parent-section {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
        }

        .parent-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url('/assets/college-logo.png');
          background-repeat: no-repeat;
          background-position: right center;
          background-size: 280px;
          opacity: 0.06;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

    </div>
  );
}
