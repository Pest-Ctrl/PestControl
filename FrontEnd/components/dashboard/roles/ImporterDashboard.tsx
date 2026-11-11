"use client";

import React, { useEffect, useState } from 'react';
import IssueTable from "@/components/dashboard/IssueTable";
import Link from 'next/link';

interface Repo {
  RepoID: string;
  GHOwner: string;
  GHName: string;
  ImportedAt: string;
  _count: { Issues: number; Commits: number };
}

interface Issue 
{
  IssueID: string;
  Title: string;
  Status: string;
  Severity: string;
  BugType: string;
  CreatedAt: string;
  Reporter: { Username: string };
  Assignee: { Username: string } | null;
}

export default function ImporterDashboard({ userName }: { userName: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [spaces, setSpaces] = useState<{SpaceID: string; SpaceName: string}[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [importModal, setImportModal] = useState(false);
  const [importOwner, setImportOwner] = useState("");
  const [importName, setImportName] = useState("");
  const [importSpaceId, setImportSpaceId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [pat, setPat] = useState("");
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [loadingGithubRepos, setLoadingGithubRepos] = useState(false);

  useEffect(() => {
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => { setRepos(Array.isArray(data) ? data : []); setLoadingRepos(false); })
      .catch(() => setLoadingRepos(false));

    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => { setIssues(Array.isArray(data) ? data : []); setLoadingIssues(false); })
      .catch(() => setLoadingIssues(false));

    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data) => setSpaces(Array.isArray(data) ? data : []))
      .catch(() => {});

    setLoadingGithubRepos(true);
    fetch(`/api/github/repos${pat ? `?pat=${pat}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setGithubRepos(data);
        setLoadingGithubRepos(false);
      })
      .catch((err) => {
        console.error("Failed to fetch repos", err);
        setLoadingGithubRepos(false);
      });
  }, [pat]);

  const handleImport = async () => {
    if (!importOwner || !importName) return;
    if (!importSpaceId) {
      setImportError("Please select a workspace first.");
      return;
    }
    setImporting(true);
    setImportError("");

    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: importOwner, name: importName, isPrivate, pat, spaceId: importSpaceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setRepos((prev) => [data, ...prev]);
      setImportModal(false);
      setImportOwner("");
      setImportName("");
      setImportSpaceId("");
    } catch (err: any) {
      setImportError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const issueTableData = issues.map((i) => ({
    id: i.IssueID.slice(0, 10),
    title: i.Title,
    status: i.Status as any,
    severity: i.Severity as any,
    type: i.BugType,
    assignee: i.Assignee?.Username || "Unassigned",
    reporter: i.Reporter?.Username || "—",
    createdAt: new Date(i.CreatedAt).toISOString().split("T")[0],
  }));

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 min-w-0">
      <section className="mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Bug Reporting Center</h2>
        <p className="text-zinc-400 text-sm">Welcome back. You have reported {issues.length} issues in total.</p>
      </section>

      {/* Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-5 sm:p-8 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(30,242,193,0.05)] min-w-0">
          <div className="w-16 h-16 bg-[#1ef2c1]/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-[#1ef2c1] text-2xl">🐞</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Report a New Defect</h3>
          <p className="text-sm text-zinc-400 mb-6">Found a bug? File a deterministic report linking directly to the repository and commit SHA.</p>
          <Link href="/space" className="w-full bg-[#1ef2c1] text-black font-bold tracking-widest uppercase py-3 rounded-md hover:bg-[#16b892] transition-colors shadow-[0_0_15px_rgba(30,242,193,0.3)] text-center block">
            + File Issue
          </Link>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-4 sm:p-6 min-w-0">
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Imported Repositories</h3>
          </div>
          <div className="space-y-3">
            {loadingRepos ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : repos.length === 0 ? (
              <p className="text-sm text-zinc-600 italic text-center py-4">No repos imported yet.</p>
            ) : (
              repos.map((repo) => (
                <div key={repo.RepoID} className="border border-zinc-800 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2.5">
                  <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 min-w-0">
                    <span className="text-zinc-500 text-xs sm:text-sm">github.com/</span>
                    <span className="text-white font-medium text-xs sm:text-sm break-all">{repo.GHOwner}/{repo.GHName}</span>
                    {(repo as any).IsPrivate && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-800 text-zinc-400 uppercase tracking-wider font-bold">Private</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-[10px] text-zinc-500">{repo._count?.Issues || 0} issues · {repo._count?.Commits || 0} commits</span>
                    <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-1 rounded">Synced</span>
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => setImportModal(true)}
              className="w-full mt-4 text-xs bg-zinc-800 text-zinc-300 py-3 hover:bg-zinc-700 transition-colors uppercase tracking-widest rounded-md"
            >
              Import Another Repo
            </button>
          </div>
        </div>
      </section>

      {/* Issues I've Reported */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-900">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Issues I've Reported</p>
        </div>
        {loadingIssues ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
          </div>
        ) : (
          <IssueTable issues={issueTableData} />
        )}
      </section>

      {/* Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-zinc-800 rounded-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <h3 className="text-lg font-bold text-white mb-4">Import GitHub Repository</h3>
            {importError && (
              <div className="bg-red-900/40 border border-red-500/60 text-red-300 px-3 py-2 text-sm rounded-lg mb-4">
                {importError}
              </div>
            )}
            <div className="space-y-3 mb-6">
              {/* Workspace Selector — required */}
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Select Workspace <span className="text-red-400">*</span></label>
                {spaces.length === 0 ? (
                  <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
                    No workspaces found. Please create a workspace first from the{" "}
                    <a href="/projects" className="underline">Projects page</a>.
                  </p>
                ) : (
                  <select
                    value={importSpaceId}
                    onChange={e => setImportSpaceId(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50"
                  >
                    <option value="">-- Select a Workspace --</option>
                    {spaces.map(s => (
                      <option key={s.SpaceID} value={s.SpaceID}>{s.SpaceName}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-2">Visibility</label>
                <div className="flex gap-2 bg-[#050505] p-1 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => { setIsPrivate(false); setPat(""); }}
                    className={`flex-1 py-1.5 text-xs rounded-md font-bold transition-colors ${!isPrivate ? 'bg-[#1ef2c1] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setIsPrivate(true)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-bold transition-colors ${isPrivate ? 'bg-[#1ef2c1] text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Private
                  </button>
                </div>
              </div>
              {isPrivate && (
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">GitHub Personal Access Token</label>
                  <input
                    type="password"
                    value={pat}
                    onChange={(e) => setPat(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1">Required to read the file tree of private repositories.</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 block mb-1">Select Repository</label>
                  {loadingGithubRepos ? (
                    <div className="text-xs text-zinc-500 p-2">Loading your repositories...</div>
                  ) : !githubRepos.length ? (
                    <div className="text-xs text-zinc-500 p-2">No repositories found.</div>
                  ) : (
                    <select
                      className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50"
                      onChange={(e) => {
                        const repo = githubRepos.find(r => r.full_name === e.target.value);
                        if (repo) {
                          setImportOwner(repo.owner.login);
                          setImportName(repo.name);
                        }
                      }}
                      value={importOwner && importName ? `${importOwner}/${importName}` : ""}
                    >
                      <option value="" disabled>-- Select a Repository --</option>
                      {githubRepos.map(repo => (
                        <option key={repo.id} value={repo.full_name}>
                          {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                        </option>
                      ))}
                    </select>
                  )}
                  {(!githubRepos.length && !loadingGithubRepos) && (
                    <p className="text-[9px] text-zinc-500 mt-1">
                      If the list is empty, ensure you logged in with GitHub or provide a PAT above. You can still type manually below if needed.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Repository Owner (Manual)</label>
                  <input
                    type="text"
                    value={importOwner}
                    onChange={(e) => setImportOwner(e.target.value)}
                    placeholder="facebook"
                    className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Repository Name (Manual)</label>
                  <input
                    type="text"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="react"
                    className="w-full bg-[#050505] border border-zinc-800 py-2.5 px-3 text-zinc-300 text-sm rounded-lg focus:outline-none focus:border-[#1ef2c1]/50 placeholder-zinc-700"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setImportModal(false); setImportError(""); }}
                className="flex-1 py-2.5 text-xs text-zinc-400 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importOwner || !importName}
                className="flex-1 py-2.5 text-xs bg-[#1ef2c1] text-black font-bold rounded-lg hover:bg-[#16b892] transition-colors disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
