import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";

function UtilityDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary className="lp-chip list-none px-5 py-2 font-semibold hover:text-[var(--accent)]">
        {label}
      </summary>
      <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(92vw,520px)]">
        {children}
      </div>
    </details>
  );
}

export function TopUtilityMenu({ runs }: { runs: TrendingUpdateRunListItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <UtilityDropdown label="手动更新">
        <UpdateTrendingButton />
      </UtilityDropdown>
      <UtilityDropdown label="下次运行">
        <NextTrendingCountdown />
      </UtilityDropdown>
      <UtilityDropdown label="运行日志">
        <TrendingUpdateRunsPanel runs={runs} />
      </UtilityDropdown>
    </div>
  );
}
