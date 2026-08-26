"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NeonBackground from '@/components/NeonBackground';
import Scrollable from '@/components/Scrollable';

// Dummy credentials for testing (no DB required)
const DUMMY_USERS = [
  { email: 'test01@gmail.com', password: 'password@1', name: 'Test User 01', role: 'Developer' },
  { email: 'test02@gmail.com', password: 'password@2', name: 'Test User 02', role: 'QA Engineer' },
  { email: 'admin@gmail.com',  password: 'admin@123',  name: 'Admin User',   role: 'Project Manager' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@gmail.com')) {
      setError('Only @gmail.com addresses are permitted.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    // Check dummy credentials
    const user = DUMMY_USERS.find(u => u.email === email && u.password === password);
    if (user) {
      router.push('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    setGhLoading(true);
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans">
      {/* Left Column: Login Form */}
      <Scrollable className="w-full md:w-1/2 bg-[#0d1117] flex flex-col justify-center min-h-screen relative z-10 border-r border-zinc-900 shadow-2xl p-8 sm:p-12 md:p-16 lg:p-24">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold text-white uppercase tracking-[0.15em]">
              Sign <span className="text-[#00ff00]">In</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-2">Bug Tracking System · Engineering Portal</p>
          </div>

          {/* GitHub OAuth Button */}
          <button
            id="github-signin-btn"
            onClick={handleGithubLogin}
            disabled={ghLoading}
            className="w-full bg-[#21262d] text-white flex items-center justify-center gap-3 py-3 shadow-[0_0_15px_rgba(0,255,0,0.15)] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] border border-zinc-700 hover:border-[#00ff00]/50 transition-all duration-300 mb-8 font-medium disabled:opacity-50"
          >
            {ghLoading ? (
              <span className="w-5 h-5 border-2 border-zinc-400 border-t-[#00ff00] rounded-full animate-spin" />
            ) : (
              <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            )}
            Continue with GitHub
          </button>

          <div className="flex items-center mb-8">
            <div className="flex-grow border-t border-zinc-800" />
            <span className="px-4 text-xs text-zinc-600 font-semibold tracking-wider uppercase">or sign in with email</span>
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-900/40 border border-red-500/60 text-red-300 px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="text-red-400">⚠</span> {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0f1a] border border-zinc-700 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00]/30 transition-all text-sm"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0f1a] border border-zinc-700 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00]/30 transition-all text-sm"
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300
                bg-[#0d1117] text-[#00ff00] border-2 border-[#00ff00] shadow-[0_0_12px_rgba(0,255,0,0.4)]
                hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_25px_rgba(0,255,0,0.8)]
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            <a href="/forgot-password" className="text-zinc-600 hover:text-[#00ff00] transition-colors text-xs tracking-wider">
              Forgot password?
            </a>
          </div>

          {/* Test credentials hint */}
          <div className="mt-10 border border-zinc-800 bg-[#0a0f1a] p-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2 font-bold">Demo Credentials</p>
            <div className="space-y-1">
              {DUMMY_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-[#00ff00] transition-colors flex justify-between"
                >
                  <span>{u.email}</span>
                  <span className="text-zinc-600">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Scrollable>

      {/* Right Column: Animated Neon Background */}
      <div className="hidden md:block w-1/2 relative bg-[#050505] min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <NeonBackground />
        </div>
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0d1117] to-transparent z-10 pointer-events-none" />
        {/* Overlay text */}
        <div className="absolute bottom-16 left-12 z-10">
          <p className="text-[#00ff00]/30 text-xs tracking-[0.4em] uppercase font-mono">Defect Lifecycle Management</p>
          <p className="text-[#00ff00]/10 text-xs tracking-[0.3em] uppercase font-mono mt-1">v1.0 · Phase 1</p>
        </div>
      </div>
    </div>
  );
}
