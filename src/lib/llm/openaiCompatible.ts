import { buildTrendingSummaryPrompt } from "@/lib/agent/prompts";
import { trendingSummarySchema } from "@/lib/agent/schemas";
import type { TrendingRepoItem, TrendingSummary } from "@/types/trending";

export async function summarizeWithOpenAICompatible(repos: TrendingRepoItem[], dateKey: string): Promise<TrendingSummary> {
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
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "你是严谨的中文技术趋势分析师。只输出 JSON。" },
        { role: "user", content: buildTrendingSummaryPrompt(repos, dateKey) },
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

  return trendingSummarySchema.parse(JSON.parse(content));
}
