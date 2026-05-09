import { messages, type Locale } from "@/lib/i18n";

type TrendingTableProps = {
  repos: Array<{
    rank: number;
    repoFullName: string;
    language: string | null;
    stars: number;
    forks: number;
    starsToday: number;
  }>;
  locale?: Locale;
};

export function TrendingTable({ repos, locale = "zh" }: TrendingTableProps) {
  const t = messages[locale].table;
  return (
    <div className="lp-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.16em] lp-muted">
          <tr>
            <th className="p-4">{t.rank}</th>
            <th className="p-4">{t.repo}</th>
            <th className="p-4">{t.language}</th>
            <th className="p-4">{t.totalStars}</th>
            <th className="p-4">{t.forks}</th>
            <th className="p-4">{t.starsToday}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {repos.map((repo) => (
            <tr key={repo.repoFullName} className="transition hover:bg-[var(--chip-bg)]">
              <td className="p-4 font-mono font-semibold lp-muted">#{repo.rank}</td>
              <td className="p-4 font-semibold lp-ink">{repo.repoFullName}</td>
              <td className="p-4 lp-muted">{repo.language || t.unknown}</td>
              <td className="p-4 font-mono lp-ink">{repo.stars.toLocaleString()}</td>
              <td className="p-4 font-mono lp-ink">{repo.forks.toLocaleString()}</td>
              <td className="p-4 font-mono font-semibold text-[var(--positive)]">+{repo.starsToday}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
