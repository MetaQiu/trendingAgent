type RepoCardProps = {
  repo: {
    rank: number;
    repoFullName: string;
    url: string;
    description: string | null;
    language: string | null;
    languageColor: string | null;
    stars: number;
    forks: number;
    starsToday: number;
    summary?: string | null;
    readmeSummary?: string | null;
    recommendationReason?: string | null;
  };
};

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-blue-600">#{repo.rank}</p>
            <a className="mt-1 block text-2xl font-bold tracking-tight text-slate-950 hover:text-blue-600" href={repo.url} target="_blank" rel="noreferrer">
              {repo.repoFullName}
            </a>
            <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">{repo.summary || repo.description || "暂无描述"}</p>
          </div>

          <div className="grid w-full grid-cols-3 gap-2 sm:max-w-md lg:w-[300px] lg:shrink-0">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 px-3 py-3 text-center shadow-sm">
              <p className="text-base font-semibold text-slate-950">★</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{repo.stars.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">Stars</p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 px-3 py-3 text-center shadow-sm">
              <p className="text-base font-semibold text-indigo-700">⑂</p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{repo.forks.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-slate-500">Forks</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-100 px-3 py-3 text-center shadow-sm">
              <p className="text-base font-bold text-emerald-700">+{repo.starsToday.toLocaleString()}</p>
              <p className="mt-1 whitespace-nowrap text-[13px] font-semibold text-emerald-900">今日新增</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-emerald-600">Stars</p>
            </div>
          </div>
        </div>

        {repo.readmeSummary ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-900">
            <p className="font-semibold">README 精读</p>
            <p className="mt-2 leading-7">{repo.readmeSummary}</p>
          </div>
        ) : null}
        {repo.recommendationReason ? <p className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-7 text-amber-800">{repo.recommendationReason}</p> : null}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
        {repo.languageColor ? <span className="h-3 w-3 rounded-full" style={{ backgroundColor: repo.languageColor }} /> : null}
        <span>{repo.language || "Unknown"}</span>
      </div>
    </article>
  );
}
