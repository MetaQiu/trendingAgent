export type TrendingUpdateRunListItem = {
  id: string;
  status: string;
  trigger: string;
  dateKey: string | null;
  since: string | null;
  repoCount: number;
  snapshotCount: number;
  message: string | null;
  errorMessage: string | null;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
};

type TrendingUpdateRunsPanelProps = {
  runs: TrendingUpdateRunListItem[];
};

const statusLabels: Record<string, string> = {
  running: "运行中",
  success: "成功",
  failed: "失败",
};

const triggerLabels: Record<string, string> = {
  cron: "自动",
  manual: "手动",
  script: "脚本",
};

const statusClasses: Record<string, string> = {
  running: "bg-[rgba(255,107,53,0.12)] text-[var(--accent-soft)]",
  success: "bg-[rgba(15,122,58,0.12)] text-[var(--positive)]",
  failed: "bg-[rgba(180,53,28,0.12)] text-[var(--negative)]",
};

function formatDuration(durationMs: number | null) {
  if (durationMs == null) return "-";
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function isPossiblyTimedOut(run: TrendingUpdateRunListItem) {
  return run.status === "running" && Date.now() - new Date(run.startedAt).getTime() > 30 * 60 * 1000;
}

export function TrendingUpdateRunsPanel({ runs }: TrendingUpdateRunsPanelProps) {
  const latestRun = runs[0];

  return (
    <details className="lp-card group p-6">
      <summary className="flex list-none items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="lp-eyebrow">Runs</p>
          <h2 className="mt-2 text-xl font-semibold lp-ink">最近运行日志</h2>
          <p className="mt-2 line-clamp-2 text-sm lp-muted">
            {latestRun ? `${statusLabels[latestRun.status] ?? latestRun.status} · ${latestRun.message || latestRun.errorMessage || "无消息"}` : "暂无运行日志。"}
          </p>
        </div>
        <span className="lp-chip px-3 py-1 text-sm transition group-open:rotate-180">⌄</span>
      </summary>

      {runs.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-[var(--chip-bg)] p-4 text-sm lp-muted">暂无运行日志。</p>
      ) : (
        <div className="mt-5 divide-y divide-[var(--border)]">
          {runs.map((run) => (
            <article key={run.id} className="py-4 first:pt-0 last:pb-0">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[run.status] ?? "bg-[var(--chip-bg)] lp-muted"}`}>
                      {statusLabels[run.status] ?? run.status}
                    </span>
                    <span className="lp-chip px-2.5 py-1 text-xs font-semibold">
                      {triggerLabels[run.trigger] ?? run.trigger}
                    </span>
                    {run.dateKey ? <span className="text-xs lp-muted">{run.dateKey} · {run.since ?? "daily"}</span> : null}
                  </div>
                  <p className="text-sm lp-ink">{run.errorMessage || run.message || "无消息"}</p>
                  {isPossiblyTimedOut(run) ? <p className="text-xs text-[var(--accent-soft)]">该任务运行已超过 30 分钟，可能已超时。</p> : null}
                </div>
                <div className="grid grid-cols-3 gap-6 text-right text-xs lp-muted sm:min-w-72">
                  <div>
                    <p className="font-mono font-semibold lp-ink">{run.repoCount}</p>
                    <p>仓库</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold lp-ink">{run.snapshotCount}</p>
                    <p>快照</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold lp-ink">{formatDuration(run.durationMs)}</p>
                    <p>耗时</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs lp-muted">开始：{new Date(run.startedAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </details>
  );
}
