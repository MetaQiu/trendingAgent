import { z } from "zod";

const topRecommendationSchema = z.object({
  repoFullName: z.string(),
  reason: z.string(),
});

const repoSummarySchema = z.object({
  repoFullName: z.string(),
  summary: z.string(),
  summaryEn: z.string(),
  tags: z.array(z.string()),
  tagsEn: z.array(z.string()),
});

export const dailyTrendingSummarySchema = z.object({
  dailySummary: z.string(),
  dailySummaryEn: z.string(),
  trendInsights: z.array(z.string()),
  trendInsightsEn: z.array(z.string()),
  topRecommendations: z.array(topRecommendationSchema),
  topRecommendationsEn: z.array(topRecommendationSchema),
});

export const repoReadmeSummarySchema = z.object({
  repoFullName: z.string(),
  summary: z.string(),
  summaryEn: z.string(),
  readmeSummary: z.string(),
  readmeSummaryEn: z.string(),
  recommendationReason: z.string().nullable(),
  recommendationReasonEn: z.string().nullable(),
  tags: z.array(z.string()),
  tagsEn: z.array(z.string()),
});

export const trendingSummarySchema = dailyTrendingSummarySchema.extend({
  repoSummaries: z.array(repoSummarySchema),
});

const topRecommendationJsonSchema = {
  type: "object",
  properties: {
    repoFullName: { type: "string" },
    reason: { type: "string" },
  },
  required: ["repoFullName", "reason"],
  additionalProperties: false,
} as const;

const repoSummaryJsonSchema = {
  type: "object",
  properties: {
    repoFullName: { type: "string" },
    summary: { type: "string" },
    summaryEn: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    tagsEn: { type: "array", items: { type: "string" } },
  },
  required: ["repoFullName", "summary", "summaryEn", "tags", "tagsEn"],
  additionalProperties: false,
} as const;

export const dailyTrendingSummaryJsonSchema = {
  type: "object",
  properties: {
    dailySummary: { type: "string" },
    dailySummaryEn: { type: "string" },
    trendInsights: { type: "array", items: { type: "string" } },
    trendInsightsEn: { type: "array", items: { type: "string" } },
    topRecommendations: { type: "array", items: topRecommendationJsonSchema },
    topRecommendationsEn: { type: "array", items: topRecommendationJsonSchema },
  },
  required: ["dailySummary", "dailySummaryEn", "trendInsights", "trendInsightsEn", "topRecommendations", "topRecommendationsEn"],
  additionalProperties: false,
} as const;

export const repoReadmeSummaryJsonSchema = {
  type: "object",
  properties: {
    repoFullName: { type: "string" },
    summary: { type: "string" },
    summaryEn: { type: "string" },
    readmeSummary: { type: "string" },
    readmeSummaryEn: { type: "string" },
    recommendationReason: { anyOf: [{ type: "string" }, { type: "null" }] },
    recommendationReasonEn: { anyOf: [{ type: "string" }, { type: "null" }] },
    tags: { type: "array", items: { type: "string" } },
    tagsEn: { type: "array", items: { type: "string" } },
  },
  required: ["repoFullName", "summary", "summaryEn", "readmeSummary", "readmeSummaryEn", "recommendationReason", "recommendationReasonEn", "tags", "tagsEn"],
  additionalProperties: false,
} as const;

export const trendingSummaryJsonSchema = {
  type: "object",
  properties: {
    ...dailyTrendingSummaryJsonSchema.properties,
    repoSummaries: { type: "array", items: repoSummaryJsonSchema },
  },
  required: ["dailySummary", "dailySummaryEn", "trendInsights", "trendInsightsEn", "topRecommendations", "topRecommendationsEn", "repoSummaries"],
  additionalProperties: false,
} as const;
