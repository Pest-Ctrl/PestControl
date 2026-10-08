"use client";

import React, { useEffect, useState, useRef } from "react";

interface CommitIssue {
  IssueID: string;
  Title: string;
  Status: string;
  Severity: string;
  CreatedAt: string;
}

interface CommitNode {
  CommitID: string;
  SHA: string;
  Message: string;
  AuthorName: string;
  CommittedAt: string;
  ParentSHAs: string[];
  Issues: CommitIssue[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#71717a",
};

export default function Gitline({ spaceId, repoId }: { spaceId?: string; repoId?: string }) {
  const [commits, setCommits] = useState<CommitNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dotPositions, setDotPositions] = useState<Record<string, { x: number; y: number }>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    let url = "/api/commits?";
    if (repoId) url += `repoId=${repoId}&`;
    if (spaceId) url += `spaceId=${spaceId}&`;
    
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setCommits(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (commits.length === 0 || !containerRef.current) return;

    const calculatePositions = () => {
      const container = containerRef.current;
      if (!container) return;
      const positions: Record<string, { x: number; y: number }> = {};
      
      commits.forEach((commit) => {
        const el = document.getElementById(`dot-${commit.SHA}`);
        if (el) {
          positions[commit.SHA] = {
            x: el.offsetLeft + el.offsetWidth / 2,
            y: el.offsetTop + el.offsetHeight / 2,
          };
        }
      });
      setDotPositions(positions);
    };

    // Calculate after rendering
    const timer = setTimeout(calculatePositions, 100);
    window.addEventListener("resize", calculatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculatePositions);
    };
  }, [commits]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-600 text-sm">
        No commits found. Import a repository to see the Gitline.
      </div>
    );
  }

  // Draw SVG lines for branches/merges
  const renderSVGPaths = () => {
    if (Object.keys(dotPositions).length === 0) return null;

    const paths: React.ReactNode[] = [];
    
    commits.forEach((commit) => {
      const start = dotPositions[commit.SHA];
      if (!start || !commit.ParentSHAs) return;

      commit.ParentSHAs.forEach((parentSha, index) => {
        const end = dotPositions[parentSha];
        if (end) {
          const isMerge = commit.ParentSHAs.length > 1;
          const strokeColor = isMerge && index > 0 ? "#a855f7" : "#3f3f46"; // Merge lines are purple, direct are gray
          
          // Draw curved path
          const pathD = `M ${start.x} ${start.y} 
                         C ${start.x} ${start.y + 20}, 
                           ${end.x} ${end.y - 20}, 
                           ${end.x} ${end.y}`;
                           
          paths.push(
            <path
              key={`${commit.SHA}-${parentSha}`}
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              className={isMerge && index > 0 ? "opacity-70" : "opacity-100"}
            />
          );
        }
      });
    });

    return (
      <svg className="absolute inset-0 z-0 pointer-events-none w-full h-full" style={{ minHeight: '100%' }}>
        {paths}
      </svg>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Background SVG for branch connections */}
      {renderSVGPaths()}

      <div className="space-y-6">
        {commits.map((commit, index) => {
          const hasIssues = commit.Issues.length > 0;
          const isNew = index === 0 && hasIssues;
          const highestSeverity = hasIssues
            ? commit.Issues.sort(
                (a, b) =>
                  ["Critical", "High", "Medium", "Low"].indexOf(a.Severity) -
                  ["Critical", "High", "Medium", "Low"].indexOf(b.Severity)
              )[0].Severity
            : null;
          const nodeColor = hasIssues
            ? SEVERITY_COLORS[highestSeverity || "Medium"]
            : "#1ef2c1";

          // Calculate offset track if we want to visually indent branches (simple logic)
          // For now, keep them aligned, the curves handle the branching visually
          const marginLeft = "ml-0"; 

          return (
            <div key={commit.CommitID} className={`relative pl-12 py-1 group ${marginLeft}`}>
              {/* Node dot */}
              <div
                id={`dot-${commit.SHA}`}
                className={`absolute left-[16px] top-[14px] w-[12px] h-[12px] rounded-full border-2 z-10 transition-all
                  ${hasIssues ? "border-transparent" : "border-zinc-700 bg-zinc-900"}
                  ${isNew ? "gitline-glow-pulse" : ""}`}
                style={
                  hasIssues
                    ? {
                        backgroundColor: nodeColor,
                        boxShadow: `0 0 8px ${nodeColor}80, 0 0 16px ${nodeColor}40`,
                      }
                    : {}
                }
              />

              {/* Commit info */}
              <div
                className={`border rounded-lg p-3 transition-all cursor-default relative z-10
                  ${
                    hasIssues
                      ? "border-zinc-700 bg-[#0d1117] hover:border-zinc-500"
                      : "border-zinc-800/50 bg-[#050505] hover:bg-zinc-900/50"
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs text-[#1ef2c1]/70 font-mono">
                    {commit.SHA.slice(0, 7)}
                  </code>
                  <span className="text-[10px] text-zinc-600">
                    {new Date(commit.CommittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {commit.Message}
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">
                  {commit.AuthorName}
                </p>

                {/* Linked issues */}
                {hasIssues && (
                  <div className="mt-3 space-y-1">
                    {commit.Issues.map((issue) => (
                      <div
                        key={issue.IssueID}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-zinc-900 border border-zinc-800"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              SEVERITY_COLORS[issue.Severity] || "#71717a",
                          }}
                        />
                        <span className="text-[10px] text-zinc-400 truncate flex-1">
                          {issue.Title}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {issue.Status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Glow animation CSS */}
      <style jsx>{`
        @keyframes gitlineGlow {
          0%,
          100% {
            box-shadow: 0 0 8px #1ef2c180, 0 0 20px #1ef2c140;
          }
          50% {
            box-shadow: 0 0 16px #1ef2c1cc, 0 0 40px #1ef2c180,
              0 0 60px #1ef2c140;
          }
        }
        .gitline-glow-pulse {
          animation: gitlineGlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
