import type { TrendingRepoItem } from "@/types/trending";

export function buildTrendingSummaryPrompt(repos: TrendingRepoItem[], dateKey: string): string {
  return `你是面向开发者和技术观察者的 GitHub Trending 中文分析助手。请只基于下面抓取到的字段进行保守总结，不要夸大事实，也不要臆测未出现的信息。

日期：${dateKey}
仓库数据：
${JSON.stringify(repos, null, 2)}

请输出结构化 JSON：
- dailySummary：一段中文总览，概括今日技术方向和亮点。
- trendInsights：3 到 5 条中文趋势洞察。
- topRecommendations：推荐 3 到 5 个值得关注项目，repoFullName 必须来自输入。
- repoSummaries：为每个仓库生成简短中文总结和标签，repoFullName 必须来自输入。

如果 description 信息不足，请明确保持保守表述。`;
}
