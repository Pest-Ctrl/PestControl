import React from 'react';
import IssueTable from "@/components/dashboard/IssueTable";
import { MOCK_ISSUES } from "./ProjectManagerDashboard";

export default function QADashboard({ userName }: { userName: string }) {
  // QA focuses on Resolved and Reopened issues.
  const qaIssues = MOCK_ISSUES.filter(i => i.status === 'Resolved' || i.status === 'Reopened' || i.status === 'Closed');
  
  const resolvedCount = MOCK_ISSUES.filter(i => i.status === 'Resolved').length;
  const reopenedCount = MOCK_ISSUES.filter(i => i.status === 'Reopened').length;

  return (
    <main className="flex-1 p-8 space-y-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">QA Verification Center</h2>
        <p className="text-zinc-400 text-sm">There are {resolvedCount} issues awaiting your verification and {reopenedCount} regressions being investigated.</p>
      </section>

      {/* QA Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-6 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Ready for Testing</h3>
            <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-1 rounded">Resolved</span>
          </div>
          <div className="space-y-3">
            {MOCK_ISSUES.filter(i => i.status === 'Resolved').length === 0 && (
              <p className="text-sm text-zinc-600 italic">No issues ready for testing.</p>
            )}
            {MOCK_ISSUES.filter(i => i.status === 'Resolved').map(issue => (
              <div key={issue.id} className="border border-zinc-800 p-4 hover:border-zinc-600 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[#1ef2c1] font-mono text-xs">{issue.id}</span>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 bg-zinc-800 text-zinc-400`}>
                    Assigned to: {issue.assignee}
                  </span>
                </div>
                <p className="text-sm text-zinc-300 font-medium mb-4">{issue.title}</p>
                <div className="flex gap-2">
                  <button className="flex-1 text-xs bg-zinc-800 text-white px-3 py-2 hover:bg-zinc-700 transition-colors">Verify & Close</button>
                  <button className="flex-1 text-xs bg-red-900/30 text-red-400 border border-red-900/50 px-3 py-2 hover:bg-red-900/50 transition-colors">Reject (Reopen)</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Active Regressions</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Reopened</span>
          </div>
          <div className="space-y-3">
            {MOCK_ISSUES.filter(i => i.status === 'Reopened').length === 0 && (
              <p className="text-sm text-zinc-600 italic">No regressions right now.</p>
            )}
            {MOCK_ISSUES.filter(i => i.status === 'Reopened').map(issue => (
              <div key={issue.id} className="border border-zinc-800 p-3 hover:border-zinc-600 cursor-pointer transition-colors flex justify-between items-center">
                <div>
                  <span className="text-red-400 font-mono text-xs mr-3">{issue.id}</span>
                  <span className="text-sm text-zinc-300">{issue.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Verification History</p>
          </div>
        </div>
        <IssueTable issues={qaIssues} />
      </section>
    </main>
  );
}
