import React from 'react';
import IssueTable from "@/components/dashboard/IssueTable";
import { MOCK_ISSUES } from "./ProjectManagerDashboard";
import Link from 'next/link';

export default function ImporterDashboard({ userName }: { userName: string }) {
  // Importer only sees issues they have reported
  const myReportedIssues = MOCK_ISSUES.filter(i => i.reporter === 'test01' || i.reporter === 'test02'); 
  // Normally this would filter by actual user ID/name.

  return (
    <main className="flex-1 p-8 space-y-8">
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Bug Reporting Center</h2>
        <p className="text-zinc-400 text-sm">Welcome back. You have reported {myReportedIssues.length} issues in total.</p>
      </section>

      {/* Importer Action Center */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1117] border border-zinc-900 p-8 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(30,242,193,0.05)]">
          <div className="w-16 h-16 bg-[#1ef2c1]/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-[#1ef2c1] text-2xl">🐞</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Report a New Defect</h3>
          <p className="text-sm text-zinc-400 mb-6">Found a bug? File a deterministic report linking directly to the repository and commit SHA.</p>
          <Link href="/space" className="w-full bg-[#1ef2c1] text-black font-bold tracking-widest uppercase py-3 rounded-md hover:bg-[#16b892] transition-colors shadow-[0_0_15px_rgba(30,242,193,0.3)]">
            + File Issue
          </Link>
        </div>

        <div className="bg-[#0d1117] border border-zinc-900 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Imported Repositories</h3>
          </div>
          <div className="space-y-3">
            <div className="border border-zinc-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">github.com/</span>
                <span className="text-white font-mono">pest-control/backend</span>
              </div>
              <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-1 rounded">Synced</span>
            </div>
            <div className="border border-zinc-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500">github.com/</span>
                <span className="text-white font-mono">pest-control/frontend</span>
              </div>
              <span className="text-xs bg-[#1ef2c1]/20 text-[#1ef2c1] px-2 py-1 rounded">Synced</span>
            </div>
            <button className="w-full mt-4 text-xs bg-zinc-800 text-zinc-300 py-3 hover:bg-zinc-700 transition-colors uppercase tracking-widest">
              Import Another Repo
            </button>
          </div>
        </div>
      </section>

      {/* Full Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Issues I've Reported</p>
          </div>
        </div>
        <IssueTable issues={myReportedIssues} />
      </section>
    </main>
  );
}
