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
  summaryEn: string;
  tags: string[];
  tagsEn: string[];
};

export type RepoReadmeSummary = {
  repoFullName: string;
  summary: string;
  summaryEn: string;
  readmeSummary: string;
  readmeSummaryEn: string;
  recommendationReason: string | null;
  recommendationReasonEn: string | null;
  tags: string[];
  tagsEn: string[];
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
  dailySummaryEn: string;
  trendInsights: string[];
  trendInsightsEn: string[];
  topRecommendations: TopRecommendation[];
  topRecommendationsEn: TopRecommendation[];
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
