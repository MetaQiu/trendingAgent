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
  return `你是面向开发者和技术观察者的 GitHub Trending 中英文双语技术趋势分析助手。请只总结当前这一个仓库，不要总结其它项目；只基于输入字段和 README 内容进行保守总结，不要臆测未出现的信息。

日期：${dateKey}
仓库基础字段：
${JSON.stringify(repo, null, 2)}

README：
${readmeText || "未抓取到 README。"}

请只输出结构化 JSON，所有字段都是必需字段：
- repoFullName：必须严格等于输入仓库的 repoFullName。
- summary：一句话中文定位，用于卡片简介。
- summaryEn：one-sentence English positioning for the card.
- readmeSummary：中文 README 精读，2 到 4 句，说明项目做什么、核心能力、适合谁关注。README 缺失时，请明确说明未抓取到 README，并仅基于 Trending 字段保守判断。
- readmeSummaryEn：English README summary, 2 to 4 sentences, covering what it does, core capabilities, and who should care. If README is missing, say so explicitly and stay conservative.
- recommendationReason：中文推荐理由；信息不足时可为 null。
- recommendationReasonEn：English recommendation reason; nullable when information is insufficient.
- tags：3 到 6 个中文或通用技术短标签。
- tagsEn：3 to 6 English tags.

约束：中英文语义一致，但英文要自然，不要求逐字翻译；技术名词、项目名、框架名保持原文；repoFullName 必须来自输入；不要输出 Markdown；不要夸大 stars、生态成熟度或生产可用性。`;
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
  return `你是面向开发者和技术观察者的 GitHub Trending 中英文双语技术趋势分析助手。请基于 Trending 基础字段和已经完成的逐仓库 README 精读结果，生成今日整体日报。不要覆盖或重写单仓库字段。

日期：${dateKey}
仓库基础字段：
${JSON.stringify(repos, null, 2)}

逐仓库精读结果：
${JSON.stringify(repoSummaries, null, 2)}

请只输出结构化 JSON，所有字段都是必需字段：
- dailySummary：一段中文总览，概括今日技术方向和亮点。
- dailySummaryEn：An English overview summarizing today's technical directions and highlights.
- trendInsights：3 到 5 条中文趋势洞察。
- trendInsightsEn：3 to 5 English trend insights.
- topRecommendations：推荐 3 到 5 个值得关注项目，repoFullName 必须来自输入，reason 用中文表达并基于基础字段或逐仓库精读结果。
- topRecommendationsEn：English recommendation list. It can use the same repos as topRecommendations, but reason must be in natural English.

约束：推荐项目的 repoFullName 必须来自输入；聚合层只生成日报，不覆盖单仓库字段；中英文语义一致但不要求逐字翻译；如果信息不足，请明确保持保守表述；不要输出 Markdown。`;
}
