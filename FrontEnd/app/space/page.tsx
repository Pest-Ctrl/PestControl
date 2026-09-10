"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";
import FileTreeVisualizer from "@/components/dashboard/FileTreeVisualizer";

interface Repo {
  RepoID: string;
  GHOwner: string;
  GHName: string;
  FileTree?: any;
}

interface Commit {
  CommitID: string;
  SHA: string;
  Message: string;
}

export default function CreateIssuePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [bugType, setBugType] = useState("Functional");
  const [repoId, setRepoId] = useState("");
  const [commitId, setCommitId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [lineRange, setLineRange] = useState("");
  const [environment, setEnvironment] = useState("");

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => setRepos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (repoId) {
      fetch(`/api/commits?repoId=${repoId}`)
        .then((r) => r.json())
        .then((data) => setCommits(Array.isArray(data) ? data : []))
        .catch(() => {});
    } else {
      setCommits([]);
    }
  }, [repoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          severity,
          bugType,
          repoId: repoId || undefined,
          commitId: commitId || undefined,
          filePath: filePath || undefined,
          lineRange: lineRange || undefined,
          environment: environment || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create issue");
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/issues"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      <Scrollable className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4">
          <h1 className="text-lg font-bold text-white tracking-wide">Create Issue</h1>
          <p className="text-xs text-zinc-400">File a new defect report</p>
        </header>

        <main className="flex-1 p-8 max-w-4xl">
          {success ? (
            <div className="bg-[#1ef2c1]/10 border border-[#1ef2c1]/30 p-6 rounded-lg text-center">
              <p className="text-[#1ef2c1] font-bold text-lg mb-2">Issue Created Successfully</p>
              <p className="text-zinc-400 text-sm">Redirecting to issues board...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/40 border border-red-500/60 text-red-300 px-4 py-3 text-sm rounded-lg">
                  ⚠ {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the defect"
                  className="w-full bg-[#0d1117] border border-zinc-800 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#1ef2c1]/50 text-sm rounded-lg"
                  maxLength={200}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Steps to reproduce, expected vs actual behavior..."
                  rows={6}
                  className="w-full bg-[#0d1117] border border-zinc-800 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#1ef2c1]/50 text-sm rounded-lg resize-none"
                  required
                />
              </div>

              {/* Severity & Bug Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-[#0d1117] border border-zinc-800 py-3 px-4 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                    Bug Type
                  </label>
                  <select
                    value={bugType}
                    onChange={(e) => setBugType(e.target.value)}
                    className="w-full bg-[#0d1117] border border-zinc-800 py-3 px-4 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Performance">Performance</option>
                    <option value="Security">Security</option>
                    <option value="UI">UI</option>
                    <option value="Compatibility">Compatibility</option>
                    <option value="Data">Data</option>
                  </select>
                </div>
              </div>

              {/* Repo & Commit Reference */}
              <div className="border border-zinc-800 p-5 rounded-lg space-y-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Repository Reference</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Repository</label>
                    <select
                      value={repoId}
                      onChange={(e) => { setRepoId(e.target.value); setCommitId(""); }}
                      className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-[#1ef2c1]/50"
                    >
                      <option value="">Select a repository</option>
                      {repos.map((r) => (
                        <option key={r.RepoID} value={r.RepoID}>{r.GHOwner}/{r.GHName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Commit</label>
                    <select
                      value={commitId}
                      onChange={(e) => setCommitId(e.target.value)}
                      disabled={!repoId}
                      className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 disabled:opacity-40"
                    >
                      <option value="">Select a commit</option>
                      {commits.map((c) => (
                        <option key={c.CommitID} value={c.CommitID}>{c.SHA.slice(0, 7)} — {c.Message.slice(0, 50)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] text-zinc-500 block mb-2">Repository File Directory (Visual)</label>
                    <FileTreeVisualizer 
                      files={repos.find(r => r.RepoID === repoId)?.FileTree || []}
                      selectedFile={filePath}
                      onFileSelect={setFilePath}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">File Path</label>
                    <input
                      type="text"
                      value={filePath}
                      onChange={(e) => setFilePath(e.target.value)}
                      placeholder="src/auth/token.ts (Select from tree above)"
                      className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Line Range</label>
                    <input
                      type="text"
                      value={lineRange}
                      onChange={(e) => setLineRange(e.target.value)}
                      placeholder="42-58"
                      className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-xs rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Environment
                </label>
                <input
                  type="text"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  placeholder="Chrome 128 / macOS 15 / v2.1.0 / Build #491"
                  className="w-full bg-[#0d1117] border border-zinc-800 py-3 px-4 text-white placeholder-zinc-600 focus:outline-none focus:border-[#1ef2c1]/50 text-sm rounded-lg"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !title || !description}
                className="w-full py-3.5 font-bold tracking-widest uppercase transition-all duration-300
                  bg-transparent text-[#1ef2c1] border-2 border-[#1ef2c1] shadow-[0_0_12px_rgba(30,242,193,0.3)]
                  hover:bg-[#1ef2c1] hover:text-black hover:shadow-[0_0_25px_rgba(30,242,193,0.6)]
                  disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {loading ? "Creating..." : "File Issue"}
              </button>
            </form>
          )}
        </main>
      </Scrollable>
    </div>
  );
}
