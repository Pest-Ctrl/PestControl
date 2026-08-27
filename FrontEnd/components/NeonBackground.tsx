import React from 'react';

export default function NeonBackground() {
  // A clean, high-performance background with 5 large stripes and staggered delays
  const stripes = [
    { height: 'h-32', bg: 'bg-gradient-to-r from-black via-[#1ef2c1] to-black animate-flow-rtl', opacity: 'opacity-40', delay: '0s' },
    { height: 'h-16', bg: 'bg-gradient-to-l from-[#1ef2c1] to-transparent animate-flow-rtl', opacity: 'opacity-60', delay: '2s' },
    { height: 'h-48', bg: 'bg-gradient-to-r from-[#001f19] via-[#1ef2c1] to-black animate-flow-rtl', opacity: 'opacity-30', delay: '4s' },
    { height: 'h-24', bg: 'bg-gradient-to-r from-transparent to-[#1ef2c1] animate-flow-rtl', opacity: 'opacity-50', delay: '6s' },
    { height: 'h-40', bg: 'bg-gradient-to-l from-[#1ef2c1] via-[#000f0a] to-black animate-flow-rtl', opacity: 'opacity-20', delay: '8s' },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <div className="absolute w-[250vw] h-[250vh] flex flex-col justify-center gap-8 transform rotate-45 pointer-events-none">
        {stripes.map((stripe, index) => (
          <div 
            key={index} 
            className={`w-full ${stripe.height} ${stripe.bg} ${stripe.opacity} shadow-[0_0_20px_rgba(30,242,193,0.15)]`}
            style={{ 
              animationDelay: stripe.delay,
              animationDuration: '10s' 
            }}
          />
        ))}
      </div>
      {/* Vignette overlay so the edges fade into black */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
    </div>
  );
}
