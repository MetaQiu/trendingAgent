type TopRepositoriesLeaderboardProps = {
  repos: Array<{
    rank: number;
    repoFullName: string;
    url: string;
    language: string | null;
    languageColor: string | null;
    stars: number;
    forks: number;
    starsToday: number;
    summary?: string | null;
    description: string | null;
  }>;
};

export function TopRepositoriesLeaderboard({ repos }: TopRepositoriesLeaderboardProps) {
  const topRepos = repos.slice(0, 10);

  return (
    <section className="lp-card p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="lp-eyebrow">Leaderboard</p>
          <h2 className="mt-2 text-xl font-semibold lp-ink">Top 10 repositories</h2>
          <p className="mt-1 text-sm lp-muted">按 GitHub Trending 今日排名展示，快速查看热度、语言和新增 Stars。</p>
        </div>
        <span className="lp-chip px-4 py-2 text-sm font-semibold">{repos.length} repos</span>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {topRepos.map((repo) => (
          <a
            key={repo.repoFullName}
            className="grid grid-cols-[42px_14px_1fr_auto] items-center gap-3 rounded-xl px-1 py-3 transition hover:bg-[var(--chip-bg)] sm:grid-cols-[42px_14px_1fr_120px_92px_92px]"
            href={repo.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="font-mono text-sm font-semibold lp-muted">#{repo.rank}</span>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: repo.languageColor || "var(--accent)" }} />
            <span className="min-w-0">
              <span className="block truncate font-semibold lp-ink">{repo.repoFullName}</span>
              <span className="mt-0.5 line-clamp-1 block text-xs lp-muted">{repo.summary || repo.description || "暂无描述"}</span>
            </span>
            <span className="hidden text-sm font-medium lp-muted sm:block">{repo.language || "Unknown"}</span>
            <span className="text-right font-mono text-sm font-semibold text-[var(--positive)]">+{repo.starsToday.toLocaleString()}</span>
            <span className="hidden text-right font-mono text-sm lp-ink sm:block">{repo.stars.toLocaleString()}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
