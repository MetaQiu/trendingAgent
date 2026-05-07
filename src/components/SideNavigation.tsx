import Link from "next/link";
import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";

function SideDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group relative">
      <summary className="lp-chip block list-none px-3 py-2 text-center text-xs font-semibold hover:text-[var(--accent)]">
        {label}
      </summary>
      <div className="absolute right-[calc(100%+12px)] top-0 z-50 w-[min(92vw,520px)]">
        {children}
      </div>
    </details>
  );
}

function SideAnchor({ href, label }: { href: string; label: string }) {
  return (
    <a className="lp-chip block px-3 py-2 text-center text-xs font-semibold hover:text-[var(--accent)]" href={href}>
      {label}
    </a>
  );
}

export function SideNavigation({
  observedDate,
  dateDetailHref,
  runs,
}: {
  observedDate: string;
  dateDetailHref: string;
  runs: TrendingUpdateRunListItem[];
}) {
  return (
    <aside className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
      <div className="lp-card flex flex-col gap-2 p-2">
        <span className="lp-chip px-3 py-2 text-center font-mono text-[11px] font-semibold" title={`Observed ${observedDate}`}>
          {observedDate.slice(5)}
        </span>
        <SideAnchor href="#top-repositories" label="排行" />
        <SideAnchor href="#charts" label="图表" />
        <SideAnchor href="#summary" label="总结" />
        <SideAnchor href="#repo-details" label="仓库" />
        <SideDropdown label="更新">
          <UpdateTrendingButton />
        </SideDropdown>
        <SideDropdown label="下次">
          <NextTrendingCountdown />
        </SideDropdown>
        <SideDropdown label="日志">
          <TrendingUpdateRunsPanel runs={runs} />
        </SideDropdown>
        <a className="lp-chip block px-3 py-2 text-center text-xs font-semibold hover:text-[var(--accent)]" href="https://github.com/MetaQiu/trendingAgent" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <Link className="lp-chip block px-3 py-2 text-center text-xs font-semibold hover:text-[var(--accent)]" href={dateDetailHref}>
          详情
        </Link>
      </div>
    </aside>
  );
}
