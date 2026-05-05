import type { TrendingRepoItem, TrendingSummary } from "@/types/trending";
import { summarizeWithAnthropic } from "./anthropic";
import { summarizeWithOpenAICompatible } from "./openaiCompatible";

export type LlmResult = {
  summary: TrendingSummary;
  provider: string;
  fallback: boolean;
  error?: string;
};

export async function summarizeWithConfiguredLLM(repos: TrendingRepoItem[], dateKey: string): Promise<LlmResult> {
  const provider = process.env.LLM_PROVIDER || "anthropic";

  try {
    if (provider === "openai-compatible") {
      return {
        summary: await summarizeWithOpenAICompatible(repos, dateKey),
        provider,
        fallback: false,
      };
    }

    return {
      summary: await summarizeWithAnthropic(repos, dateKey),
      provider: "anthropic",
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

export function buildFallbackSummary(repos: TrendingRepoItem[]): TrendingSummary {
  const topByStarsToday = [...repos].sort((a, b) => b.starsToday - a.starsToday).slice(0, 5);
  const languages = [...new Set(repos.map((repo) => repo.language).filter(Boolean))];

  return {
    dailySummary: `今日共抓取 ${repos.length} 个 GitHub Trending 项目。LLM 总结暂不可用，以下为基于仓库描述、语言和 star 数据生成的规则摘要。主要语言包括：${languages.slice(0, 5).join("、") || "暂无明确语言"}。`,
    trendInsights: [
      `今日新增 stars 总数为 ${repos.reduce((sum, repo) => sum + repo.starsToday, 0)}。`,
      `新增 stars 最高项目是 ${topByStarsToday[0]?.repoFullName || "暂无"}。`,
      "该摘要未调用模型推断，仅展示抓取字段中的可见趋势。",
    ],
    topRecommendations: topByStarsToday.map((repo) => ({
      repoFullName: repo.repoFullName,
      reason: `今日新增 ${repo.starsToday} stars，排名第 ${repo.rank}。${repo.description || "描述信息有限，建议结合 README 进一步判断。"}`,
    })),
    repoSummaries: repos.map((repo) => ({
      repoFullName: repo.repoFullName,
      summary: repo.description || "该仓库描述信息有限，暂无法做进一步总结。",
      tags: [repo.language, repo.starsToday > 0 ? "今日热门" : null].filter(Boolean) as string[],
    })),
  };
}
