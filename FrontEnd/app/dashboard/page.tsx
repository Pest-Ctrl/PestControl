import Scrollable from "@/components/Scrollable";
import IssueTable, { Issue } from "@/components/dashboard/IssueTable";
import KpiCard from "@/components/dashboard/KpiCard";
import Sidebar from "@/components/dashboard/Sidebar";
import Link from "next/link";
// Sample data for now we will be updaitng this 
const MOCK_ISSUES: Issue[] = [
  { id: '#BTS-001', title: 'Auth token not refreshing on session expiry', status: 'Open',        severity: 'Critical', type: 'Security',      assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-18' },
  { id: '#BTS-002', title: 'Dashboard fails to load on Safari 17',         status: 'InProgress', severity: 'High',     type: 'Compatibility', assignee: 'dev02',        reporter: 'test02',   createdAt: '2026-08-19' },
  { id: '#BTS-003', title: 'Issue filter clears on page refresh',           status: 'UnderReview',severity: 'Medium',   type: 'Functional',    assignee: 'dev01',        reporter: 'admin',    createdAt: '2026-08-19' },
  { id: '#BTS-004', title: 'MTTR endpoint response time > 1s at 90 days',  status: 'Open',       severity: 'High',     type: 'Performance',   assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-20' },
  { id: '#BTS-005', title: 'Comment @-mention notification not firing',     status: 'Resolved',   severity: 'Medium',   type: 'Functional',    assignee: 'dev03',        reporter: 'test02',   createdAt: '2026-08-20' },
  { id: '#BTS-006', title: 'Audit log missing assignee change entries',     status: 'InProgress', severity: 'High',     type: 'Data',          assignee: 'dev01',        reporter: 'admin',    createdAt: '2026-08-21' },
  { id: '#BTS-007', title: 'CSV export truncates at 9,000 rows not 10,000',status: 'Open',       severity: 'Medium',   type: 'Functional',    assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-21' },
  { id: '#BTS-008', title: 'GitHub OAuth callback 500 on invalid state',   status: 'Closed',     severity: 'Critical', type: 'Security',      assignee: 'dev02',        reporter: 'test02',   createdAt: '2026-08-17' },
  { id: '#BTS-009', title: 'Kanban drag-and-drop broken on mobile',        status: 'Reopened',   severity: 'Low',      type: 'UI',            assignee: 'dev04',        reporter: 'admin',    createdAt: '2026-08-22' },
  { id: '#BTS-010', title: 'Rate limiter not resetting after 15 min window',status: 'Open',      severity: 'High',     type: 'Security',      assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-23' },
  { id: '#BTS-011', title: 'WCAG contrast fail on disabled buttons',       status: 'InProgress', severity: 'Low',      type: 'UI',            assignee: 'dev05',        reporter: 'test02',   createdAt: '2026-08-23' },
  { id: '#BTS-012', title: 'Refresh token not rotated on every use',       status: 'Resolved',   severity: 'Critical', type: 'Security',      assignee: 'dev01',        reporter: 'admin',    createdAt: '2026-08-24' },
];

const STATUS_COUNTS = MOCK_ISSUES.reduce((acc, i) => {
  acc[i.status] = (acc[i.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const VELOCITY_WEEKS = [
  { week: 'W32', closed: 3 },
  { week: 'W33', closed: 5 },
  { week: 'W34', closed: 4 },
  { week: 'W35', closed: 6 },
];
const MAX_VELOCITY = Math.max(...VELOCITY_WEEKS.map(w => w.closed));

const STATUS_DONUT = [
  { label: 'Open',         count: STATUS_COUNTS['Open'] || 0,        color: '#eab308' },
  { label: 'In Progress',  count: STATUS_COUNTS['InProgress'] || 0,  color: '#3b82f6' },
  { label: 'Under Review', count: STATUS_COUNTS['UnderReview'] || 0, color: '#a855f7' },
  { label: 'Resolved',     count: STATUS_COUNTS['Resolved'] || 0,    color: '#1ef2c1' },
  { label: 'Closed',       count: STATUS_COUNTS['Closed'] || 0,      color: '#71717a' },
  { label: 'Reopened',     count: STATUS_COUNTS['Reopened'] || 0,    color: '#ef4444' },
];
const TOTAL_ISSUES = MOCK_ISSUES.length;

export default function DashboardPage() {
  const openIssues = MOCK_ISSUES.filter(i => i.status === 'Open').length;
  const closedThisWeek = 6;
  const totalCouldClose = 9;
  const closureRate = Math.round((closedThisWeek / totalCouldClose) * 100);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar />

      {/* Main */}
      <Scrollable className="flex-1 flex flex-col h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur border-b border-zinc-900 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Overview</h1>
            <p className="text-xs text-zinc-400">Sprint 4 · Aug 18 – Aug 31, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-zinc-800 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ef2c1] animate-pulse" />
              <span className="text-xs text-zinc-400">Live</span>
            </div>
            <Link href="/space" className="bg-[#1ef2c1] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#16b892] transition-colors tracking-wider uppercase">
              + New Issue
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8">
          {/* KPI Row */}
          <section>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4 font-bold">Key Metrics</p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                title="Open Issues"
                value={openIssues}
                subtitle={`${TOTAL_ISSUES} total tracked`}
                trend={{ value: '+2 this week', positive: false }}
                accent
              />
              <KpiCard
                title="MTTR"
                value="18.4"
                unit="hrs"
                subtitle="Mean time to resolution"
                trend={{ value: '↓ 3.2h vs last sprint', positive: true }}
                accent
              />
              <KpiCard
                title="Bug Closure Rate"
                value={closureRate}
                unit="%"
                subtitle={`${closedThisWeek}/${totalCouldClose} closed this week`}
                trend={{ value: closureRate >= 70 ? 'Healthy' : '⚠ Below 70% threshold', positive: closureRate >= 70 }}
                accent
              />
              <KpiCard
                title="Defect Velocity"
                value="4.5"
                unit="/ wk"
                subtitle="4-week rolling average"
                trend={{ value: '+1.5 vs prior avg', positive: true }}
                accent
              />
            </div>
          </section>

          {/* Charts + Status breakdown */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Velocity Bar Chart */}
            <div className="xl:col-span-2 bg-[#0d1117] border border-zinc-900 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Defect Velocity</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Issues closed per week</p>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">4-week window</span>
              </div>
              <div className="flex items-end gap-4 h-32">
                {VELOCITY_WEEKS.map((w) => (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">{w.closed}</span>
                    <div
                      className="w-full bg-gradient-to-t from-[#1ef2c1]/80 to-[#1ef2c1]/30 border-t-2 border-[#1ef2c1] transition-all"
                      style={{ height: `${(w.closed / MAX_VELOCITY) * 100}%` }}
                    />
                    <span className="text-[10px] text-zinc-400 font-mono">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-[#0d1117] border border-zinc-900 p-6">
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-6">Issues by Status</p>
              <div className="space-y-3">
                {STATUS_DONUT.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">{s.label}</span>
                        <span className="font-mono text-zinc-300">{s.count}</span>
                      </div>
                      <div className="h-1 bg-zinc-900 w-full">
                        <div
                          className="h-1 transition-all"
                          style={{ width: `${(s.count / TOTAL_ISSUES) * 100}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between text-xs">
                <span className="text-zinc-400">Total</span>
                <span className="font-mono text-zinc-300">{TOTAL_ISSUES}</span>
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
              <div className="flex items-center gap-2">
                <select className="bg-[#050505] border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 focus:outline-none focus:border-zinc-600">
                  <option>All Statuses</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
                <select className="bg-[#050505] border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 focus:outline-none focus:border-zinc-600">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <button className="border border-zinc-800 text-zinc-400 text-xs px-3 py-1.5 hover:border-zinc-600 transition-colors">
                  Export CSV
                </button>
              </div>
            </div>
            <IssueTable issues={MOCK_ISSUES} />
            <div className="px-6 py-3 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Showing {MOCK_ISSUES.length} issues</span>
              <div className="flex items-center gap-2">
                <button className="text-xs text-zinc-400 hover:text-zinc-400 px-2 py-1 border border-zinc-900 hover:border-zinc-700 transition-colors">← Prev</button>
                <span className="text-xs text-zinc-500 font-mono px-2">1 / 1</span>
                <button className="text-xs text-zinc-400 hover:text-zinc-400 px-2 py-1 border border-zinc-900 hover:border-zinc-700 transition-colors">Next →</button>
              </div>
            </div>
          </section>

          {/* Audit Log preview */}
          <section className="bg-[#0d1117] border border-zinc-900 p-6">
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold mb-4">Recent Audit Log</p>
            <div className="space-y-2 font-mono text-xs">
              {[
                { time: '15:01:43', user: 'dev01', action: 'Transitioned #BTS-012', from: 'InProgress', to: 'Resolved' },
                { time: '14:47:11', user: 'admin', action: 'Reassigned #BTS-006', from: 'dev02', to: 'dev01' },
                { time: '13:22:08', user: 'test01', action: 'Filed #BTS-010', from: '—', to: 'Open' },
                { time: '11:55:30', user: 'dev04', action: 'Transitioned #BTS-009', from: 'Resolved', to: 'Reopened' },
                { time: '10:14:02', user: 'test02', action: 'Commented on #BTS-003', from: '—', to: '—' },
              ].map((entry, i) => (
                <div key={i} className="flex items-center gap-4 py-1.5 border-b border-zinc-900/50 last:border-0">
                  <span className="text-zinc-500 w-16 shrink-0">{entry.time}</span>
                  <span className="text-[#1ef2c1]/60 w-16 shrink-0">{entry.user}</span>
                  <span className="text-zinc-400 flex-1">{entry.action}</span>
                  <span className="text-zinc-500">{entry.from} → {entry.to}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </Scrollable>
    </div>
  );
}
