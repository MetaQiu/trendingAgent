import { prisma } from "@/lib/db";
import { formatDateKey } from "@/lib/date";
import { fetchTrendingRepos } from "@/lib/github/trending";
import { computeMetrics } from "@/lib/metrics";
import { summarizeWithConfiguredLLM } from "@/lib/llm/provider";
import type { TrendingSince } from "@/types/trending";

function parseLanguages() {
  return (process.env.GITHUB_TRENDING_LANGUAGES || "all")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseSince(): TrendingSince {
  const value = process.env.GITHUB_TRENDING_SINCE || "daily";
  return value === "weekly" || value === "monthly" ? value : "daily";
}

export async function runTrendingAgent(options?: {
  date?: Date;
  language?: string;
  since?: TrendingSince;
}) {
  const date = options?.date ?? new Date();
  const dateKey = formatDateKey(date);
  const languages = options?.language ? [options.language] : parseLanguages();
  const since = options?.since ?? parseSince();
  const results = [];

  for (const language of languages) {
    const repos = await fetchTrendingRepos({ language, since });
    const llmResult = await summarizeWithConfiguredLLM(repos, dateKey);
    const metrics = computeMetrics(repos);
    const summaryMap = new Map(llmResult.summary.repoSummaries.map((item) => [item.repoFullName, item]));
    const recommendationMap = new Map(llmResult.summary.topRecommendations.map((item) => [item.repoFullName, item.reason]));

    const snapshot = await prisma.$transaction(async (tx) => {
      const savedSnapshot = await tx.trendingSnapshot.upsert({
        where: {
          date_language_since: {
            date: new Date(`${dateKey}T00:00:00.000Z`),
            language,
            since,
          },
        },
        update: {
          summary: llmResult.summary.dailySummary,
          insightsJson: {
            ...llmResult.summary,
            metrics,
            llm: {
              provider: llmResult.provider,
              fallback: llmResult.fallback,
              error: llmResult.error,
            },
          },
        },
        create: {
          date: new Date(`${dateKey}T00:00:00.000Z`),
          language,
          since,
          summary: llmResult.summary.dailySummary,
          insightsJson: {
            ...llmResult.summary,
            metrics,
            llm: {
              provider: llmResult.provider,
              fallback: llmResult.fallback,
              error: llmResult.error,
            },
          },
        },
      });

      await tx.trendingRepo.deleteMany({ where: { snapshotId: savedSnapshot.id } });
      await tx.trendingRepo.createMany({
        data: repos.map((repo) => {
          const repoSummary = summaryMap.get(repo.repoFullName);
          return {
            snapshotId: savedSnapshot.id,
            rank: repo.rank,
            owner: repo.owner,
            name: repo.name,
            repoFullName: repo.repoFullName,
            url: repo.url,
            description: repo.description,
            language: repo.language,
            languageColor: repo.languageColor,
            stars: repo.stars,
            forks: repo.forks,
            starsToday: repo.starsToday,
            summary: repoSummary?.summary,
            recommendationReason: recommendationMap.get(repo.repoFullName),
            tagsJson: repoSummary?.tags ?? [],
          };
        }),
      });

      return savedSnapshot;
    });

    results.push({
      snapshotId: snapshot.id,
      date: dateKey,
      language,
      since,
      repoCount: repos.length,
      fallback: llmResult.fallback,
      error: llmResult.error,
    });
  }

  return results;
}
