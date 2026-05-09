import type { DailyTrendingSummary, RepoReadmeSummary, TrendingRepoItem, TrendingSummary } from "@/types/trending";
import { summarizeDailyTrendingWithAnthropic, summarizeRepoReadmeWithAnthropic, summarizeWithAnthropic } from "./anthropic";
import { summarizeDailyTrendingWithOpenAICompatible, summarizeRepoReadmeWithOpenAICompatible, summarizeWithOpenAICompatible } from "./openaiCompatible";

export type LlmResult = {
  summary: TrendingSummary;
  provider: string;
  fallback: boolean;
  error?: string;
};

export type DailyLlmResult = {
  summary: DailyTrendingSummary;
  provider: string;
  fallback: boolean;
  error?: string;
};

export type RepoReadmeLlmResult = {
  summary: RepoReadmeSummary;
  provider: string;
  fallback: boolean;
  error?: string;
};

function normalizeTags(tags: string[], repo: TrendingRepoItem, locale: "zh" | "en") {
  const normalized = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 6);
  if (normalized.length > 0) {
    return normalized;
  }
  return [repo.language, repo.starsToday > 0 ? (locale === "en" ? "Trending today" : "今日热门") : null].filter(Boolean) as string[];
}

function normalizeRepoSummary(summary: RepoReadmeSummary, repo: TrendingRepoItem): RepoReadmeSummary {
  if (summary.repoFullName !== repo.repoFullName) {
    throw new Error(`LLM 返回 repoFullName 不匹配：${summary.repoFullName}`);
  }

  return {
    repoFullName: summary.repoFullName,
    summary: summary.summary.trim() || repo.description || "该仓库描述信息有限，暂无法做进一步总结。",
    summaryEn: summary.summaryEn.trim() || repo.description || "Limited repository metadata is available, so no deeper summary can be provided.",
    readmeSummary: summary.readmeSummary.trim() || "README 总结为空，建议打开仓库查看详细说明。",
    readmeSummaryEn: summary.readmeSummaryEn.trim() || "The README summary is empty. Open the repository for details.",
    recommendationReason: summary.recommendationReason?.trim() || null,
    recommendationReasonEn: summary.recommendationReasonEn?.trim() || null,
    tags: normalizeTags(summary.tags, repo, "zh"),
    tagsEn: normalizeTags(summary.tagsEn, repo, "en"),
  };
}

function normalizeDailySummary(summary: DailyTrendingSummary, repos: TrendingRepoItem[]): DailyTrendingSummary {
  const fallback = buildFallbackDailySummary(repos);
  return {
    dailySummary: summary.dailySummary.trim() || fallback.dailySummary,
    dailySummaryEn: summary.dailySummaryEn.trim() || fallback.dailySummaryEn,
    trendInsights: summary.trendInsights.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    trendInsightsEn: summary.trendInsightsEn.map((item) => item.trim()).filter(Boolean).slice(0, 5),
    topRecommendations: summary.topRecommendations.filter((item) => item.repoFullName && item.reason).slice(0, 5),
    topRecommendationsEn: summary.topRecommendationsEn.filter((item) => item.repoFullName && item.reason).slice(0, 5),
  };
}

export async function summarizeWithConfiguredLLM(repos: TrendingRepoItem[], dateKey: string): Promise<LlmResult> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  try {
    const summary = provider === "openai-compatible"
      ? await summarizeWithOpenAICompatible(repos, dateKey)
      : await summarizeWithAnthropic(repos, dateKey);

    return {
      summary: {
        ...normalizeDailySummary(summary, repos),
        repoSummaries: summary.repoSummaries.map((item) => ({
          repoFullName: item.repoFullName,
          summary: item.summary.trim(),
          summaryEn: item.summaryEn.trim(),
          tags: item.tags.map((tag) => tag.trim()).filter(Boolean),
          tagsEn: item.tagsEn.map((tag) => tag.trim()).filter(Boolean),
        })),
      },
      provider: provider === "openai-compatible" ? provider : "anthropic",
      fallback: false,
    };
  } catch (error) {
    return {
      summary: buildFallbackSummary(repos),
      provider,
      fallback: true,
      error: error instanceof Error ? error.message : "未知 LLM 错误",
    };
  }
}

export async function summarizeRepoReadmeWithConfiguredLLM({
  repo,
  readmeText,
  dateKey,
}: {
  repo: TrendingRepoItem;
  readmeText: string | null;
  dateKey: string;
}): Promise<RepoReadmeLlmResult> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  try {
    const summary =
      provider === "openai-compatible"
        ? await summarizeRepoReadmeWithOpenAICompatible({ repo, readmeText, dateKey })
        : await summarizeRepoReadmeWithAnthropic({ repo, readmeText, dateKey });

    return {
      summary: normalizeRepoSummary(summary, repo),
      provider: provider === "openai-compatible" ? provider : "anthropic",
      fallback: false,
    };
  } catch (error) {
    return {
      summary: buildFallbackRepoReadmeSummary(repo, Boolean(readmeText)),
      provider,
      fallback: true,
      error: error instanceof Error ? error.message : "未知单仓库 LLM 错误",
    };
  }
}

