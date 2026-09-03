import React from 'react';
import IssueTable from "@/components/dashboard/IssueTable";
import { MOCK_ISSUES } from "./ProjectManagerDashboard";

export default function DeveloperDashboard({ userName }: { userName: string }) {
  // Since we don't have real usernames mapped to issues perfectly in mock data,
  // we'll just mock the "My Assigned Issues" logic by filtering randomly or by a specific assignee.
  const myIssues = MOCK_ISSUES.filter(i => i.assignee === 'dev01' || i.assignee === 'Unassigned');
  
  const inProgressCount = myIssues.filter(i => i.status === 'InProgress').length;
  const underReviewCount = myIssues.filter(i => i.status === 'UnderReview').length;

  return (
    <main className="flex-1 p-8 space-y-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, Developer</h2>
        <p className="text-zinc-400 text-sm">You have {inProgressCount} issues in progress and {underReviewCount} issues under review.</p>
      </section>

      {/* Developer Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-6 shadow-[0_0_15px_rgba(30,242,193,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">My Active Tasks</h3>
            <span className="text-xs bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-1 rounded">In Progress</span>
          </div>
          <div className="space-y-3">
            {myIssues.filter(i => i.status === 'InProgress').length === 0 && (
              <p className="text-sm text-zinc-600 italic">No active tasks. Pull an issue from the backlog.</p>
            )}
            {myIssues.filter(i => i.status === 'InProgress').map(issue => (
              <div key={issue.id} className="border border-zinc-800 p-4 hover:border-zinc-600 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[#1ef2c1] font-mono text-xs">{issue.id}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${issue.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 font-medium">{issue.title}</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-xs bg-[#1ef2c1]/10 text-[#1ef2c1] border border-[#1ef2c1]/30 px-3 py-1.5 hover:bg-[#1ef2c1]/20">Mark Ready for Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Available Backlog</h3>
            <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Open</span>
          </div>
          <div className="space-y-3">
            {myIssues.filter(i => i.status === 'Open').map(issue => (
              <div key={issue.id} className="border border-zinc-800 p-3 hover:border-zinc-600 cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <span className="text-[#1ef2c1] font-mono text-xs mr-3">{issue.id}</span>
                  <span className="text-sm text-zinc-300">{issue.title}</span>
                </div>
                <button className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white">Assign to me →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">All Assigned Issues</p>
          </div>
        </div>
        <IssueTable issues={myIssues} />
      </section>
    </main>
  );
}
