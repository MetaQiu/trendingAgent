import { z } from "zod";

export const dailyTrendingSummarySchema = z.object({
  dailySummary: z.string(),
  trendInsights: z.array(z.string()),
  topRecommendations: z.array(
    z.object({
      repoFullName: z.string(),
      reason: z.string(),
    }),
  ),
});

export const repoReadmeSummarySchema = z.object({
  repoFullName: z.string(),
  summary: z.string(),
  readmeSummary: z.string(),
  recommendationReason: z.string().nullable(),
  tags: z.array(z.string()),
});

export const trendingSummarySchema = dailyTrendingSummarySchema.extend({
  repoSummaries: z.array(
    z.object({
      repoFullName: z.string(),
      summary: z.string(),
      tags: z.array(z.string()),
    }),
  ),
});

export const dailyTrendingSummaryJsonSchema = {
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
  },
  required: ["dailySummary", "trendInsights", "topRecommendations"],
  additionalProperties: false,
} as const;

export const repoReadmeSummaryJsonSchema = {
  type: "object",
  properties: {
    repoFullName: { type: "string" },
    summary: { type: "string" },
    readmeSummary: { type: "string" },
    recommendationReason: { anyOf: [{ type: "string" }, { type: "null" }] },
    tags: { type: "array", items: { type: "string" } },
  },
  required: ["repoFullName", "summary", "readmeSummary", "recommendationReason", "tags"],
  additionalProperties: false,
} as const;

export const trendingSummaryJsonSchema = {
  type: "object",
  properties: {
    ...dailyTrendingSummaryJsonSchema.properties,
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
