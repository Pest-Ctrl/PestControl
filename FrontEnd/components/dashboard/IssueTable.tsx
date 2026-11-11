type IssueStatus = 'Open' | 'InProgress' | 'UnderReview' | 'Resolved' | 'Closed' | 'Reopened';
type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Issue {
  id: string;
  fullId?: string;
  title: string;
  status: IssueStatus;
  severity: IssueSeverity;
  type: string;
  assignee: string;
  reporter: string;
  createdAt: string;
}

const STATUS_STYLES: Record<IssueStatus, string> = {
  Open:        'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50',
  InProgress:  'bg-blue-900/40 text-blue-300 border border-blue-700/50',
  UnderReview: 'bg-purple-900/40 text-purple-300 border border-purple-700/50',
  Resolved:    'bg-green-900/40 text-green-300 border border-green-700/50',
  Closed:      'bg-zinc-800 text-zinc-400 border border-zinc-700',
  Reopened:    'bg-red-900/40 text-red-300 border border-red-700/50',
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  Open: 'Open',
  InProgress: 'In Progress',
  UnderReview: 'Under Review',
  Resolved: 'Resolved',
  Closed: 'Closed',
  Reopened: 'Reopened',
};

const SEVERITY_STYLES: Record<IssueSeverity, string> = {
  Critical: 'bg-red-900/40 text-red-300 border border-red-700/40',
  High:     'bg-orange-900/40 text-orange-300 border border-orange-700/40',
  Medium:   'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40',
  Low:      'bg-zinc-800 text-zinc-400 border border-zinc-700',
};

interface IssueTableProps {
  issues: Issue[];
  onStatusChange?: (issueId: string, newStatus: IssueStatus) => void;
}

export default function IssueTable({ issues, onStatusChange }: IssueTableProps) {
  const renderStatusControl = (issue: Issue) =>
    onStatusChange ? (
      <select
        value={issue.status}
        onChange={(e) => {
          e.stopPropagation();
          onStatusChange(issue.fullId || issue.id, e.target.value as IssueStatus);
        }}
        onClick={(e) => e.stopPropagation()}
        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer bg-black/60 border focus:outline-none focus:border-[#1ef2c1]/50 ${STATUS_STYLES[issue.status]}`}
      >
        {(Object.keys(STATUS_LABELS) as IssueStatus[]).map((st) => (
          <option key={st} value={st} className="bg-[#0d1117] text-zinc-200 normal-case">
            {STATUS_LABELS[st]}
          </option>
        ))}
      </select>
    ) : (
      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[issue.status]}`}>
        {STATUS_LABELS[issue.status]}
      </span>
    );

  return (
    <>
      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-zinc-900">
        {issues.map((issue) => (
          <div key={issue.id} className="p-4 space-y-2.5 hover:bg-[#1ef2c1]/[0.03] transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#1ef2c1]/80 text-xs font-medium">{issue.id}</span>
              <span className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[issue.severity]}`}>
                {issue.severity}
              </span>
            </div>
            <p className="text-sm text-zinc-200 font-medium leading-snug break-words">{issue.title}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                {renderStatusControl(issue)}
                <span className="text-[11px] text-zinc-500 px-2 py-0.5 bg-zinc-900/60 border border-zinc-800">
                  {issue.type}
                </span>
              </div>
              <span className="text-[11px] text-zinc-600">{issue.createdAt}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 pt-1 border-t border-zinc-900/50">
              <span className="truncate">Assignee: <span className="text-zinc-300">{issue.assignee}</span></span>
              <span className="truncate">Reporter: <span className="text-zinc-400">{issue.reporter}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-900">
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">ID</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Title</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Status</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Severity</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Type</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Assignee</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Reporter</th>
              <th className="text-left px-4 py-3 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Created</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, i) => (
              <tr
                key={issue.id}
                className={`border-b border-zinc-900/50 hover:bg-[#1ef2c1]/[0.03] transition-colors cursor-pointer group ${i % 2 === 0 ? '' : 'bg-zinc-950/30'}`}
              >
                <td className="px-4 py-3 text-[#1ef2c1]/70 text-xs font-medium group-hover:text-[#1ef2c1] transition-colors">
                  {issue.id}
                </td>
                <td className="px-4 py-3 text-zinc-200 max-w-[220px]">
                  <span className="truncate block" title={issue.title}>{issue.title}</span>
                </td>
                <td className="px-4 py-3">
                  {renderStatusControl(issue)}
                </td>
                <td className="px-4 py-3">
                  <span className={`w-20 text-center inline-block shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${SEVERITY_STYLES[issue.severity]}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{issue.type}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{issue.assignee}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{issue.reporter}</td>
                <td className="px-4 py-3 text-zinc-600 text-xs">{issue.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
