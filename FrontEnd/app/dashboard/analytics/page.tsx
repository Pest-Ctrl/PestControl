"use client";

import { useEffect, useState } from "react";
import Gitline from "@/components/dashboard/Gitline";
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";

interface Issue {
  IssueID: string;
  Status: string;
  Severity: string;
  CreatedAt: string;
}

export default function AnalyticsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spaces")
      .then((r) => r.json())
      .then((data) => setSpaces(Array.isArray(data) ? data : []))
      .catch(() => {});
      
    fetch("/api/repos")
      .then((r) => r.json())
      .then((data) => setRepos(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/issues?";
    if (selectedRepoId) url += `repoId=${selectedRepoId}&`;
    if (selectedSpaceId) url += `spaceId=${selectedSpaceId}&`;
    
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setIssues(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedRepoId, selectedSpaceId]);

  // Compute metrics from real data
  const total = issues.length;
  const openCount = issues.filter((i) => i.Status === "Open").length;
  const inProgressCount = issues.filter((i) => i.Status === "InProgress").length;
  const resolvedCount = issues.filter((i) => i.Status === "Resolved").length;
  const closedCount = issues.filter((i) => i.Status === "Closed").length;
  const reopenedCount = issues.filter((i) => i.Status === "Reopened").length;
  const underReviewCount = issues.filter((i) => i.Status === "UnderReview").length;

  const closureRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  const statusBreakdown = [
    { label: "Open", count: openCount, color: "#eab308" },
    { label: "In Progress", count: inProgressCount, color: "#3b82f6" },
    { label: "Under Review", count: underReviewCount, color: "#a855f7" },
    { label: "Resolved", count: resolvedCount, color: "#1ef2c1" },
    { label: "Closed", count: closedCount, color: "#71717a" },
    { label: "Reopened", count: reopenedCount, color: "#ef4444" },
  ];

  const severityBreakdown = [
    { label: "Critical", count: issues.filter((i) => i.Severity === "Critical").length, color: "#ef4444" },
    { label: "High", count: issues.filter((i) => i.Severity === "High").length, color: "#f97316" },
    { label: "Medium", count: issues.filter((i) => i.Severity === "Medium").length, color: "#eab308" },
    { label: "Low", count: issues.filter((i) => i.Severity === "Low").length, color: "#71717a" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      <Scrollable className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Analytics</h1>
            <p className="text-xs text-zinc-400">Process improvement metrics & audit trail</p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedSpaceId}
              onChange={(e) => {
                setSelectedSpaceId(e.target.value);
                setSelectedRepoId(""); // Reset repo filter when space changes
              }}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-300 text-xs px-4 py-2 focus:outline-none focus:border-[#1ef2c1]/50 rounded-lg"
            >
              <option value="">All Workspaces</option>
              {spaces.map((s) => (
                <option key={s.SpaceID} value={s.SpaceID}>
                  {s.SpaceName}
                </option>
              ))}
            </select>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-300 text-xs px-4 py-2 focus:outline-none focus:border-[#1ef2c1]/50 rounded-lg"
            >
              <option value="">All Repositories</option>
              {repos
                .filter(r => !selectedSpaceId || r.SpaceID === selectedSpaceId)
                .map((r) => (
                <option key={r.RepoID} value={r.RepoID}>
                  {r.GHOwner}/{r.GHName}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex-1 flex">
          {/* Main metrics area */}
          <main className="flex-1 p-8 space-y-8 overflow-y-auto">
            {/* KPI Cards */}
            <section>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4 font-bold">Overview</p>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { title: "Total Issues", value: total, accent: true },
                  { title: "Open", value: openCount, accent: false },
                  { title: "Closure Rate", value: `${closureRate}%`, accent: closureRate >= 70 },
                  { title: "Reopened", value: reopenedCount, accent: reopenedCount === 0 },
                ].map((kpi) => (
                  <div
                    key={kpi.title}
                    className="bg-[#0d1117] border border-zinc-900 p-5"
                  >
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
                      {kpi.title}
                    </p>
                    <p className={`text-2xl font-bold ${kpi.accent ? "text-[#1ef2c1]" : "text-white"}`}>
                      {loading ? "—" : kpi.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Status Breakdown */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-[#0d1117] border border-zinc-900 p-6">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-6">Issues by Status</p>
                <div className="space-y-3">
                  {statusBreakdown.map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">{s.label}</span>
                          <span className="font-mono text-zinc-300">{s.count}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 w-full">
                          <div
                            className="h-1 transition-all"
                            style={{ width: total > 0 ? `${(s.count / total) * 100}%` : "0%", backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1117] border border-zinc-900 p-6">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-6">Issues by Severity</p>
                <div className="space-y-3">
                  {severityBreakdown.map((s) => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">{s.label}</span>
                          <span className="font-mono text-zinc-300">{s.count}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 w-full">
                          <div
                            className="h-1 transition-all"
                            style={{ width: total > 0 ? `${(s.count / total) * 100}%` : "0%", backgroundColor: s.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          {/* Gitline Side Panel */}
          <aside className="w-80 xl:w-96 border-l border-zinc-900 bg-[#0a0a0a] overflow-y-auto h-[calc(100vh-57px)]">
            <div className="p-4 border-b border-zinc-900">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Gitline · Audit Trail</p>
              <p className="text-[10px] text-zinc-600 mt-1">Commits with linked issues</p>
            </div>
            <div className="p-3">
              <Gitline spaceId={selectedSpaceId} repoId={selectedRepoId} />
            </div>
          </aside>
        </div>
      </Scrollable>
    </div>
  );
}
