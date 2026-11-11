"use client";

import React, { useEffect, useState } from 'react';
import KpiCard from "@/components/dashboard/KpiCard";
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

interface AuditEntry {
  AuditID: string;
  AuditTitle: string;
  AuditDesc: string;
  AuditTime: string;
  User: { Username: string };
}

export default function ProjectManagerDashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/issues").then((r) => r.json()),
      fetch("/api/audit").then((r) => r.json()),
    ])
      .then(([issuesData, auditData]) => {
        setIssues(Array.isArray(issuesData) ? issuesData : []);
        setAuditLogs(Array.isArray(auditData) ? auditData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = issues.length;
  const openIssues = issues.filter(i => i.Status === 'Open').length;
  const closedCount = issues.filter(i => i.Status === 'Closed').length;
  const closureRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;

  // Calculate MTTR dynamically
  const resolvedIssues = issues.filter(i => i.Status === 'Resolved' || i.Status === 'Closed');
  let mttrValue = "—";
  if (resolvedIssues.length > 0) {
    let totalMs = 0;
    let count = 0;
    resolvedIssues.forEach(i => {
      const created = new Date(i.CreatedAt).getTime();
      // Use UpdatedAt if available, otherwise fallback to current time minus created time as an estimate
      const resolved = (i as any).UpdatedAt ? new Date((i as any).UpdatedAt).getTime() : new Date().getTime();
      if (resolved > created) {
        totalMs += (resolved - created);
        count++;
      }
    });
    if (count > 0) {
      const avgHrs = totalMs / count / (1000 * 60 * 60);
      mttrValue = avgHrs.toFixed(1);
    }
  }

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

  const statusBreakdown = [
    { label: 'Open', count: issues.filter(i => i.Status === 'Open').length, color: '#eab308' },
    { label: 'In Progress', count: issues.filter(i => i.Status === 'InProgress').length, color: '#3b82f6' },
    { label: 'Under Review', count: issues.filter(i => i.Status === 'UnderReview').length, color: '#a855f7' },
    { label: 'Resolved', count: issues.filter(i => i.Status === 'Resolved').length, color: '#1ef2c1' },
    { label: 'Closed', count: closedCount, color: '#71717a' },
    { label: 'Reopened', count: issues.filter(i => i.Status === 'Reopened').length, color: '#ef4444' },
  ];

  const issueTableData = issues.map((i) => ({
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
      {/* KPI Row */}
      <section>
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4 font-bold">Key Metrics</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard title="Open Issues" value={loading ? "—" : openIssues} subtitle={`${total} total tracked`} trend={{ value: `${openIssues} need attention`, positive: openIssues === 0 }} accent />
          <KpiCard title="MTTR" value={loading ? "—" : mttrValue} unit="hrs" subtitle="Mean time to resolution" trend={{ value: mttrValue !== "—" ? 'Current Average' : 'No data', positive: true }} accent />
          <KpiCard title="Bug Closure Rate" value={loading ? "—" : closureRate} unit="%" subtitle={`${closedCount}/${total} closed`} trend={{ value: closureRate >= 70 ? 'Healthy' : '⚠ Below 70%', positive: closureRate >= 70 }} accent />
          <KpiCard title="Total Issues" value={loading ? "—" : total} subtitle="All tracked defects" trend={{ value: 'All time', positive: true }} accent />
        </div>
      </section>

      {/* Status Breakdown */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#0d1117] border border-zinc-900 p-6">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-6">Issues by Status</p>
          <div className="space-y-3">
            {statusBreakdown.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{s.label}</span>
                    <span className="font-mono text-zinc-300">{s.count}</span>
                  </div>
                  <div className="h-1 bg-zinc-900 w-full">
                    <div className="h-1 transition-all" style={{ width: total > 0 ? `${(s.count / total) * 100}%` : '0%', backgroundColor: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between text-xs">
            <span className="text-zinc-400">Total</span>
            <span className="font-mono text-zinc-300">{total}</span>
          </div>
        </div>

        {/* Severity Summary */}
        <div className="bg-[#0d1117] border border-zinc-900 p-6">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-6">By Severity</p>
          <div className="space-y-4">
            {[
              { label: 'Critical', color: '#ef4444', count: issues.filter(i => i.Severity === 'Critical').length },
              { label: 'High', color: '#f97316', count: issues.filter(i => i.Severity === 'High').length },
              { label: 'Medium', color: '#eab308', count: issues.filter(i => i.Severity === 'Medium').length },
              { label: 'Low', color: '#71717a', count: issues.filter(i => i.Severity === 'Low').length },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-zinc-400">{s.label}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Issue Table */}
      <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Recent Issues</p>
            <p className="text-xs text-zinc-500 mt-0.5">Sorted by latest activity</p>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
          </div>
        ) : (
          <IssueTable issues={issueTableData} onStatusChange={handleStatusChange} />
        )}
      </section>

      {/* Audit Log */}
      <section className="bg-[#0d1117] border border-zinc-900 p-6">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-4">Recent Audit Log</p>
        <div className="space-y-2 font-mono text-xs">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-4 h-4 border-2 border-zinc-700 border-t-[#1ef2c1] rounded-full animate-spin" />
            </div>
          ) : auditLogs.length === 0 ? (
            <p className="text-zinc-600 italic">No audit entries yet.</p>
          ) : (
            auditLogs.slice(0, 10).map((entry) => (
              <div key={entry.AuditID} className="flex items-center gap-4 py-1.5 border-b border-zinc-900/50 last:border-0">
                <span className="text-zinc-500 w-16 shrink-0">
                  {new Date(entry.AuditTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[#1ef2c1]/60 w-16 shrink-0">{entry.User.Username}</span>
                <span className="text-zinc-400 flex-1">{entry.AuditDesc}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
