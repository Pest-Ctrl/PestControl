import Scrollable from "@/components/Scrollable";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";

// Dummy workspace data
const WORKSPACES = [
  { 
    id: 'ws-01', 
    name: 'Flowstate', 
    description: 'Main web application repository and tracker.',
    role: 'Owner', 
    status: 'Active', 
    issueCount: 24, 
    lastUpdated: '2 hours ago',
    color: 'var(--color-neon)'
  },
  { 
    id: 'ws-02', 
    name: 'Bug Tracking System', 
    description: 'Bug monitoring and logging service.',
    role: 'Admin', 
    status: 'Active', 
    issueCount: 8, 
    lastUpdated: '5 hours ago',
    color: 'var(--color-neon)'
  },
  { 
    id: 'ws-03', 
    name: 'Math solver', 
    description: 'Math-Solver',
    role: 'Owner', 
    status: 'Completed', 
    issueCount: 0, 
    lastUpdated: '2 weeks ago',
    color: '#3b82f6' // Blue for completed/stable
  },
  { 
    id: 'ws-04', 
    name: 'ChainReaction', 
    description: 'Legacy multiplayer game project.',
    role: 'Viewer', 
    status: 'Archived', 
    issueCount: 2, 
    lastUpdated: '6 months ago',
    color: '#71717a' // Zinc for archived
  },
];

export default function WorkspacePage() {
  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      {/* Main Content */}
      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Workspaces</h1>
            <p className="text-xs text-zinc-600">Select a project context to view issues</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-neon text-black text-xs font-bold px-4 py-1.5 hover:bg-neon-hover transition-colors tracking-wider uppercase">
              + New Workspace
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <section className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
                Your Projects
              </p>
              
              {/* Optional Filter/Sort - matching your dashboard style */}
              <div className="flex items-center gap-2">
                <select className="bg-[#050505] border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 focus:outline-none focus:border-zinc-600">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {WORKSPACES.map((workspace) => (
                <Link 
                  href="/space" 
                  key={workspace.id}
                  className="group block bg-surface border border-zinc-900 hover:border-zinc-700 transition-all duration-200 relative overflow-hidden flex flex-col h-48"
                >
                  {/* Subtle top border highlight on hover */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-zinc-800 group-hover:bg-neon/50 transition-colors" />

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">
                          {workspace.name}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                          {workspace.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-[#050505] border border-zinc-800 px-2 py-1">
                        <span 
                          className={`w-1.5 h-1.5 rounded-full ${workspace.status === 'Active' ? 'animate-pulse' : ''}`} 
                          style={{ backgroundColor: workspace.color }}
                        />
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                          {workspace.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-zinc-900/50 flex items-center justify-between">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Issues</p>
                          <p className="text-xs font-mono text-zinc-300 mt-0.5">{workspace.issueCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Role</p>
                          <p className="text-xs text-zinc-300 mt-0.5">{workspace.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Updated</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{workspace.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </Scrollable>
    </div>
  );
}