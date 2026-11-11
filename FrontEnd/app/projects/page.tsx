"use client";

import { useEffect, useState } from "react";
import Scrollable from "@/components/Scrollable";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";

interface Space {
  SpaceID: string;
  SpaceName: string;
  OwnerId: string;
  CreatedAt: string;
}

interface Repo {
  RepoID: string;
  GHOwner: string;
  GHName: string;
  ImportedAt: string;
  IsPrivate: boolean;
  SpaceID: string;
  _count: { Issues: number; Commits: number };
}

export default function WorkspacePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // New Workspace modal state
  const [showNewSpace, setShowNewSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/spaces").then(r => r.json()).catch(() => []),
      fetch("/api/repos").then(r => r.json()).catch(() => []),
    ]).then(([spacesData, reposData]) => {
      setSpaces(Array.isArray(spacesData) ? spacesData.filter(Boolean) : []);
      setRepos(Array.isArray(reposData) ? reposData.filter(Boolean) : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSpaceName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create workspace");
      setSpaces(prev => [...prev, data]);
      setShowNewSpace(false);
      setNewSpaceName("");
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredRepos = repos.filter(repo => {
    if (filter === "Public") return !repo.IsPrivate;
    if (filter === "Private") return repo.IsPrivate;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Workspaces</h1>
            <p className="text-xs text-zinc-600">Create a workspace, then import repositories into it</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewSpace(true)}
              className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase rounded-md"
            >
              + New Workspace
            </button>
          </div>
        </header>

        <main className="flex-1 p-8">
          <section className="max-w-7xl mx-auto space-y-10">

            {/* Workspaces Section */}
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-4">Your Workspaces</p>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
                </div>
              ) : spaces.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-lg p-10 text-center">
                  <p className="text-zinc-500 text-sm mb-3">No workspaces yet.</p>
                  <button
                    onClick={() => setShowNewSpace(true)}
                    className="text-xs text-[#1ef2c1] hover:underline"
                  >
                    Create your first workspace →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {spaces.filter(Boolean).map(space => {
                    const spaceRepos = repos.filter(r => r.SpaceID === space.SpaceID);
                    return (
                      <div key={space.SpaceID} className="bg-[#0d1117] border border-zinc-800 rounded-lg p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-sm font-bold text-zinc-100">{space.SpaceName}</h2>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">ID: {space.SpaceID?.split('-')[0]}...</p>
                          </div>
                        </div>
                        <div className="border-t border-zinc-900 pt-3 flex items-center gap-4 text-[10px] text-zinc-500">
                          <span><span className="text-zinc-300 font-mono font-bold">{spaceRepos.length}</span> repos</span>
                          <span><span className="text-zinc-300 font-mono font-bold">{spaceRepos.reduce((a, r) => a + (r._count?.Issues || 0), 0)}</span> issues</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Repositories Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Imported Repositories</p>
                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="bg-[#050505] border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 focus:outline-none focus:border-zinc-600 rounded-md"
                >
                  <option value="All">All Projects</option>
                  <option value="Public">Public Only</option>
                  <option value="Private">Private Only</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
                </div>
              ) : filteredRepos.length === 0 ? (
                <p className="text-zinc-500 text-sm italic text-center py-8">
                  No repositories found. Use the Importer Dashboard to import repos into a workspace.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRepos.map(repo => (
                    <Link
                      href="/dashboard/issues"
                      key={repo.RepoID}
                      className="group block bg-[#0d1117] border border-zinc-800 hover:border-[#1ef2c1]/50 transition-all duration-200 relative overflow-hidden flex flex-col h-48 rounded-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1ef2c1]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">{repo.GHName}</h2>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-1">github.com/{repo.GHOwner}/{repo.GHName}</p>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-zinc-900/50 flex items-center justify-between">
                          <div className="flex gap-4">
                            <div>
                              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Issues</p>
                              <p className="text-xs font-mono text-zinc-300 mt-0.5">{repo._count?.Issues ?? 0}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Commits</p>
                              <p className="text-xs text-zinc-300 mt-0.5 font-mono">{repo._count?.Commits ?? 0}</p>
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
            </div>

          </section>
        </main>
      </Scrollable>

      {/* New Workspace Modal */}
      {showNewSpace && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white">Create Workspace</h3>
              <button onClick={() => { setShowNewSpace(false); setCreateError(""); }} className="text-zinc-500 hover:text-zinc-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {createError && (
              <div className="bg-red-900/40 border border-red-500/60 text-red-300 px-3 py-2 text-sm rounded-lg mb-4">{createError}</div>
            )}
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  placeholder="e.g. Backend Team, Sprint 5..."
                  className="w-full bg-[#050505] border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowNewSpace(false); setCreateError(""); }}
                  className="flex-1 py-2.5 text-xs text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newSpaceName.trim()}
                  className="flex-1 py-2.5 text-xs bg-[#1ef2c1] text-black font-bold rounded-lg hover:bg-[#16b892] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}