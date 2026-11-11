"use client";

import { useEffect, useState } from "react";
import Gitline, { ProcessedCommit } from "@/components/dashboard/Gitline";
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";

interface Issue {
  IssueID: string;
  Status: string;
  Severity: string;
  CreatedAt: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function AnalyticsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"git-tree" | "metrics" | "split">("git-tree");
  const [inspectedCommit, setInspectedCommit] = useState<ProcessedCommit | null>(null);

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
    <div className="flex min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      <Sidebar />
      <Scrollable className="flex-1 flex flex-col h-screen overflow-x-hidden min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-20 bg-[#050505]/95 backdrop-blur border-b border-zinc-900 px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Git Tree & Analytics</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualize branch changes, merging operations, and software defect metrics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Switcher Tabs */}
            <div className="bg-[#0a0a0a] p-1 rounded-lg border border-zinc-800 flex items-center gap-1">
              {[
                {
                  id: "git-tree",
                  label: "Git Branch Tree",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                  ),
                },
                {
                  id: "metrics",
                  label: "Quality Metrics",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  ),
                },
                {
                  id: "split",
                  label: "Split View",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <line x1="12" y1="3" x2="12" y2="21" />
                    </svg>
                  ),
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeView === tab.id
                      ? "bg-[#1ef2c1] text-black font-semibold shadow-[0_0_12px_rgba(30,242,193,0.3)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Filter Selectors */}
            <select
              value={selectedSpaceId}
              onChange={(e) => {
                setSelectedSpaceId(e.target.value);
                setSelectedRepoId("");
              }}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-300 text-xs px-3 py-2 focus:outline-none focus:border-[#1ef2c1]/50 rounded-lg cursor-pointer"
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
              className="bg-[#0d1117] border border-zinc-800 text-zinc-300 text-xs px-3 py-2 focus:outline-none focus:border-[#1ef2c1]/50 rounded-lg cursor-pointer"
            >
              <option value="">All Repositories</option>
              {repos
                .filter((r) => !selectedSpaceId || r.SpaceID === selectedSpaceId)
                .map((r) => (
                  <option key={r.RepoID} value={r.RepoID}>
                    {r.GHOwner}/{r.GHName}
                  </option>
                ))}
            </select>
          </div>
        </header>

        {/* Top KPI Cards (Compact & Clean) */}
        <div className="px-8 pt-6 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Total Issues", value: total, accent: true, subtitle: "Tracked in workspace" },
              { title: "Open Issues", value: openCount, accent: false, subtitle: "Awaiting resolution" },
              { title: "Closure Rate", value: `${closureRate}%`, accent: closureRate >= 65, subtitle: `${closedCount} of ${total} resolved` },
              { title: "Active Regressions", value: reopenedCount, accent: reopenedCount === 0, subtitle: reopenedCount === 0 ? "Zero regressions" : "Requires attention" },
            ].map((kpi) => (
              <div
                key={kpi.title}
                className={`bg-[#0d1117] border p-4 rounded-xl flex flex-col justify-between transition-all ${
                  kpi.accent
                    ? "border-[#1ef2c1]/30 shadow-[0_0_15px_rgba(30,242,193,0.05)]"
                    : "border-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {kpi.title}
                  </span>
                  {kpi.accent && <span className="w-2 h-2 rounded-full bg-[#1ef2c1] shadow-[0_0_6px_#1ef2c1]" />}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl font-bold tracking-tight ${kpi.accent ? "text-[#1ef2c1]" : "text-white"}`}>
                    {loading ? "—" : kpi.value}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{kpi.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content Views */}
        <div className="flex-1 p-8 pt-4 min-w-0">
          {/* VIEW 1: DEDICATED GIT TREE & MERGE GRAPH */}
          {activeView === "git-tree" && (
            <div className="h-[calc(100vh-230px)] flex flex-col min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-zinc-200">Interactive Git Tree & Merge Graph</h2>
                  <p className="text-xs text-zinc-500">
                    Showing branch curves, forks from main, PR merges, and commit associations
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-0 min-w-0">
                <Gitline
                  spaceId={selectedSpaceId}
                  repoId={selectedRepoId}
                  onSelectCommit={(commit) => setInspectedCommit(commit)}
                />
              </div>
            </div>
          )}

          {/* VIEW 2: DEFECT METRICS & HEALTH */}
          {activeView === "metrics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Status Breakdown */}
                <div className="bg-[#0d1117] border border-zinc-900 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
                        Issues by Status
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">Workflow distribution of all logged issues</p>
                    </div>
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                      {total} Total
                    </span>
                  </div>

                  <div className="space-y-4">
                    {statusBreakdown.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1.5 font-medium">
                            <span className="text-zinc-300">{s.label}</span>
                            <span className="text-zinc-200 font-semibold">{s.count}</span>
                          </div>
                          <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: total > 0 ? `${(s.count / total) * 100}%` : "0%",
                                backgroundColor: s.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Breakdown with Uniform Badges */}
                <div className="bg-[#0d1117] border border-zinc-900 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">
                        Issues by Severity
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">Risk assessment and prioritization matrix</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {severityBreakdown.map((s) => (
                      <div key={s.label} className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-zinc-900">
                        <span
                          className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                            SEVERITY_STYLES[s.label] || SEVERITY_STYLES.Medium
                          }`}
                        >
                          {s.label}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 bg-zinc-900 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: total > 0 ? `${(s.count / total) * 100}%` : "0%",
                                backgroundColor: s.color,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold w-12 text-right" style={{ color: s.color }}>
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: UNIFIED SPLIT VIEW */}
          {activeView === "split" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-230px)] min-w-0">
              {/* Left Column: Realistic Git Tree */}
              <div className="xl:col-span-8 flex flex-col h-full min-h-0 min-w-0">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Git Branch & Merge Graph</span>
                  <span className="text-[11px] text-zinc-500">Synced repository commits</span>
                </div>
                <div className="flex-1 min-h-0 min-w-0">
                  <Gitline
                    spaceId={selectedSpaceId}
                    repoId={selectedRepoId}
                    onSelectCommit={(commit) => setInspectedCommit(commit)}
                  />
                </div>
              </div>

              {/* Right Column: Defect Distribution Metrics */}
              <div className="xl:col-span-4 flex flex-col gap-5 overflow-y-auto pr-1">
                {/* Status Card */}
                <div className="bg-[#0d1117] border border-zinc-900 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">
                    Status Distribution
                  </p>
                  <div className="space-y-3">
                    {statusBreakdown.map((s) => (
                      <div key={s.label} className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">{s.label}</span>
                            <span className="text-zinc-200 font-semibold">{s.count}</span>
                          </div>
                          <div className="h-1 bg-zinc-900 rounded-full overflow-hidden w-full">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: total > 0 ? `${(s.count / total) * 100}%` : "0%",
                                backgroundColor: s.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Severity Card with Equalized Badges */}
                <div className="bg-[#0d1117] border border-zinc-900 rounded-xl p-5 shadow-sm">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">
                    Severity Risk
                  </p>
                  <div className="space-y-2.5">
                    {severityBreakdown.map((s) => (
                      <div key={s.label} className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-zinc-900">
                        <span
                          className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                            SEVERITY_STYLES[s.label] || SEVERITY_STYLES.Medium
                          }`}
                        >
                          {s.label}
                        </span>
                        <span className="text-xs text-zinc-300 font-semibold">{s.count} issues</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Scrollable>
    </div>
  );
}
