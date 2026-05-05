import type { TrendingMetrics, TrendingRepoItem } from "@/types/trending";

export function computeMetrics(repos: TrendingRepoItem[]): TrendingMetrics {
  const languageMap = new Map<string, { count: number; starsToday: number }>();

  for (const repo of repos) {
    const language = repo.language || "Unknown";
    const current = languageMap.get(language) || { count: 0, starsToday: 0 };
    languageMap.set(language, {
      count: current.count + 1,
      starsToday: current.starsToday + repo.starsToday,
    });
  }

  const languageDistribution = [...languageMap.entries()]
    .map(([language, stats]) => ({ language, ...stats }))
    .sort((a, b) => b.count - a.count || b.starsToday - a.starsToday);

  const starsTodayTop = [...repos]
    .sort((a, b) => b.starsToday - a.starsToday)
    .slice(0, 10)
    .map((repo) => ({ repoFullName: repo.repoFullName, starsToday: repo.starsToday }));

  const totalStarsTop = [...repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10)
    .map((repo) => ({ repoFullName: repo.repoFullName, stars: repo.stars }));

  return {
    repoCount: repos.length,
    totalStarsToday: repos.reduce((sum, repo) => sum + repo.starsToday, 0),
    hottestLanguage: languageDistribution[0]?.language ?? null,
    highestStarsTodayRepo: starsTodayTop[0]?.repoFullName ?? null,
    languageDistribution,
    starsTodayTop,
    totalStarsTop,
  };
}
