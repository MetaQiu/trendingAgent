import Anthropic from "@anthropic-ai/sdk";
import { buildDailyTrendingSummaryPrompt, buildRepoReadmeSummaryPrompt, buildTrendingSummaryPrompt } from "@/lib/agent/prompts";
import {
  dailyTrendingSummaryJsonSchema,
  dailyTrendingSummarySchema,
  repoReadmeSummaryJsonSchema,
  repoReadmeSummarySchema,
  trendingSummaryJsonSchema,
  trendingSummarySchema,
} from "@/lib/agent/schemas";
import type { DailyTrendingSummary, RepoReadmeSummary, TrendingRepoItem, TrendingSummary } from "@/types/trending";

function extractAnthropicError(error: unknown): Error {
  if (error instanceof Anthropic.AuthenticationError) {
    return new Error("Anthropic 认证失败，请检查 ANTHROPIC_API_KEY");
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new Error("Anthropic 触发限流，请稍后重试");
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return new Error("Anthropic API key 权限不足");
  }
  if (error instanceof Anthropic.NotFoundError) {
    return new Error("Anthropic 模型或端点不存在，请检查 ANTHROPIC_MODEL");
  }
  if (error instanceof Anthropic.APIError) {
    return new Error(`Anthropic API 错误 ${error.status ?? "unknown"}：${error.message}`);
  }
  return error instanceof Error ? error : new Error("未知 Anthropic 错误");
}

function createClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("缺少 ANTHROPIC_API_KEY 环境变量");
  }

  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function createStructuredJson<T>({
  prompt,
  schema,
  maxTokens,
}: {
  prompt: string;
  schema: Record<string, unknown>;
  maxTokens: number;
}): Promise<T> {
  const client = createClient();

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-6",
      max_tokens: maxTokens,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema,
        },
      },
      system: "你是严谨的中文技术趋势分析师。只输出符合 schema 的 JSON。",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Anthropic 未返回文本内容");
    }

    return JSON.parse(text) as T;
  } catch (error) {
    throw extractAnthropicError(error);
  }
}

export async function summarizeWithAnthropic(repos: TrendingRepoItem[], dateKey: string): Promise<TrendingSummary> {
  const data = await createStructuredJson<unknown>({
    prompt: buildTrendingSummaryPrompt(repos, dateKey),
    schema: trendingSummaryJsonSchema,
    maxTokens: 6000,
  });

  return trendingSummarySchema.parse(data);
}

export async function summarizeRepoReadmeWithAnthropic({
  repo,
  readmeText,
  dateKey,
}: {
  repo: TrendingRepoItem;
  readmeText: string | null;
  dateKey: string;
}): Promise<RepoReadmeSummary> {
  const data = await createStructuredJson<unknown>({
    prompt: buildRepoReadmeSummaryPrompt({ repo, readmeText, dateKey }),
    schema: repoReadmeSummaryJsonSchema,
    maxTokens: 1200,
  });

  return repoReadmeSummarySchema.parse(data);
}

export async function summarizeDailyTrendingWithAnthropic({
  repos,
  repoSummaries,
  dateKey,
}: {
  repos: TrendingRepoItem[];
  repoSummaries: RepoReadmeSummary[];
  dateKey: string;
}): Promise<DailyTrendingSummary> {
  const data = await createStructuredJson<unknown>({
    prompt: buildDailyTrendingSummaryPrompt({ repos, repoSummaries, dateKey }),
    schema: dailyTrendingSummaryJsonSchema,
    maxTokens: 2500,
  });

  return dailyTrendingSummarySchema.parse(data);
}
