"use client";

import { useEffect, useState } from "react";
import Scrollable from "@/components/Scrollable";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";

interface Repo {
  RepoID: string;
  GHOwner: string;
  GHName: string;
  ImportedAt: string;
  IsPrivate: boolean;
  _count: { Issues: number; Commits: number };
}

export default function WorkspacePage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => {
        setRepos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
            <button className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase rounded-md">
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
                <select className="bg-[#050505] border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 focus:outline-none focus:border-zinc-600 rounded-md">
                  <option>All Statuses</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : repos.length === 0 ? (
              <p className="text-zinc-500 text-sm italic text-center py-12">No workspaces found. Import a repository to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {repos.map((repo) => (
                  <Link 
                    href="/dashboard/issues" 
                    key={repo.RepoID}
                    className="group block bg-[#0d1117] border border-zinc-800 hover:border-[#1ef2c1]/50 shadow-[0_0_20px_rgba(30,242,193,0.02)] transition-all duration-200 relative overflow-hidden flex flex-col h-48 rounded-lg"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1ef2c1]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">
                            {repo.GHName}
                          </h2>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                            github.com/{repo.GHOwner}/{repo.GHName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#050505] border border-zinc-800 px-2 py-1 rounded">
                          <span 
                            className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#1ef2c1]" 
                          />
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-zinc-900/50 flex items-center justify-between">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Issues</p>
                            <p className="text-xs font-mono text-zinc-300 mt-0.5">{repo._count.Issues}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Commits</p>
                            <p className="text-xs text-zinc-300 mt-0.5 font-mono">{repo._count.Commits}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Visibility</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{repo.IsPrivate ? 'Private' : 'Public'}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>
      </Scrollable>
    </div>
  );
}