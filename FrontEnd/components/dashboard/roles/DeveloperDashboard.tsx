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

export default function DeveloperDashboard({ userName }: { userName: string }) {
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

  // Filter issues relevant to developers (assigned or unassigned)
  const myIssues = issues.filter(i => i.Assignee !== null);
  const backlog = issues.filter(i => i.Status === 'Open' && i.Assignee === null);
  const inProgressIssues = issues.filter(i => i.Status === 'InProgress');
  const underReviewIssues = issues.filter(i => i.Status === 'UnderReview');

  const issueTableData = myIssues.map((i) => ({
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
    <main className="flex-1 p-8 space-y-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Developer</h2>
        <p className="text-zinc-400 text-sm">
          You have {inProgressIssues.length} issues in progress and {underReviewIssues.length} under review.
        </p>
      </section>

      {/* Developer Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-6 shadow-[0_0_15px_rgba(30,242,193,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">My Active Tasks</h3>
            <span className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-1 rounded">In Progress</span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : inProgressIssues.length === 0 ? (
              <p className="text-sm text-zinc-600 italic">No active tasks. Pull an issue from the backlog.</p>
            ) : (
              inProgressIssues.map(issue => (
                <div key={issue.IssueID} className="border border-zinc-800 p-4 hover:border-zinc-600 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[#1ef2c1]/80 text-xs font-medium">{issue.IssueID.slice(0, 10)}</span>
                    <span className={`w-20 text-center inline-block shrink-0 text-[10px] uppercase tracking-wider py-0.5 rounded border ${issue.Severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {issue.Severity}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">{issue.Title}</p>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(issue.IssueID, 'UnderReview')}
                      className="text-xs bg-[#1ef2c1]/10 text-[#1ef2c1] border border-[#1ef2c1]/30 px-3 py-1.5 hover:bg-[#1ef2c1]/20 transition-colors"
                    >
                      Mark Ready for Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Available Backlog</h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Open</span>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
              </div>
            ) : backlog.length === 0 ? (
              <p className="text-sm text-zinc-600 italic">No unassigned issues in backlog.</p>
            ) : (
              backlog.map(issue => (
                <div key={issue.IssueID} className="border border-zinc-800 p-3 hover:border-zinc-600 cursor-pointer transition-colors flex justify-between items-center">
                  <div>
                    <span className="text-[#1ef2c1]/80 text-xs font-medium mr-3">{issue.IssueID.slice(0, 10)}</span>
                    <span className="text-sm text-zinc-300">{issue.Title}</span>
                  </div>
                  <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white">Assign to me →</button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Full Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">All Assigned Issues</p>
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
