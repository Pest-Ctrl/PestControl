"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import GameOfLife from '@/components/GameOfLife';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Unknown Error';

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Check if the database and environment variables are set up correctly.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center max-w-4xl w-full px-4 sm:px-6 text-center">
      <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1ef2c1] via-[#1ef2c1]/80 to-[#1ef2c1] mb-2 uppercase tracking-widest">
        Authentication Error
      </h1>
      <h2 className="text-base sm:text-xl font-bold tracking-[0.2em] text-zinc-400 mb-6 sm:mb-8 break-words max-w-full">
        Code: {error}
      </h2>
      
      <p className="text-zinc-300 mb-8 sm:mb-12 max-w-lg mx-auto text-sm leading-relaxed border border-red-500/30 bg-red-500/10 p-4 rounded-lg">
        {getErrorMessage(error)}
      </p>

      <p className="text-zinc-500 mb-8 sm:mb-12 text-xs uppercase tracking-widest">
        While we fix this, enjoy some cellular automata
      </p>

      <Link 
        href="/login" 
        className="px-8 py-3.5 bg-transparent text-[#1ef2c1] font-bold tracking-widest uppercase text-sm border-2 border-[#1ef2c1] shadow-[0_0_12px_rgba(30,242,193,0.3)] hover:bg-[#1ef2c1] hover:text-black hover:shadow-[0_0_25px_rgba(30,242,193,0.6)] transition-all duration-300 rounded-lg"
      >
        Return to Login
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#050505] relative font-sans overflow-hidden flex flex-col items-center justify-center text-white">
      <GameOfLife />
      <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
