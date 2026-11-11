"use client";

import React, { useEffect, useState } from 'react';
import IssueTable from "@/components/dashboard/IssueTable";

interface Issue {
  IssueID: string;
  Title: string;
  Status: string;
  Severity: string;
  BugType: string;
  CreatedAt: string;
  Reporter: { Username: string };
  Assignee: { Username: string } | null;
}

export default function QADashboard({ userName }: { userName: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((data) => { setIssues(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIssues(prev => prev.map(issue => {
          if (issue.IssueID === issueId || issue.IssueID.slice(0, 10) === issueId) {
            return { ...issue, Status: newStatus };
          }
          return issue;
        }));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const resolvedIssues = issues.filter(i => i.Status === 'Resolved');
  const reopenedIssues = issues.filter(i => i.Status === 'Reopened');
  const qaIssues = issues.filter(i => ['Resolved', 'Reopened', 'Closed'].includes(i.Status));

  const issueTableData = qaIssues.map((i) => ({
    id: i.IssueID.slice(0, 10),
    fullId: i.IssueID,
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
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">QA Verification Center</h2>
        <p className="text-zinc-400 text-sm">
          There are {resolvedIssues.length} issues awaiting your verification and {reopenedIssues.length} regressions being investigated.
        </p>
      </section>

      {/* QA Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-4 sm:p-6 shadow-[0_0_15px_rgba(168,85,247,0.05)] min-w-0">
          <div className="flex justify-between items-center gap-2 mb-5 sm:mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Ready for Testing</h3>
            <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-1 rounded shrink-0">Resolved</span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : resolvedIssues.length === 0 ? (
              <p className="text-sm text-zinc-600 italic">No issues ready for testing.</p>
            ) : (
              resolvedIssues.map(issue => (
                <div key={issue.IssueID} className="border border-zinc-800 p-3.5 sm:p-4 hover:border-zinc-600 cursor-pointer transition-colors">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <span className="text-[#1ef2c1]/80 text-xs font-medium">{issue.IssueID.slice(0, 10)}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-zinc-800 text-zinc-400 truncate max-w-full">
                      Assigned to: {issue.Assignee?.Username || "—"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 font-medium mb-4 break-words">{issue.Title}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => handleStatusChange(issue.IssueID, 'Closed')}
                      className="flex-1 text-xs bg-zinc-800 text-white px-3 py-2 hover:bg-zinc-700 transition-colors"
                    >
                      Verify & Close
                    </button>
                    <button 
                      onClick={() => handleStatusChange(issue.IssueID, 'Reopened')}
                      className="flex-1 text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-2 hover:bg-red-900/50 transition-colors"
                    >
                      Reject (Reopen)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-4 sm:p-6 min-w-0">
          <div className="flex justify-between items-center gap-2 mb-5 sm:mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Active Regressions</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded shrink-0">Reopened</span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : reopenedIssues.length === 0 ? (
              <p className="text-sm text-zinc-600 italic">No regressions right now.</p>
            ) : (
              reopenedIssues.map(issue => (
                <div key={issue.IssueID} className="border border-zinc-800 p-3 hover:border-zinc-600 cursor-pointer transition-colors flex flex-wrap justify-between items-center gap-2">
                  <div className="min-w-0">
                    <span className="text-red-400 text-xs font-medium mr-2.5">{issue.IssueID.slice(0, 10)}</span>
                    <span className="text-sm text-zinc-300 break-words">{issue.Title}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Full Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-4 sm:px-6 py-4 border-b border-zinc-900">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Verification History</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
          </div>
        ) : (
          <IssueTable issues={issueTableData} onStatusChange={handleStatusChange} />
        )}
      </section>
    </main>
  );
}
