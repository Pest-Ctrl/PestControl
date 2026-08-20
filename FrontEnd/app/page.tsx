import NeonBackground from '@/components/NeonBackground';export default function DeveloperPortal() {
  return (
    <div className="min-h-screen bg-[#050505] flex font-sans">
      <div className="w-full md:w-1/2 bg-[#0d1117] p-8 sm:p-12 md:p-16 lg:p-24 flex flex-col justify-center min-h-screen relative z-10 border-r border-zinc-900 shadow-2xl">
        
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-[#00ff00] text-center uppercase tracking-[0.2em] mb-12">
            Bug Tracking System
          </h1>

          <button className="w-full bg-[#21262d] text-white flex items-center justify-center gap-3 py-3 rounded-md shadow-[0_0_15px_rgba(0,255,0,0.15)] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] border border-zinc-700 hover:border-[#00ff00]/50 transition-all duration-300 mb-8 font-medium">
            <svg height="20" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="20" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
            </svg>
            Continue with GitHub
          </button>

          <div className="flex items-center mb-8">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="px-4 text-sm text-zinc-500 font-semibold tracking-wider">OR</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form className="flex flex-col gap-6">
            <div>
              <input 
                type="email" 
                placeholder = "Enter your email"
                className="w-full bg-transparent border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder = "Enter your password"
                className="w-full bg-transparent border border-zinc-700 rounded-md py-3 px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all"
              />
            </div>

            <button 
              type="button" 
              className="mt-4 w-full py-3.5 rounded-md font-bold tracking-widest uppercase transition-all duration-300
                bg-[#0d1117] text-[#00ff00] border-2 border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.5)]
                hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_25px_rgba(0,255,0,0.8)]"
            >
              Log In
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-3 text-sm">
            <a href="#" className="text-[#3a7541] hover:text-[#00ff00] transition-colors">
              Forgot password?
            </a>
            <a href="#" className="text-[#3a7541] hover:text-[#00ff00] transition-colors">
              Create an account 
            </a>
          </div>
        </div>
        {/* Hiding effect For Mobile gota improve this later*/}
      </div>
      <div className="hidden md:block w-1/2 relative bg-[#050505] min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <NeonBackground />
        </div>
        {/* Anything Else */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0d1117] to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
