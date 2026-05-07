type TrendingTableProps = {
  repos: Array<{
    rank: number;
    repoFullName: string;
    language: string | null;
    stars: number;
    forks: number;
    starsToday: number;
  }>;
};

export function TrendingTable({ repos }: TrendingTableProps) {
  return (
    <div className="lp-card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-[0.16em] lp-muted">
          <tr>
            <th className="p-4">排名</th>
            <th className="p-4">仓库</th>
            <th className="p-4">语言</th>
            <th className="p-4">总 Stars</th>
            <th className="p-4">Forks</th>
            <th className="p-4">今日 Stars</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {repos.map((repo) => (
            <tr key={repo.repoFullName} className="transition hover:bg-[var(--chip-bg)]">
              <td className="p-4 font-mono font-semibold lp-muted">#{repo.rank}</td>
              <td className="p-4 font-semibold lp-ink">{repo.repoFullName}</td>
              <td className="p-4 lp-muted">{repo.language || "Unknown"}</td>
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
