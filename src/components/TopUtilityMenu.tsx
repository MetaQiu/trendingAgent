import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";

function RefreshIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.4 6.4" />
      <path d="M3 12A9 9 0 0 1 18.4 5.6" />
      <path d="M18 2v4h-4" />
      <path d="M6 22v-4h4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function UtilityDropdown({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)] group-open:border-[var(--accent)] group-open:text-[var(--accent)]"
        title={label}
        aria-label={label}
      >
        {icon}
      </summary>
      <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(92vw,520px)]">
        {children}
      </div>
    </details>
  );
}

export function TopUtilityMenu({ runs }: { runs: TrendingUpdateRunListItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <UtilityDropdown label="手动更新" icon={<RefreshIcon />}>
        <UpdateTrendingButton />
      </UtilityDropdown>
      <UtilityDropdown label="下次运行" icon={<ClockIcon />}>
        <NextTrendingCountdown />
      </UtilityDropdown>
      <UtilityDropdown label="运行日志" icon={<LogsIcon />}>
        <TrendingUpdateRunsPanel runs={runs} />
      </UtilityDropdown>
    </div>
  );
}
