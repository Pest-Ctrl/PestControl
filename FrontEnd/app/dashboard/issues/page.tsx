"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Scrollable from "@/components/Scrollable";

interface Issue {
  IssueID: string;
  Title: string;
  Description: string;
  Status: string;
  Severity: string;
  BugType: string;
  CreatedAt: string;
  UpdatedAt: string;
  Reporter: { UserID: string; Username: string; Email: string };
  Assignee: { UserID: string; Username: string; Email: string } | null;
  Repo: { RepoID: string; GHOwner: string; GHName: string } | null;
  Commit: { CommitID: string; SHA: string; Message: string } | null;
  _count: { Comments: number };
}

const STATUS_ORDER = ["Open", "InProgress", "UnderReview", "Resolved", "Reopened", "Closed"];
const STATUS_LABELS: Record<string, string> = {
  Open: "Open", InProgress: "In Progress", UnderReview: "Under Review",
  Resolved: "Resolved", Closed: "Closed", Reopened: "Reopened",
};
const STATUS_COLORS: Record<string, string> = {
  Open: "#eab308", InProgress: "#3b82f6", UnderReview: "#a855f7",
  Resolved: "#1ef2c1", Closed: "#71717a", Reopened: "#ef4444",
};
const SEVERITY_COLORS: Record<string, string> = {
  Critical: "bg-red-900/40 text-red-300 border-red-700/50",
  High: "bg-orange-900/40 text-orange-300 border-orange-700/50",
  Medium: "bg-yellow-900/30 text-yellow-400 border-yellow-800/40",
  Low: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<{ UserID: string; Username: string; Email: string }[]>([]);

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const fetchIssues = () => {
    setLoading(true);
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => { setIssues(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleAssigneeChange = async (issueId: string, assigneeId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: assigneeId || null }),
      });
      if (res.ok) {
        // Update local state instantly
        setIssues(prev => prev.map(issue => {
          if (issue.IssueID === issueId) {
            const newAssignee = users.find(u => u.UserID === assigneeId) || null;
            return { ...issue, Assignee: newAssignee };
          }
          return issue;
        }));
      }
    } catch (err) {
      console.error("Failed to update assignee", err);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Update local state instantly
        setIssues(prev => prev.map(issue => {
          if (issue.IssueID === issueId) {
            return { ...issue, Status: newStatus };
          }
          return issue;
        }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filterStatus && issue.Status !== filterStatus) return false;
    if (filterSeverity && issue.Severity !== filterSeverity) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return issue.Title.toLowerCase().includes(term) || issue.Description.toLowerCase().includes(term);
    }
    return true;
  });

  const grouped = STATUS_ORDER.reduce((acc, status) => {
    const items = filteredIssues.filter((i) => i.Status === status);
    if (items.length > 0) acc[status] = items;
    return acc;
  }, {} as Record<string, Issue[]>);

  const toggleGroup = (status: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />
      <Scrollable className="flex-1 flex flex-col h-screen">
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Issues</h1>
            <p className="text-xs text-zinc-400">{issues.length} total issues tracked</p>
          </div>
          <a
            href="/space"
            className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase"
          >
            + New Issue
          </a>
        </header>

        <main className="flex-1 p-8 space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-300 text-xs px-4 py-2.5 focus:outline-none focus:border-[#1ef2c1]/50 w-64 rounded-lg"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-400 text-xs px-3 py-2.5 focus:outline-none focus:border-zinc-600 rounded-lg"
            >
              <option value="">All Statuses</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#0d1117] border border-zinc-800 text-zinc-400 text-xs px-3 py-2.5 focus:outline-none focus:border-zinc-600 rounded-lg"
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <span className="text-xs text-zinc-600 ml-auto">
              Showing {filteredIssues.length} of {issues.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-6 h-6 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([status, items]) => (
                <div key={status} className="bg-[#0d1117] border border-zinc-900 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(status)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[status] }}
                      />
                      <span className="text-sm font-medium text-zinc-200">{STATUS_LABELS[status]}</span>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    </div>
                    <span className="text-zinc-600 text-xs">
                      {collapsedGroups.has(status) ? "▸" : "▾"}
                    </span>
                  </button>

                  {/* Issue rows */}
                  {!collapsedGroups.has(status) && (
                    <div className="border-t border-zinc-900">
                      {items.map((issue) => (
                        <div key={issue.IssueID}>
                          {/* Compact row */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setExpandedId(expandedId === issue.IssueID ? null : issue.IssueID)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedId(expandedId === issue.IssueID ? null : issue.IssueID); }}
                            className="w-full text-left px-5 py-3 hover:bg-[#1ef2c1]/[0.03] transition-colors border-b border-zinc-900/50 last:border-0 flex items-center gap-4 cursor-pointer select-none"
                          >
                            <span className="text-[#1ef2c1]/70 text-xs w-20 shrink-0 font-medium">
                              {issue.IssueID.slice(0, 10)}
                            </span>
                            <span className="text-sm text-zinc-200 flex-1 truncate">{issue.Title}</span>

                            {/* Status change dropdown on the row */}
                            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                              <select
                                value={issue.Status}
                                onChange={(e) => handleStatusChange(issue.IssueID, e.target.value)}
                                className="bg-[#050505] border border-zinc-800 text-[11px] font-semibold tracking-wider py-1 px-2.5 rounded focus:outline-none focus:border-[#1ef2c1]/60 transition-colors cursor-pointer"
                                style={{ color: STATUS_COLORS[issue.Status] || "#1ef2c1" }}
                                title="Change bug status"
                              >
                                {STATUS_ORDER.map((st) => (
                                  <option key={st} value={st} className="bg-[#0d1117] text-zinc-200">
                                    {STATUS_LABELS[st]}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <span className={`w-20 text-center inline-block shrink-0 text-[10px] font-bold uppercase tracking-wider py-1 border rounded ${SEVERITY_COLORS[issue.Severity] || ""}`}>
                              {issue.Severity}
                            </span>
                            <span className="text-xs text-zinc-500 w-20 text-right">{issue.BugType}</span>
                            <span className="text-xs text-zinc-400 w-24 text-right truncate">
                              {issue.Assignee?.Username || "—"}
                            </span>
                            <span className="text-xs text-zinc-700 w-6 text-right">
                              {expandedId === issue.IssueID ? "▾" : "▸"}
                            </span>
                          </div>

                          {/* Expanded detail */}
                          {expandedId === issue.IssueID && (
                            <div className="px-5 py-4 bg-zinc-950/50 border-b border-zinc-900/50">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Description</p>
                                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                      {issue.Description}
                                    </p>
                                  </div>
                                  {issue.Repo && (
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Repository</p>
                                      <p className="text-xs text-zinc-300">{issue.Repo.GHOwner}/{issue.Repo.GHName}</p>
                                    </div>
                                  )}
                                  {issue.Commit && (
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Linked Commit</p>
                                      <p className="text-xs text-[#1ef2c1]/80">{issue.Commit.SHA} — {issue.Commit.Message}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Status</p>
                                      <select 
                                        className="w-full bg-[#050505] border border-zinc-800 text-xs py-1.5 px-2 rounded focus:outline-none focus:border-[#1ef2c1]/50 font-medium"
                                        style={{ color: STATUS_COLORS[issue.Status] || "#1ef2c1" }}
                                        value={issue.Status}
                                        onChange={(e) => handleStatusChange(issue.IssueID, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {STATUS_ORDER.map(s => (
                                          <option key={s} value={s} className="bg-[#0d1117] text-zinc-200">
                                            {STATUS_LABELS[s]}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Assignee</p>
                                      <select 
                                        className="w-full bg-[#050505] border border-zinc-800 text-xs text-zinc-300 py-1.5 px-2 rounded focus:outline-none focus:border-[#1ef2c1]/50"
                                        value={issue.Assignee?.UserID || ""}
                                        onChange={(e) => handleAssigneeChange(issue.IssueID, e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                          <option key={u.UserID} value={u.UserID}>
                                            {u.Username}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Reporter</p>
                                      <p className="text-xs text-zinc-300">{issue.Reporter.Username}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Created</p>
                                      <p className="text-xs text-zinc-400">{new Date(issue.CreatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Comments</p>
                                      <p className="text-xs text-zinc-300">{issue._count.Comments}</p>
                                    </div>
                                  </div>

                                  {/* Quick Status Action Buttons */}
                                  <div className="pt-2 border-t border-zinc-900/80">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1.5">Quick Transition</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                      {STATUS_ORDER.map((st) => (
                                        <button
                                          key={st}
                                          disabled={issue.Status === st}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(issue.IssueID, st);
                                          }}
                                          className={`text-[10px] px-2.5 py-1 rounded border transition-colors ${
                                            issue.Status === st
                                              ? 'border-[#1ef2c1]/50 bg-[#1ef2c1]/10 text-[#1ef2c1] font-bold cursor-default'
                                              : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 bg-zinc-900/40 cursor-pointer'
                                          }`}
                                        >
                                          {issue.Status === st ? `✓ ${STATUS_LABELS[st]}` : STATUS_LABELS[st]}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </Scrollable>
    </div>
  );
}