export async function summarizeDailyTrendingWithConfiguredLLM({
  repos,
  repoSummaries,
  dateKey,
}: {
  repos: TrendingRepoItem[];
  repoSummaries: RepoReadmeSummary[];
  dateKey: string;
}): Promise<DailyLlmResult> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  try {
    const summary =
      provider === "openai-compatible"
        ? await summarizeDailyTrendingWithOpenAICompatible({ repos, repoSummaries, dateKey })
        : await summarizeDailyTrendingWithAnthropic({ repos, repoSummaries, dateKey });

    return {
      summary: normalizeDailySummary(summary, repos),
      provider: provider === "openai-compatible" ? provider : "anthropic",
      fallback: false,
    };
  } catch (error) {
    return {
      summary: buildFallbackDailySummary(repos),
      provider,
      fallback: true,
      error: error instanceof Error ? error.message : "未知日报 LLM 错误",
    };
  }
}

export function buildFallbackRepoReadmeSummary(repo: TrendingRepoItem, readmeFetched: boolean): RepoReadmeSummary {
  return {
    repoFullName: repo.repoFullName,
    summary: repo.description || "该仓库描述信息有限，暂无法做进一步总结。",
    summaryEn: repo.description || "Limited repository metadata is available, so no deeper summary can be provided.",
    readmeSummary: readmeFetched
      ? "README 已抓取，但 LLM 总结暂不可用，建议打开仓库查看详细说明。"
      : "未能获取 README，以下仅基于 Trending 列表字段保守判断。",
    readmeSummaryEn: readmeFetched
      ? "The README was fetched, but the LLM summary is currently unavailable. Open the repository for details."
      : "The README could not be fetched. This is a conservative assessment based only on GitHub Trending fields.",
    recommendationReason: `今日新增 ${repo.starsToday} stars，排名第 ${repo.rank}。${repo.description || "描述信息有限，建议结合 README 进一步判断。"}`,
    recommendationReasonEn: `It gained ${repo.starsToday} stars today and ranks #${repo.rank}. ${repo.description || "The description is limited, so check the README before making a deeper assessment."}`,
    tags: normalizeTags([], repo, "zh"),
    tagsEn: normalizeTags([], repo, "en"),
  };
}

export function buildFallbackDailySummary(repos: TrendingRepoItem[]): DailyTrendingSummary {
  const topByStarsToday = [...repos].sort((a, b) => b.starsToday - a.starsToday).slice(0, 5);
  const languages = [...new Set(repos.map((repo) => repo.language).filter(Boolean))];
  const totalStarsToday = repos.reduce((sum, repo) => sum + repo.starsToday, 0);

  return {
    dailySummary: `今日共抓取 ${repos.length} 个 GitHub Trending 项目。LLM 日报总结暂不可用，以下为基于仓库描述、语言和 star 数据生成的规则摘要。主要语言包括：${languages.slice(0, 5).join("、") || "暂无明确语言"}。`,
    dailySummaryEn: `Fetched ${repos.length} GitHub Trending repositories today. The LLM daily brief is currently unavailable, so this is a rule-based summary from descriptions, languages, and star data. Main languages include: ${languages.slice(0, 5).join(", ") || "no clear language data"}.`,
    trendInsights: [
      `今日新增 stars 总数为 ${totalStarsToday}。`,
      `新增 stars 最高项目是 ${topByStarsToday[0]?.repoFullName || "暂无"}。`,
      "该摘要未调用模型推断，仅展示抓取字段中的可见趋势。",
    ],
    trendInsightsEn: [
      `Total new stars today: ${totalStarsToday}.`,
      `The repository with the most new stars is ${topByStarsToday[0]?.repoFullName || "N/A"}.`,
      "This summary does not infer with a model; it only shows visible trends from fetched fields.",
    ],
    topRecommendations: topByStarsToday.map((repo) => ({
      repoFullName: repo.repoFullName,
      reason: `今日新增 ${repo.starsToday} stars，排名第 ${repo.rank}。${repo.description || "描述信息有限，建议结合 README 进一步判断。"}`,
    })),
    topRecommendationsEn: topByStarsToday.map((repo) => ({
      repoFullName: repo.repoFullName,
      reason: `It gained ${repo.starsToday} stars today and ranks #${repo.rank}. ${repo.description || "The description is limited, so check the README before making a deeper assessment."}`,
    })),
  };
}

export function buildFallbackSummary(repos: TrendingRepoItem[]): TrendingSummary {
  const daily = buildFallbackDailySummary(repos);

  return {
    ...daily,
    repoSummaries: repos.map((repo) => ({
      repoFullName: repo.repoFullName,
      summary: repo.description || "该仓库描述信息有限，暂无法做进一步总结。",
      summaryEn: repo.description || "Limited repository metadata is available, so no deeper summary can be provided.",
      tags: normalizeTags([], repo, "zh"),
      tagsEn: normalizeTags([], repo, "en"),
    })),
  };
}
