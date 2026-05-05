import { z } from "zod";

export const trendingSummarySchema = z.object({
  dailySummary: z.string(),
  trendInsights: z.array(z.string()),
  topRecommendations: z.array(
    z.object({
      repoFullName: z.string(),
      reason: z.string(),
    }),
  ),
  repoSummaries: z.array(
    z.object({
      repoFullName: z.string(),
      summary: z.string(),
      tags: z.array(z.string()),
    }),
  ),
});

export const trendingSummaryJsonSchema = {
  type: "object",
  properties: {
    dailySummary: { type: "string" },
    trendInsights: { type: "array", items: { type: "string" } },
    topRecommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          repoFullName: { type: "string" },
          reason: { type: "string" },
        },
        required: ["repoFullName", "reason"],
        additionalProperties: false,
      },
    },
    repoSummaries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          repoFullName: { type: "string" },
          summary: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["repoFullName", "summary", "tags"],
        additionalProperties: false,
      },
    },
  },
  required: ["dailySummary", "trendInsights", "topRecommendations", "repoSummaries"],
  additionalProperties: false,
} as const;
