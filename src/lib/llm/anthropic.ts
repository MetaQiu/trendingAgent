import Anthropic from "@anthropic-ai/sdk";
import { buildTrendingSummaryPrompt } from "@/lib/agent/prompts";
import { trendingSummaryJsonSchema, trendingSummarySchema } from "@/lib/agent/schemas";
import type { TrendingRepoItem, TrendingSummary } from "@/types/trending";

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

export async function summarizeWithAnthropic(repos: TrendingRepoItem[], dateKey: string): Promise<TrendingSummary> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("缺少 ANTHROPIC_API_KEY 环境变量");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-6",
      max_tokens: 6000,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "high",
        format: {
          type: "json_schema",
          schema: trendingSummaryJsonSchema,
        },
      },
      system: "你是严谨的中文技术趋势分析师。只输出符合 schema 的 JSON。",
      messages: [{ role: "user", content: buildTrendingSummaryPrompt(repos, dateKey) }],
    });

    const text = response.content.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Anthropic 未返回文本内容");
    }

    return trendingSummarySchema.parse(JSON.parse(text));
  } catch (error) {
    throw extractAnthropicError(error);
  }
}
