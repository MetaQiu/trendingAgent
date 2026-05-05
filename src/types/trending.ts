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

export type RepoReadmeSummary = {
  repoFullName: string;
  summary: string;
  readmeSummary: string;
  recommendationReason: string | null;
  tags: string[];
};

export type RepoReadmeSummaryResult = {
  summary: RepoReadmeSummary;
  provider: string;
  fallback: boolean;
  error?: string;
  readmeFetched: boolean;
  readmeLength: number;
  durationMs: number;
};

export type TopRecommendation = {
  repoFullName: string;
  reason: string;
};

export type DailyTrendingSummary = {
  dailySummary: string;
  trendInsights: string[];
  topRecommendations: TopRecommendation[];
};

export type TrendingSummary = DailyTrendingSummary & {
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
