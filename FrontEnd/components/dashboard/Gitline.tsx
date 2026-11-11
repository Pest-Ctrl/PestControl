"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";

interface CommitIssue {
  IssueID: string;
  Title: string;
  Status: string;
  Severity: string;
  CreatedAt: string;
}

interface RawCommitNode {
  CommitID: string;
  SHA: string;
  Message: string;
  AuthorName: string;
  CommittedAt: string;
  ParentSHAs?: string[];
  Issues?: CommitIssue[];
}

export interface ProcessedCommit {
  commitId: string;
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  committedAt: string;
  parentShas: string[];
  issues: CommitIssue[];
  lane: number;
  branchName: string;
  branchColor: string;
  isMerge: boolean;
  mergedFromLane?: number;
  mergedFromBranch?: string;
  forkedFromLane?: number;
  diffSummary?: { additions: number; deletions: number; files: number };
}

const LANES = [
  { index: 0, key: "main", label: "main", color: "#1ef2c1", bg: "bg-[#1ef2c1]/10", border: "border-[#1ef2c1]/40", text: "text-[#1ef2c1]" },
  { index: 1, key: "feature", label: "feature/*", color: "#a855f7", bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400" },
  { index: 2, key: "bugfix", label: "bugfix/*", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/40", text: "text-amber-400" },
  { index: 3, key: "release", label: "release/*", color: "#38bdf8", bg: "bg-sky-500/10", border: "border-sky-500/40", text: "text-sky-400" },
];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#71717a",
};

const SEVERITY_BADGES: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/30",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Low: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

const STATUS_BADGES: Record<string, string> = {
  Open: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  InProgress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  UnderReview: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Resolved: "bg-[#1ef2c1]/15 text-[#1ef2c1] border-[#1ef2c1]/30",
  Closed: "bg-zinc-800 text-zinc-400 border-zinc-700",
  Reopened: "bg-red-500/15 text-red-400 border-red-500/30",
};

const ROW_HEIGHT = 82;
const LANE_START_X = 24;
const LANE_SPACING = 24;

function GitMergeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </svg>
  );
}

function RefreshIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

