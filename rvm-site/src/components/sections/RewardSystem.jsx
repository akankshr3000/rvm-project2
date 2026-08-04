import React from 'react';

export default function RewardSystem() {
  return (
    <section className="mt-16 mb-20 px-4 md:px-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
      
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Reward System
        </h2>
        <p className="text-sm md:text-base mt-2" style={{ color: 'rgba(232, 245, 232, 0.6)', fontFamily: "'Inter', sans-serif" }}>
          Earn eco-points for every bottle you recycle
        </p>
      </div>

      <div 
        className="w-full relative overflow-hidden rounded-2xl p-6 md:p-8 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(0,255,136,0.2)'
        }}
      >
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          🎯 REWARD SYSTEM
        </h3>

        <div className="flex flex-col space-y-3 mx-auto w-fit text-left">
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-semibold text-lg">+25 pts</span>
            <span className="text-gray-300">→ Small Bottle</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-semibold text-lg">+50 pts</span>
            <span className="text-gray-300">→ Medium Bottle</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-400 font-semibold text-lg">+75 pts</span>
            <span className="text-gray-300">→ Large Bottle</span>
          </div>
        </div>

        <div className="my-8 w-full h-[1px] bg-[rgba(0,255,136,0.15)] mx-auto max-w-sm"></div>

        <div className="text-gray-400 space-y-2 text-sm md:text-base text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
          <p>♻️ Points grow with every recycle</p>
          <p>Higher points unlock better rewards</p>
        </div>

        <div className="mt-8 pt-2">
          <p className="text-[#00ff41] font-semibold text-sm tracking-wider uppercase text-center">
            ⚡ Start recycling. Start earning.
          </p>
        </div>
      </div>
    </section>
  );
}
