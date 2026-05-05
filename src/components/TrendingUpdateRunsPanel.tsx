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
  running: "bg-amber-100 text-amber-700",
  success: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
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
    <details className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">最近运行日志</h2>
          <p className="mt-1 text-sm text-slate-600">
            {latestRun ? `${statusLabels[latestRun.status] ?? latestRun.status} · ${latestRun.message || latestRun.errorMessage || "无消息"}` : "暂无运行日志。"}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition group-open:rotate-180">⌄</span>
      </summary>

      {runs.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">暂无运行日志。</p>
      ) : (
        <div className="mt-5 space-y-3">
          {runs.map((run) => (
            <article key={run.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[run.status] ?? "bg-slate-200 text-slate-700"}`}>
                      {statusLabels[run.status] ?? run.status}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">
                      {triggerLabels[run.trigger] ?? run.trigger}
                    </span>
                    {run.dateKey ? <span className="text-xs text-slate-500">{run.dateKey} · {run.since ?? "daily"}</span> : null}
                  </div>
                  <p className="text-sm text-slate-700">{run.errorMessage || run.message || "无消息"}</p>
                  {isPossiblyTimedOut(run) ? <p className="text-xs text-amber-700">该任务运行已超过 30 分钟，可能已超时。</p> : null}
                </div>
                <div className="grid grid-cols-3 gap-3 text-right text-xs text-slate-500 sm:min-w-72">
                  <div>
                    <p className="font-medium text-slate-900">{run.repoCount}</p>
                    <p>仓库</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{run.snapshotCount}</p>
                    <p>快照</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{formatDuration(run.durationMs)}</p>
                    <p>耗时</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">开始：{new Date(run.startedAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </details>
  );
}
