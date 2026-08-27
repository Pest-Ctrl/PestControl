import Scrollable from "@/components/Scrollable";
import IssueTable, { Issue } from "@/components/dashboard/IssueTable";
import Sidebar from "@/components/dashboard/Sidebar";
// Sample data for now we will be updaitng this 
const MOCK_ISSUES: Issue[] = [
  { id: '#BTS-001', title: 'Auth token not refreshing on session expiry', status: 'Open',        severity: 'Critical', type: 'Security',      assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-18' },
  { id: '#BTS-002', title: 'Dashboard fails to load on Safari 17',         status: 'InProgress', severity: 'High',     type: 'Compatibility', assignee: 'dev02',        reporter: 'test02',   createdAt: '2026-08-19' },
  { id: '#BTS-003', title: 'Issue filter clears on page refresh',           status: 'UnderReview',severity: 'Medium',   type: 'Functional',    assignee: 'dev01',        reporter: 'admin',    createdAt: '2026-08-19' },
  { id: '#BTS-004', title: 'MTTR endpoint response time > 1s at 90 days',  status: 'Open',       severity: 'High',     type: 'Performance',   assignee: 'Unassigned',   reporter: 'test01',   createdAt: '2026-08-20' },
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
  { label: 'Resolved',     count: STATUS_COUNTS['Resolved'] || 0,    color: '#00ff00' },
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
            <p className="text-xs text-zinc-600">Sprint 4 · Aug 18 – Aug 31, 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#0d1117] border border-zinc-800 px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff00] animate-pulse" />
              <span className="text-xs text-zinc-400">Live</span>
            </div>
            <button className="bg-[#00ff00] text-black text-xs font-bold px-4 py-1.5 hover:bg-[#00cc00] transition-colors tracking-wider uppercase">
              + New Issue
            </button>
          </div>
        </header>

        <section className="bg-[#0d1117] border border-zinc-900">
        <div className="px-6 py-4 border-b border-zinc-900 flex items-center justify-between">
            <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">Recent Issues</p>
            <p className="text-xs text-zinc-700 mt-0.5">Sorted by latest activity</p>
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
        </section>
      </Scrollable>
    </div>
  );
}
