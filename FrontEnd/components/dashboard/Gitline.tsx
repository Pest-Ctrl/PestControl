"use client";

import { useEffect, useState } from "react";

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
  Issues: CommitIssue[];
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#71717a",
};

export default function Gitline() {
  const [commits, setCommits] = useState<CommitNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commits")
      .then((r) => r.json())
      .then((data) => {
        setCommits(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  return (
    <div className="relative">
      {/* The vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-zinc-800" />

      <div className="space-y-0">
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
            : "#3f3f46";

          return (
            <div key={commit.CommitID} className="relative pl-10 py-3 group">
              {/* Node dot */}
              <div
                className={`absolute left-[9px] top-[18px] w-[14px] h-[14px] rounded-full border-2 z-10 transition-all
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
                className={`border rounded-lg p-3 transition-all cursor-default
                  ${
                    hasIssues
                      ? "border-zinc-700 bg-zinc-900/80 hover:border-zinc-600"
                      : "border-zinc-800/50 bg-transparent hover:bg-zinc-900/30"
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
                  <div className="mt-2 space-y-1">
                    {commit.Issues.map((issue) => (
                      <div
                        key={issue.IssueID}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-800/60 border border-zinc-700/50"
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
