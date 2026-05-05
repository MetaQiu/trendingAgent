export type TrendingSince = "daily" | "weekly" | "monthly";

export type TrendingRepoItem = {
  rank: number;
  owner: string;
  name: string;
  repoFullName: string;
  url: string;
  description: string | null;
  language: string | null;
  languageColor: string | null;
  stars: number;
  forks: number;
  starsToday: number;
};

export type RepoSummary = {
  repoFullName: string;
  summary: string;
  tags: string[];
};

export type TopRecommendation = {
  repoFullName: string;
  reason: string;
};

export type TrendingSummary = {
  dailySummary: string;
  trendInsights: string[];
  topRecommendations: TopRecommendation[];
  repoSummaries: RepoSummary[];
};

export type TrendingMetrics = {
  repoCount: number;
  totalStarsToday: number;
  hottestLanguage: string | null;
  highestStarsTodayRepo: string | null;
  languageDistribution: Array<{
    language: string;
    count: number;
    starsToday: number;
  }>;
  starsTodayTop: Array<{
    repoFullName: string;
    starsToday: number;
  }>;
  totalStarsTop: Array<{
    repoFullName: string;
    stars: number;
  }>;
};
