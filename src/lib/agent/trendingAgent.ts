import { prisma } from "@/lib/db";
import { formatDateKey } from "@/lib/date";
import { fetchTrendingRepos } from "@/lib/github/trending";
import { computeMetrics } from "@/lib/metrics";
import { summarizeWithConfiguredLLM } from "@/lib/llm/provider";
import type { TrendingSince } from "@/types/trending";

export type TrendingUpdateTrigger = "cron" | "manual" | "script";

export class TrendingUpdateAlreadyRunningError extends Error {
  statusCode = 409;

  constructor(public run: Awaited<ReturnType<typeof prisma.trendingUpdateRun.findFirst>>) {
    super("已有更新任务正在运行，请稍后再试");
    this.name = "TrendingUpdateAlreadyRunningError";
  }
}

export class TrendingUpdateRunFailedError extends Error {
  statusCode = 500;

  constructor(
    message: string,
    public run: Awaited<ReturnType<typeof prisma.trendingUpdateRun.findUnique>>,
  ) {
    super(message);
    this.name = "TrendingUpdateRunFailedError";
  }
}

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
  const results: Array<{
    snapshotId: string;
    date: string;
    language: string;
    since: TrendingSince;
    repoCount: number;
    fallback: boolean;
    error?: string;
  }> = [];

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

export async function runTrendingAgentWithLog(options?: {
  date?: Date;
  language?: string;
  since?: TrendingSince;
  trigger?: TrendingUpdateTrigger;
}) {
  const date = options?.date ?? new Date();
  const dateKey = formatDateKey(date);
  const languages = options?.language ? [options.language] : parseLanguages();
  const since = options?.since ?? parseSince();
  const trigger = options?.trigger ?? "cron";
  const startedAt = new Date();
  const runningSince = new Date(startedAt.getTime() - 30 * 60 * 1000);

  const runningRun = await prisma.trendingUpdateRun.findFirst({
    where: {
      status: "running",
      startedAt: { gte: runningSince },
    },
    orderBy: { startedAt: "desc" },
  });

  if (runningRun) {
    throw new TrendingUpdateAlreadyRunningError(runningRun);
  }

  const run = await prisma.trendingUpdateRun.create({
    data: {
      status: "running",
      trigger,
      dateKey,
      since,
      languagesJson: languages,
      startedAt,
      message: "更新任务已开始",
    },
  });

  try {
    const results = await runTrendingAgent({ date, language: options?.language, since });
    const finishedAt = new Date();
    const repoCount = results.reduce((sum, item) => sum + item.repoCount, 0);
    const snapshotCount = results.length;
    const message = `更新成功，共写入 ${repoCount} 个仓库，生成 ${snapshotCount} 个快照。`;
    const updatedRun = await prisma.trendingUpdateRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        repoCount,
        snapshotCount,
        resultsJson: results,
        message,
      },
    });

    return { run: updatedRun, results };
  } catch (error) {
    const finishedAt = new Date();
    const errorMessage = error instanceof Error ? error.message : "更新失败";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const updatedRun = await prisma.trendingUpdateRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        errorMessage,
        errorStack,
        message: `更新失败：${errorMessage}`,
      },
    });

    throw new TrendingUpdateRunFailedError(errorMessage, updatedRun);
  }
}
