"use client";

import React, { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-[#0d1117] p-6 sm:p-8 border border-zinc-800 rounded-lg shadow-2xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1ef2c1] mb-5 sm:mb-6">Reset Password</h1>
        
        {submitted ? (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-md text-sm mb-6">
            A reset notification has been sent to the Admin : {email}.
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <p className="text-zinc-400 text-sm mb-2">
              Enter your email address and we will notify the space creator.
            </p>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:border-[#1ef2c1] focus:ring-1 focus:ring-[#1ef2c1] transition-all"
              required
            />
            <button 
              type="submit" 
              className="mt-2 w-full py-3 rounded-md font-bold uppercase transition-all duration-300
                bg-[#1ef2c1] text-black hover:bg-[#16b892]"
            >
              Send Reset Request
            </button>
          </form>
        )}
        
        <div className="mt-8 text-center">
          <a href="/login" className="text-zinc-500 hover:text-[#1ef2c1] transition-colors text-sm">
            
          </a>
        </div>
      </div>
    </div>
  );
}
