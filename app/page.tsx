export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-mono">
      {/* Top Navbar */}
      <nav className="w-full border-b border-neon bg-surface p-4 flex justify-between items-center">
        <div className="text-xl font-bold tracking-widest text-neon animate-pulse">
          > SYS_ADMIN_ROOT
        </div>
        <ul className="flex space-x-8 text-sm">
          <li className="hover:bg-neon hover:text-background px-2 py-1 cursor-pointer transition-colors duration-150">
            [HOME]
          </li>
          <li className="hover:bg-neon hover:text-background px-2 py-1 cursor-pointer transition-colors duration-150">
            [MODULES]
          </li>
          <li className="hover:bg-neon hover:text-background px-2 py-1 cursor-pointer transition-colors duration-150">
            [LOGS]
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl border border-neon bg-surface p-6 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
          
          <header className="mb-6 border-b border-neon/30 pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-neon mb-1">Initialize Core System</h1>
              <p className="text-neon/70 text-xs tracking-widest uppercase">Target: localhost // Port: 3000</p>
            </div>
            <div className="text-xs text-neon/70">
              Latency: 12ms | Status: ONLINE
            </div>
          </header>

          <section className="space-y-3 text-sm text-neon/90">
            <div className="flex items-start">
              <span className="mr-4 text-neon select-none">root@system:~#</span>
              <p>Mounting virtual volumes... [OK]</p>
            </div>
            <div className="flex items-start">
              <span className="mr-4 text-neon select-none">root@system:~#</span>
              <p>Establishing secure socket connection... [OK]</p>
            </div>
            <div className="flex items-start">
              <span className="mr-4 text-neon select-none">root@system:~#</span>
              <p>Loading user interface modules... <span className="animate-pulse">_</span></p>
            </div>
          </section>

          <div className="mt-10 flex gap-4">
            <button className="border border-neon bg-background text-neon px-8 py-2 hover:bg-neon hover:text-background transition-all uppercase tracking-widest text-sm font-bold">
              Execute
            </button>
            <button className="border border-neon/40 bg-surface text-neon/60 px-8 py-2 hover:border-neon hover:text-neon transition-all uppercase tracking-widest text-sm font-bold">
              Abort
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
