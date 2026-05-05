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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="p-3">排名</th>
            <th className="p-3">仓库</th>
            <th className="p-3">语言</th>
            <th className="p-3">总 Stars</th>
            <th className="p-3">Forks</th>
            <th className="p-3">今日 Stars</th>
          </tr>
        </thead>
        <tbody>
          {repos.map((repo) => (
            <tr key={repo.repoFullName} className="border-t border-slate-100">
              <td className="p-3">#{repo.rank}</td>
              <td className="p-3 font-medium">{repo.repoFullName}</td>
              <td className="p-3">{repo.language || "Unknown"}</td>
              <td className="p-3">{repo.stars.toLocaleString()}</td>
              <td className="p-3">{repo.forks.toLocaleString()}</td>
              <td className="p-3 text-green-700">+{repo.starsToday}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
