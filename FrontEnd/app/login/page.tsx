"use client";

import NeonBackground from '@/components/NeonBackground';
import Scrollable from '@/components/Scrollable';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Dummy credentials for testing (no DB required)
const DUMMY_USERS = [
  { email: 'test01@gmail.com', password: 'password@1', name: 'Test User 01', role: 'Developer' },
  { email: 'test02@gmail.com', password: 'password@2', name: 'Test User 02', role: 'QA Engineer' },
  { email: 'admin@gmail.com', password: 'admin@123', name: 'Admin User', role: 'Project Manager' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ghLoading, setGhLoading] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

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
    try {
      const response = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (response?.error) {
        setError(response.error);
      } else if (response?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }

  };

  const handleGithubLogin = async () => {
    setGhLoading(true);
    await signIn('github', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-[#050505] relative font-sans overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <NeonBackground />
      </div>

      {/* Foreground Login Box */}
      <Scrollable className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4 sm:p-8">
        <div className="max-w-md w-full bg-[#050505]/60 backdrop-blur-xl border border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle top glow line for the card */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1ef2c1] to-transparent opacity-50" />

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white uppercase tracking-[0.15em]">
              Sign <span className="text-[#1ef2c1]">In</span>
            </h1>
            <p className="text-zinc-400 text-xs mt-3 tracking-widest uppercase">Bug Tracking System</p>
          </div>

          {/* GitHub OAuth Button */}
          <button
            id="github-signin-btn"
            onClick={handleGithubLogin}
            disabled={ghLoading}
            className="w-full bg-[#0d1117]/80 text-white flex items-center justify-center gap-3 py-3.5 shadow-[0_0_15px_rgba(30,242,193,0.1)] hover:shadow-[0_0_20px_rgba(30,242,193,0.25)] border border-zinc-700/50 hover:border-[#1ef2c1]/50 transition-all duration-300 mb-8 font-medium disabled:opacity-50 rounded-lg"
          >
            {ghLoading ? (
              <span className="w-5 h-5 border-2 border-zinc-400 border-t-[#1ef2c1] rounded-full animate-spin" />
            ) : (
              <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            )}
            Continue with GitHub
          </button>

          <div className="flex items-center mb-8 opacity-70">
            <div className="flex-grow border-t border-zinc-700" />
            <span className="px-4 text-[10px] text-zinc-400 font-semibold tracking-widest uppercase">or email</span>
            <div className="flex-grow border-t border-zinc-700" />
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            {error && (
              <div id="InvalidCreds" className="bg-red-900/40 border border-red-500/60 text-red-300 px-4 py-2.5 text-sm flex items-center gap-2 rounded-lg">
                <span className="text-red-400">⚠</span> {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505]/80 border border-zinc-700 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#1ef2c1] focus:ring-1 focus:ring-[#1ef2c1]/30 transition-all text-sm rounded-lg"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050505]/80 border border-zinc-700 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#1ef2c1] focus:ring-1 focus:ring-[#1ef2c1]/30 transition-all text-sm rounded-lg"
                required
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300
                bg-transparent text-[#1ef2c1] border-2 border-[#1ef2c1] shadow-[0_0_12px_rgba(30,242,193,0.3)]
                hover:bg-[#1ef2c1] hover:text-black hover:shadow-[0_0_25px_rgba(30,242,193,0.6)]
                disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              {loading ? 'Authenticating...' : 'Log In'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-3 text-sm">
            <a href="/forgot-password" className="text-zinc-500 hover:text-[#1ef2c1] transition-colors text-xs tracking-wider">
              Forgot password?
            </a>
          </div>

          {/* Test credentials hint */}
          <div className="mt-10 border border-zinc-800/50 bg-[#000000]/40 p-4 rounded-lg">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-bold text-center">Demo Credentials</p>
            <div className="space-y-1">
              {DUMMY_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="w-full text-left px-3 py-2 text-[11px] text-zinc-400 hover:bg-zinc-800/50 hover:text-[#1ef2c1] transition-colors flex justify-between rounded-md"
                >
                  <span className="font-mono">{u.email}</span>
                  <span className="text-zinc-600">{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Scrollable>
    </div>
  );
}
