import React from 'react';

export default function NeonBackground() {
  const stripes = [
    { height: 'h-4', bg: 'bg-gradient-to-r from-black via-[#00ff00] to-black animate-flow-rtl', opacity: 'opacity-40' },
    { height: 'h-12', bg: 'bg-gradient-to-r from-[#003300] via-[#00ff00] to-[#002200] animate-flow-rtl', opacity: 'opacity-90' },
    { height: 'h-2', bg: 'bg-[#00ff00]', opacity: 'opacity-100' },
    { height: 'h-8', bg: 'bg-gradient-to-r from-black to-[#00aa00] animate-flow-rtl', opacity: 'opacity-60' },
    { height: 'h-16', bg: 'bg-gradient-to-l from-[#00ff00] to-transparent animate-flow-rtl', opacity: 'opacity-80' },
    { height: 'h-1', bg: 'bg-[#00ff00]', opacity: 'opacity-100' },
    
    { height: 'h-24', bg: 'bg-black', opacity: 'opacity-100' },
    { height: 'h-4', bg: 'bg-gradient-to-r from-[#001100] to-black animate-flow-rtl', opacity: 'opacity-50' },
    { height: 'h-32', bg: 'bg-black', opacity: 'opacity-100' },
    { height: 'h-2', bg: 'bg-[#00ff00]', opacity: 'opacity-20' },
    { height: 'h-16', bg: 'bg-black', opacity: 'opacity-100' },

    { height: 'h-6', bg: 'bg-gradient-to-r from-transparent to-[#00ff00]', opacity: 'opacity-70' },
    { height: 'h-2', bg: 'bg-[#00ff00]', opacity: 'opacity-100' },
    { height: 'h-16', bg: 'bg-gradient-to-r from-[#002200] via-[#00ff00] to-black', opacity: 'opacity-80' },
    { height: 'h-8', bg: 'bg-[#003300]', opacity: 'opacity-50' },
    { height: 'h-10', bg: 'bg-gradient-to-l from-[#00ff00] to-[#001100]', opacity: 'opacity-90' },
    { height: 'h-1', bg: 'bg-[#00ff00]', opacity: 'opacity-100' },
    { height: 'h-12', bg: 'bg-gradient-to-r from-black to-[#00ff00]', opacity: 'opacity-30' },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <div className="absolute w-[200vw] h-[200vh] flex flex-col justify-center gap-1 transform rotate-45 pointer-events-none">
        {stripes.map((stripe, index) => (
          <div 
            key={index} 
            className={`w-full ${stripe.height} ${stripe.bg} ${stripe.opacity} shadow-[0_0_15px_rgba(0,255,0,0.1)]`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
}
