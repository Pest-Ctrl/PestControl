"use client";

import Link from 'next/link';
import GameOfLife from '@/components/GameOfLife';
import NeonBackground from '@/components/NeonBackground';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] relative font-sans overflow-hidden flex flex-col items-center justify-center text-white">
      <GameOfLife />
      
      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-6 text-center">
        <h1 className="text-7xl font-black text-zinc-400 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-[#1ef2c1] mb-8 shadow-sm">
          Page Not Found
        </h2>
        
        <p className="text-zinc-400 mb-12 max-w-lg mx-auto text-sm leading-relaxed">
          The coordinates you entered seem to be outside the known bounds. 
          While you're lost in the void, watch life evolve from chaos.
        </p>

        <Link 
          href="/dashboard" 
          className="px-8 py-3.5 bg-transparent text-[#1ef2c1] font-bold tracking-widest uppercase text-sm border-2 border-[#1ef2c1] shadow-[0_0_12px_rgba(30,242,193,0.3)] hover:bg-[#1ef2c1] hover:text-black hover:shadow-[0_0_25px_rgba(30,242,193,0.6)] transition-all duration-300 rounded-lg"
        >
          Return to Base
        </Link>
      </div>
    </div>
  );
}
