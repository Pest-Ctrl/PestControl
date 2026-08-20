import React from 'react';
import Scrollable from '@/components/Scrollable';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-white h-screen">
      <header className="border-b border-zinc-800 p-6 bg-[#0a0a0a]">
        <h1 className="text-2xl font-bold text-[#00ff00]">Dashboard</h1>
      </header>
      <Scrollable className="flex-1 p-8">
        <div className="max-w-4xl mx-auto border border-zinc-800 rounded-lg p-6 bg-[#0d1117]">
          <h2 className="text-xl mb-4 text-white font-bold">Welcome back!</h2>
          <p className="text-zinc-400 mb-8">You have successfully logged in.</p>
          
          <div className="h-[1000px] border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 mb-8 rounded-lg">
            <p className = "text-center"> A dash board analysitcs</p>
          </div>
          
          <div className="text-center">
            <a href = "/space" className="text-[#00ff00] hover:text-[#00cc00] transition-colors font-bold">
              Go to Space
            </a>
          </div>
        </div>
      </Scrollable>
    </div>
  );
}
