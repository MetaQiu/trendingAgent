import { getRepoAnchorId } from "@/lib/repoAnchor";

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

function StatPill({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "accent" | "positive" }) {
  const toneClass = tone === "positive"
    ? "text-[var(--positive)]"
    : tone === "accent"
      ? "text-[var(--accent)]"
      : "text-[var(--ink)]";

  return (
    <div className="lp-chip px-3 py-2 text-right font-variant-numeric tabular-nums">
      <p className={`font-mono text-sm font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] lp-muted">{label}</p>
    </div>
  );
}

export function RepoCard({ repo }: RepoCardProps) {
  return (
    <article id={getRepoAnchorId(repo.repoFullName)} className="lp-card scroll-mt-8 overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-[var(--accent)]">
      <div className="grid gap-5 lg:grid-cols-[44px_1fr_auto] lg:items-start">
        <p className="font-mono text-sm font-semibold lp-muted">#{repo.rank}</p>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {repo.languageColor ? <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: repo.languageColor }} /> : null}
            <a className="truncate text-xl font-bold tracking-tight lp-ink hover:text-[var(--accent)]" href={repo.url} target="_blank" rel="noreferrer">
              {repo.repoFullName}
            </a>
          </div>
          <p className="mt-3 max-w-4xl text-base leading-7 lp-muted">{repo.summary || repo.description || "暂无描述"}</p>
        </div>

        <div className="grid min-w-0 grid-cols-3 gap-2 sm:min-w-[310px]">
          <StatPill label="Stars" value={repo.stars.toLocaleString()} />
          <StatPill label="Forks" value={repo.forks.toLocaleString()} tone="accent" />
          <StatPill label="Today" value={`+${repo.starsToday.toLocaleString()}`} tone="positive" />
        </div>
      </div>

      {(repo.readmeSummary || repo.recommendationReason) ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          {repo.readmeSummary ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--chip-bg)] p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">README 精读</p>
              <p className="mt-2 leading-7 lp-ink">{repo.readmeSummary}</p>
            </div>
          ) : null}
          {repo.recommendationReason ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">推荐理由</p>
              <p className="mt-2 leading-7 lp-ink">{repo.recommendationReason}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-2 border-t border-[var(--border)] pt-4 text-sm lp-muted">
        {repo.languageColor ? <span className="h-3 w-3 rounded-full" style={{ backgroundColor: repo.languageColor }} /> : null}
        <span>{repo.language || "Unknown"}</span>
      </div>
    </article>
  );
}