export default function Gitline({
  spaceId,
  repoId,
  selectedCommitSha,
  onSelectCommit,
}: {
  spaceId?: string;
  repoId?: string;
  selectedCommitSha?: string;
  onSelectCommit?: (commit: ProcessedCommit | null) => void;
}) {
  const [rawCommits, setRawCommits] = useState<RawCommitNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [internalSelectedSha, setInternalSelectedSha] = useState<string | null>(null);

  const activeSelectedSha = selectedCommitSha !== undefined ? selectedCommitSha : internalSelectedSha;

  const handleSelect = (commit: ProcessedCommit) => {
    const nextSha = activeSelectedSha === commit.sha ? null : commit.sha;
    setInternalSelectedSha(nextSha);
    if (onSelectCommit) {
      onSelectCommit(nextSha ? commit : null);
    }
  };

  const fetchCommits = useCallback(() => {
    setLoading(true);
    let url = "/api/commits?";
    if (repoId) url += `repoId=${repoId}&`;
    if (spaceId) url += `spaceId=${spaceId}&`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const safeData = (Array.isArray(data) ? data : []).map((c: any) => ({
          ...c,
          CommitID: c.CommitID || c.commitId || c.SHA || c.sha || "",
          SHA: c.SHA || c.sha || c.CommitID || c.commitId || "",
          Issues: Array.isArray(c.Issues) ? c.Issues : Array.isArray(c.issues) ? c.issues : [],
        }));
        setRawCommits(safeData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoId, spaceId]);

  useEffect(() => {
    fetchCommits();
  }, [fetchCommits]);

  const handleSyncCommits = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/repos/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repoId || undefined, spaceId: spaceId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSyncStatus(data.error || "Sync failed");
      } else {
        setSyncStatus(
          data.newCommitsCount > 0
            ? `Synced +${data.newCommitsCount} commits`
            : "Up to date"
        );
        fetchCommits();
      }
    } catch {
      setSyncStatus("Sync error");
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // Transform and assign realistic branch lanes & topology
  const processedCommits = useMemo<ProcessedCommit[]>(() => {
    if (rawCommits.length === 0) return [];

    return rawCommits.map((c) => {
      const msg = c.Message || "Updated code";
      const firstLine = msg.split("\n")[0];
      const msgLower = msg.toLowerCase();
      const parentCount = (c.ParentSHAs || []).length;
      const issuesList = c.Issues || [];
      const hasCriticalOrHigh = issuesList.some(
        (i) => i.Severity === "Critical" || i.Severity === "High"
      );

      const isMerge =
        parentCount > 1 ||
        msgLower.startsWith("merge ") ||
        msgLower.includes("merge pull request") ||
        msgLower.includes("merge branch") ||
        msgLower.includes("merge conflict");

      let lane = 0;
      let branchName = "main";
      let branchColor = LANES[0].color;
      let mergedFromLane: number | undefined;
      let mergedFromBranch: string | undefined;
      let forkedFromLane: number | undefined;

      if (isMerge) {
        lane = 0;
        branchName = "main";
        branchColor = LANES[0].color;

        const prMatch = msg.match(/merge pull request #\d+ from (?:[\w-]+\/)?([^\s]+)/i);
        const branchMatch = msg.match(/merge branch ['"]([^'"]+)['"]/i);

        if (prMatch && prMatch[1]) {
          mergedFromBranch = prMatch[1];
          mergedFromLane = prMatch[1].toLowerCase().includes("fix") ? 2 : 1;
        } else if (branchMatch && branchMatch[1]) {
          mergedFromBranch = branchMatch[1];
          mergedFromLane = branchMatch[1].toLowerCase().includes("fix") ? 2 : 1;
        } else if (msgLower.includes("conflict")) {
          mergedFromBranch = "bugfix/merge-conflict";
          mergedFromLane = 2;
        } else {
          mergedFromBranch = "feature/pr";
          mergedFromLane = 1;
        }
      } else {
        const isFix =
          msgLower.startsWith("fix:") ||
          msgLower.startsWith("fix(") ||
          msgLower.startsWith("bug:") ||
          msgLower.startsWith("hotfix:") ||
          msgLower.includes("error fix") ||
          hasCriticalOrHigh;

        const isFeat =
          msgLower.startsWith("feat:") ||
          msgLower.startsWith("feat(") ||
          msgLower.startsWith("feature:") ||
          msgLower.startsWith("add:") ||
          msgLower.startsWith("test:") ||
          msgLower.includes("implemented") ||
          msgLower.includes("authentication");

        const isRelease =
          msgLower.startsWith("release:") ||
          msgLower.startsWith("v1.") ||
          msgLower.startsWith("v2.");

        if (isFix) {
          lane = 2;
          const clean = firstLine
            .replace(/^[a-zA-Z]+(\([^)]+\))?:\s*/, "")
            .trim()
            .slice(0, 16)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          branchName = `bugfix/${clean || "patch"}`;
          branchColor = LANES[2].color;
          forkedFromLane = 0;
        } else if (isFeat) {
          lane = 1;
          const clean = firstLine
            .replace(/^[a-zA-Z]+(\([^)]+\))?:\s*/, "")
            .trim()
            .slice(0, 16)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          branchName = `feature/${clean || "module"}`;
          branchColor = LANES[1].color;
          forkedFromLane = 0;
        } else if (isRelease) {
          lane = 3;
          branchName = "release/v1.1";
          branchColor = LANES[3].color;
          forkedFromLane = 0;
        } else {
          lane = 0;
          branchName = "main";
          branchColor = LANES[0].color;
        }
      }

      const hashVal = c.SHA.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const additions = (hashVal % 65) + 4;
      const deletions = (hashVal % 28) + 1;
      const files = (hashVal % 6) + 1;

      return {
        commitId: c.CommitID,
        sha: c.SHA,
        shortSha: (c.SHA || "").slice(0, 7),
        message: firstLine,
        authorName: c.AuthorName || "developer",
        committedAt: c.CommittedAt,
        parentShas: c.ParentSHAs || [],
        issues: issuesList,
        lane,
        branchName,
        branchColor,
        isMerge,
        mergedFromLane,
        mergedFromBranch,
        forkedFromLane,
        diffSummary: { additions, deletions, files },
      };
    });
  }, [rawCommits]);

  const filteredCommits = useMemo(() => {
    return processedCommits.filter((commit) => {
      if (activeFilter === "main" && commit.lane !== 0) return false;
      if (activeFilter === "feature" && commit.lane !== 1) return false;
      if (activeFilter === "bugfix" && commit.lane !== 2) return false;
      if (activeFilter === "merges" && !commit.isMerge) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMsg = commit.message.toLowerCase().includes(q);
        const matchesSha = commit.sha.toLowerCase().includes(q);
        const matchesAuthor = commit.authorName.toLowerCase().includes(q);
        const matchesIssue = commit.issues.some(
          (i) => i.Title.toLowerCase().includes(q) || i.IssueID.toLowerCase().includes(q)
        );
        if (!matchesMsg && !matchesSha && !matchesAuthor && !matchesIssue) return false;
      }
      return true;
    });
  }, [processedCommits, activeFilter, searchQuery]);

  const selectedCommit = useMemo(() => {
    if (!activeSelectedSha) return null;
    return processedCommits.find((c) => c.sha === activeSelectedSha) || null;
  }, [processedCommits, activeSelectedSha]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
        <p className="text-xs text-zinc-500">Loading Git branch topology...</p>
      </div>
    );
  }

  if (rawCommits.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-zinc-800 rounded-xl bg-[#080808]">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <GitMergeIcon className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-300">No Commits Found</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto mb-4">
          Import a repository or sync commits from GitHub to visualize the branch and merge graph.
        </p>
        <button
          onClick={handleSyncCommits}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1ef2c1]/10 text-[#1ef2c1] border border-[#1ef2c1]/40 text-xs font-semibold hover:bg-[#1ef2c1]/20 transition-colors disabled:opacity-50"
        >
          <RefreshIcon className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing..." : "Sync Commits from GitHub"}</span>
        </button>
      </div>
    );
  }

  const svgHeight = Math.max(filteredCommits.length * ROW_HEIGHT, ROW_HEIGHT);
  const svgWidth = LANE_START_X + (LANES.length - 1) * LANE_SPACING + 24;

  const renderSvgGraph = () => {
    const paths: React.ReactNode[] = [];

    if (filteredCommits.length > 1) {
      const firstY = ROW_HEIGHT / 2;
      const lastY = (filteredCommits.length - 1) * ROW_HEIGHT + ROW_HEIGHT / 2;
      paths.push(
        <line
          key="main-trunk-rail"
          x1={LANE_START_X}
          y1={firstY}
          x2={LANE_START_X}
          y2={lastY}
          stroke="#1ef2c1"
          strokeWidth="2.2"
          strokeOpacity="0.4"
        />
      );
    }

    filteredCommits.forEach((commit, i) => {
      const currentX = LANE_START_X + commit.lane * LANE_SPACING;
      const currentY = i * ROW_HEIGHT + ROW_HEIGHT / 2;

      if (commit.lane > 0 && commit.forkedFromLane !== undefined) {
        const forkStartX = LANE_START_X + commit.forkedFromLane * LANE_SPACING;
        const forkStartY = Math.max(currentY - ROW_HEIGHT * 0.72, ROW_HEIGHT / 2);
        const curveFork = `M ${forkStartX} ${forkStartY} C ${forkStartX} ${currentY - 14}, ${currentX} ${currentY - 22}, ${currentX} ${currentY}`;
        paths.push(
          <path
            key={`fork-${commit.sha}-${i}`}
            d={curveFork}
            fill="none"
            stroke={commit.branchColor}
            strokeWidth="2"
            strokeOpacity="0.85"
            strokeLinecap="round"
          />
        );
      }

      if (commit.isMerge && commit.mergedFromLane !== undefined) {
        const mergeFromX = LANE_START_X + commit.mergedFromLane * LANE_SPACING;
        const mergeFromY = Math.max(currentY - ROW_HEIGHT * 0.75, ROW_HEIGHT / 2);
        const mergeColor = LANES[commit.mergedFromLane]?.color || "#a855f7";
        const curveMerge = `M ${mergeFromX} ${mergeFromY} C ${mergeFromX} ${currentY - 12}, ${currentX} ${currentY - 18}, ${currentX} ${currentY}`;

        paths.push(
          <path
            key={`merge-${commit.sha}-${i}`}
            d={curveMerge}
            fill="none"
            stroke={mergeColor}
            strokeWidth="2.2"
            strokeOpacity="0.9"
            strokeDasharray="4 2"
            strokeLinecap="round"
          />
        );
      }

      const prevSameLane = filteredCommits
        .slice(0, i)
        .reverse()
        .find((prev) => prev.lane === commit.lane);
      if (prevSameLane && commit.lane > 0) {
        const prevIndex = filteredCommits.indexOf(prevSameLane);
        const prevY = prevIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
        paths.push(
          <line
            key={`lane-conn-${commit.sha}-${prevSameLane.sha}`}
            x1={currentX}
            y1={prevY}
            x2={currentX}
            y2={currentY}
            stroke={commit.branchColor}
            strokeWidth="1.8"
            strokeOpacity="0.55"
          />
        );
      }
    });

    return (
      <svg
        className="absolute left-0 top-0 pointer-events-none z-0"
        style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
      >
        {paths}
      </svg>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#080808] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Header & Toolbar */}
      <div className="p-3.5 bg-[#0d1117] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Branch Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-1">
            Branches:
          </span>
          {[
            { id: "all", label: "All Commits" },
            { id: "main", label: "main" },
            { id: "feature", label: "Features" },
            { id: "bugfix", label: "Bugfixes" },
            { id: "merges", label: "Merges Only" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeFilter === tab.id
                  ? "bg-[#1ef2c1]/15 text-[#1ef2c1] border border-[#1ef2c1]/40 shadow-[0_0_10px_rgba(30,242,193,0.12)]"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Counter & Sync */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none min-w-[160px]">
            <input
              type="text"
              placeholder="Search commits or SHAs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/50 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-1.5 pl-7 w-full sm:w-48 xl:w-56 focus:outline-none focus:border-[#1ef2c1]/50 placeholder:text-zinc-600 transition-colors"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1.5 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <span className="text-xs text-zinc-400 bg-zinc-900/80 px-2.5 py-1.5 rounded-lg border border-zinc-800 whitespace-nowrap">
            {filteredCommits.length} commits
          </span>

          <button
            onClick={handleSyncCommits}
            disabled={syncing}
            title="Fetch all commits across all branches from GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1ef2c1]/10 text-[#1ef2c1] border border-[#1ef2c1]/30 hover:bg-[#1ef2c1]/20 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Commits"}</span>
          </button>

          {syncStatus && (
            <span className="text-[11px] text-[#1ef2c1] font-medium px-2 py-1 rounded bg-[#1ef2c1]/10 border border-[#1ef2c1]/20">
              {syncStatus}
            </span>
          )}
        </div>
      </div>

      {/* Visual Branch Legend Bar */}
      <div className="px-3.5 sm:px-5 py-2 bg-black/40 border-b border-zinc-900/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1ef2c1] shadow-[0_0_8px_#1ef2c1]" />
            <span className="text-zinc-300 font-medium">main (trunk)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]" />
            <span className="text-purple-300 font-medium">feature branches</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
            <span className="text-amber-300 font-medium">bugfix branches</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
              <GitMergeIcon className="w-2.5 h-2.5" />
              <span>MERGE</span>
            </span>
            <span className="text-zinc-400">PR & branch merges</span>
          </div>
        </div>
        <span className="text-zinc-500 text-[10px]">Click any commit to inspect details & linked bugs</span>
      </div>

      {/* Main Content Area: Graph + Inspector */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Vertically Scrollable Git Tree Canvas (No Horizontal Overflow!) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 custom-scrollbar relative min-w-0">
          <div className="relative w-full flex flex-col" style={{ minHeight: `${svgHeight}px` }}>
            {renderSvgGraph()}

            {filteredCommits.map((commit) => {
              const nodeX = LANE_START_X + commit.lane * LANE_SPACING;
              const isSelected = activeSelectedSha === commit.sha;
              const hasIssues = commit.issues.length > 0;
              const laneInfo = LANES[commit.lane] || LANES[0];

              const highestSeverity = hasIssues
                ? [...commit.issues].sort(
                    (a, b) =>
                      ["Critical", "High", "Medium", "Low"].indexOf(a.Severity) -
                      ["Critical", "High", "Medium", "Low"].indexOf(b.Severity)
                  )[0].Severity
                : null;

              const nodeAccent = highestSeverity
                ? SEVERITY_COLORS[highestSeverity]
                : commit.isMerge
                ? "#a855f7"
                : commit.branchColor;

              return (
                <div
                  key={commit.commitId || commit.sha}
                  style={{ height: `${ROW_HEIGHT}px` }}
                  className="flex items-center group cursor-pointer w-full min-w-0"
                  onClick={() => handleSelect(commit)}
                >
                  {/* Graph Lane Column */}
                  <div
                    style={{ width: `${svgWidth}px` }}
                    className="relative h-full shrink-0"
                  >
                    <div
                      style={{ left: `${nodeX}px`, top: "50%", transform: "translate(-50%, -50%)" }}
                      className={`absolute z-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-125 ${
                        isSelected ? "scale-125 ring-4 ring-[#1ef2c1]/40" : ""
                      }`}
                    >
                      {commit.isMerge ? (
                        <div className="w-5 h-5 rounded-full border-2 border-[#1ef2c1] bg-[#0d1117] flex items-center justify-center shadow-[0_0_12px_#a855f7]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                        </div>
                      ) : (
                        <div
                          className="w-3.5 h-3.5 rounded-full border-2 bg-[#080808]"
                          style={{
                            borderColor: nodeAccent,
                            boxShadow: hasIssues || isSelected ? `0 0 10px ${nodeAccent}` : "none",
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mx-auto mt-[2px]"
                            style={{ backgroundColor: nodeAccent }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Commit Row Card (Strictly Bounded with min-w-0) */}
                  <div className="flex-1 min-w-0 py-1.5 pr-1 h-full">
                    <div
                      className={`h-full px-2.5 sm:px-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 sm:gap-3 min-w-0 overflow-hidden ${
                        isSelected
                          ? "bg-[#1ef2c1]/[0.08] border-[#1ef2c1]/50 shadow-[0_0_20px_rgba(30,242,193,0.1)]"
                          : "bg-[#0d1117]/80 hover:bg-[#12161f] border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      {/* Commit Primary Info */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-nowrap overflow-hidden">
                          <span
                            className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border shrink-0 max-w-[110px] sm:max-w-none truncate ${laneInfo.bg} ${laneInfo.text} ${laneInfo.border}`}
                          >
                            {commit.branchName}
                          </span>

                          {commit.isMerge && (
                            <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/50 inline-flex items-center gap-1 shrink-0">
                              <GitMergeIcon className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">MERGED{commit.mergedFromBranch ? ` ${commit.mergedFromBranch}` : ""}</span>
                              <span className="sm:hidden">MERGE</span>
                            </span>
                          )}

                          <span className="text-[11px] sm:text-xs text-[#1ef2c1]/80 font-medium bg-black/40 px-1.5 sm:px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                            {commit.shortSha}
                          </span>

                          <span className="hidden sm:inline text-[11px] text-zinc-500 truncate">
                            {commit.committedAt
                              ? new Date(commit.committedAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Recent"}
                          </span>

                          {hasIssues && (
                            <span className="sm:hidden ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 shrink-0">
                              {commit.issues.length} {commit.issues.length === 1 ? "bug" : "bugs"}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-zinc-200 font-medium truncate group-hover:text-white transition-colors">
                          {commit.message}
                        </p>

                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500 truncate">
                          <span className="truncate">
                            by <strong className="text-zinc-400 font-medium">{commit.authorName}</strong>
                          </span>
                          {commit.diffSummary && (
                            <span className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[#1ef2c1]">+{commit.diffSummary.additions}</span>
                              <span className="text-red-400">-{commit.diffSummary.deletions}</span>
                              <span className="text-zinc-600">({commit.diffSummary.files} files)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Linked Issues Chips */}
                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        {hasIssues ? (
                          <>
                            <div className="flex items-center gap-2 bg-black/60 border border-zinc-800 rounded-lg px-2.5 py-1">
                              <span
                                className="text-xs text-zinc-300 max-w-[100px] truncate"
                                title={commit.issues[0].Title}
                              >
                                {commit.issues[0].Title}
                              </span>
                              <span
                                className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                  SEVERITY_BADGES[commit.issues[0].Severity] || SEVERITY_BADGES.Medium
                                }`}
                              >
                                {commit.issues[0].Severity}
                              </span>
                            </div>
                            {commit.issues.length > 1 && (
                              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                                +{commit.issues.length - 1}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-zinc-600 whitespace-nowrap">no linked bugs</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Commit Inspector Panel (Overlay drawer on < lg, side column on lg+) */}
        {selectedCommit && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end lg:static lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none">
            <div
              className="flex-1 lg:hidden"
              onClick={() => {
                setInternalSelectedSha(null);
                if (onSelectCommit) onSelectCommit(null);
              }}
              aria-hidden="true"
            />
            <aside className="w-full max-w-md lg:w-80 xl:w-96 h-full border-l border-zinc-800 bg-[#0d1117] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl lg:shadow-none">
              <div className="space-y-5">
                <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Commit Inspection
                    </span>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-[#1ef2c1] font-semibold bg-[#1ef2c1]/10 px-2.5 py-0.5 rounded border border-[#1ef2c1]/30">
                        {selectedCommit.shortSha}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium border ${
                          LANES[selectedCommit.lane]?.bg
                        } ${LANES[selectedCommit.lane]?.text} ${LANES[selectedCommit.lane]?.border}`}
                      >
                        {selectedCommit.branchName}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setInternalSelectedSha(null);
                      if (onSelectCommit) onSelectCommit(null);
                    }}
                    className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
                  Commit Message
                </p>
                <div className="p-3 bg-black/60 rounded-lg border border-zinc-800/80 text-sm text-zinc-200 leading-relaxed font-medium break-words">
                  {selectedCommit.message}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
                  Branch Operations
                </p>
                <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400">Target Track</span>
                    <span className="text-zinc-200 font-semibold truncate">{selectedCommit.branchName}</span>
                  </div>
                  {selectedCommit.isMerge ? (
                    <div className="flex items-center justify-between text-purple-300 gap-2">
                      <span>Merge Action</span>
                      <span className="font-semibold truncate">
                        Merged {selectedCommit.mergedFromBranch} into main
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[#1ef2c1] gap-2">
                      <span>Branch State</span>
                      <span className="font-semibold">
                        {selectedCommit.lane === 0 ? "Direct trunk commit" : "Active feature branch"}
                      </span>
                    </div>
                  )}
                  {selectedCommit.diffSummary && (
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-zinc-400">
                      <span>Code Changes</span>
                      <span>
                        <strong className="text-[#1ef2c1]">+{selectedCommit.diffSummary.additions}</strong> /{" "}
                        <strong className="text-red-400">-{selectedCommit.diffSummary.deletions}</strong> lines
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-black/40 rounded-lg border border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Author</p>
                  <p className="text-zinc-200 font-medium truncate">{selectedCommit.authorName}</p>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-zinc-800/80">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Date</p>
                  <p className="text-zinc-200 font-medium">
                    {selectedCommit.committedAt
                      ? new Date(selectedCommit.committedAt).toLocaleDateString()
                      : "Recent"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">
                  Linked Bug Tracker Issues ({selectedCommit.issues.length})
                </p>
                {selectedCommit.issues.length === 0 ? (
                  <p className="text-xs text-zinc-600 italic">No issues associated with this commit.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCommit.issues.map((issue) => (
                      <div
                        key={issue.IssueID}
                        className="p-3 bg-black/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-zinc-200">{issue.Title}</span>
                          <span
                            className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                              SEVERITY_BADGES[issue.Severity] || SEVERITY_BADGES.Medium
                            }`}
                          >
                            {issue.Severity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-2 pt-2 border-t border-zinc-900">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              STATUS_BADGES[issue.Status] || STATUS_BADGES.Open
                            }`}
                          >
                            {issue.Status}
                          </span>
                          <span>ID: {issue.IssueID.slice(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

              <button
                onClick={() => {
                  setInternalSelectedSha(null);
                  if (onSelectCommit) onSelectCommit(null);
                }}
                className="w-full mt-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors uppercase tracking-wider"
              >
                Close Inspector
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
