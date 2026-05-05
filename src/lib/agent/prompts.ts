import type { RepoReadmeSummary, TrendingRepoItem } from "@/types/trending";

export function buildTrendingSummaryPrompt(repos: TrendingRepoItem[], dateKey: string): string {
  return buildDailyTrendingSummaryPrompt({ repos, repoSummaries: [], dateKey });
}

export function buildRepoReadmeSummaryPrompt({
  repo,
  readmeText,
  dateKey,
}: {
  repo: TrendingRepoItem;
  readmeText: string | null;
  dateKey: string;
}): string {
  return `你是面向开发者和技术观察者的 GitHub Trending 中文分析助手。请只总结当前这一个仓库，不要总结其它项目；只基于输入字段和 README 内容进行保守总结，不要臆测未出现的信息。

日期：${dateKey}
仓库基础字段：
${JSON.stringify(repo, null, 2)}

README：
${readmeText || "未抓取到 README。"}

请只输出结构化 JSON：
- repoFullName：必须严格等于输入仓库的 repoFullName。
- summary：一句话中文定位，用于卡片简介。
- readmeSummary：README 精读总结，2 到 4 句，说明项目做什么、核心能力、适合谁关注。README 缺失时，请明确说明未抓取到 README，并仅基于 Trending 字段保守判断。
- recommendationReason：该仓库为什么值得关注；信息不足时可为 null。
- tags：3 到 6 个中文或英文短标签。

约束：repoFullName 必须来自输入；不要输出 Markdown；不要夸大 stars、生态成熟度或生产可用性。`;
}

export function buildDailyTrendingSummaryPrompt({
  repos,
  repoSummaries,
  dateKey,
}: {
  repos: TrendingRepoItem[];
  repoSummaries: RepoReadmeSummary[];
  dateKey: string;
}): string {
  return `你是面向开发者和技术观察者的 GitHub Trending 中文分析助手。请基于 Trending 基础字段和已经完成的逐仓库 README 精读结果，生成今日整体日报。不要覆盖或重写单仓库字段。

日期：${dateKey}
仓库基础字段：
${JSON.stringify(repos, null, 2)}

逐仓库精读结果：
${JSON.stringify(repoSummaries, null, 2)}

请只输出结构化 JSON：
- dailySummary：一段中文总览，概括今日技术方向和亮点。
- trendInsights：3 到 5 条中文趋势洞察。
- topRecommendations：推荐 3 到 5 个值得关注项目，repoFullName 必须来自输入，reason 基于基础字段或逐仓库精读结果。

如果信息不足，请明确保持保守表述。`;
}
