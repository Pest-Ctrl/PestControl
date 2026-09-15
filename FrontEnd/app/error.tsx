"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import GameOfLife from '@/components/GameOfLife';
import NeonBackground from '@/components/NeonBackground';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050505] relative font-sans overflow-hidden flex flex-col items-center justify-center text-white">
      <GameOfLife />

      <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-6 text-center">
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-400 to-red-600 mb-2">
          500
        </h1>
        <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-red-500 mb-8 shadow-sm">
          System Malfunction
        </h2>
        
        <p className="text-zinc-400 mb-12 max-w-lg mx-auto text-sm leading-relaxed">
          A critical error occurred in the system. While our engineers investigate the anomaly, 
          enjoy this simulation of cellular automata.
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => reset()}
            className="px-8 py-3.5 bg-transparent text-red-400 font-bold tracking-widest uppercase text-sm border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:bg-red-500 hover:text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-300 rounded-lg"
          >
            Try Again
          </button>
          
          <Link 
            href="/dashboard" 
            className="px-8 py-3.5 bg-transparent text-zinc-300 font-bold tracking-widest uppercase text-sm border-2 border-zinc-600 hover:bg-zinc-800 hover:border-zinc-400 transition-all duration-300 rounded-lg"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
