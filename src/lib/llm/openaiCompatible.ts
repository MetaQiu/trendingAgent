import { buildDailyTrendingSummaryPrompt, buildRepoReadmeSummaryPrompt, buildTrendingSummaryPrompt } from "@/lib/agent/prompts";
import { dailyTrendingSummarySchema, repoReadmeSummarySchema, trendingSummarySchema } from "@/lib/agent/schemas";
import type { DailyTrendingSummary, RepoReadmeSummary, TrendingRepoItem, TrendingSummary } from "@/types/trending";

async function createJsonCompletion(prompt: string, maxTokens: number) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey || !baseUrl || !model) {
    throw new Error("缺少 OpenAI-compatible 配置：OPENAI_API_KEY、OPENAI_BASE_URL 或 OPENAI_MODEL");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "你是严谨的中英文双语技术趋势分析师。只输出 JSON。" },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI-compatible 请求失败：${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI-compatible 未返回文本内容");
  }

  return JSON.parse(content);
}

export async function summarizeWithOpenAICompatible(repos: TrendingRepoItem[], dateKey: string): Promise<TrendingSummary> {
  return trendingSummarySchema.parse(await createJsonCompletion(buildTrendingSummaryPrompt(repos, dateKey), 6000));
}

export async function summarizeRepoReadmeWithOpenAICompatible({
  repo,
  readmeText,
  dateKey,
}: {
  repo: TrendingRepoItem;
  readmeText: string | null;
  dateKey: string;
}): Promise<RepoReadmeSummary> {
  return repoReadmeSummarySchema.parse(await createJsonCompletion(buildRepoReadmeSummaryPrompt({ repo, readmeText, dateKey }), 1800));
}

export async function summarizeDailyTrendingWithOpenAICompatible({
  repos,
  repoSummaries,
  dateKey,
}: {
  repos: TrendingRepoItem[];
  repoSummaries: RepoReadmeSummary[];
  dateKey: string;
}): Promise<DailyTrendingSummary> {
  return dailyTrendingSummarySchema.parse(await createJsonCompletion(buildDailyTrendingSummaryPrompt({ repos, repoSummaries, dateKey }), 4000));
}
