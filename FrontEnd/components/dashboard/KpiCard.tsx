interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
}

export default function KpiCard({ title, value, unit, subtitle, trend, accent }: KpiCardProps) {
  return (
    <div className={`relative bg-[#0d1117] border ${accent ? 'border-[#00ff00]/40 shadow-[0_0_20px_rgba(0,255,0,0.08)]' : 'border-zinc-900'} p-5 flex flex-col gap-3 overflow-hidden`}>
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff00] to-transparent" />
      )}
      <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-bold">{title}</p>
      <div className="flex items-end gap-1.5">
        <span className={`text-4xl font-bold font-mono ${accent ? 'text-[#00ff00]' : 'text-white'}`}>{value}</span>
        {unit && <span className="text-zinc-500 text-sm mb-1">{unit}</span>}
      </div>
      <div className="flex items-center justify-between">
        {subtitle && <p className="text-zinc-600 text-xs">{subtitle}</p>}
        {trend && (
          <span className={`text-xs font-mono ${trend.positive ? 'text-[#00ff00]' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
