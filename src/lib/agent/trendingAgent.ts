import { prisma } from "@/lib/db";
import { formatDateKey } from "@/lib/date";
import { fetchRepoReadme } from "@/lib/github/readme";
import { fetchTrendingRepos } from "@/lib/github/trending";
import { computeMetrics } from "@/lib/metrics";
import {
  buildFallbackDailySummary,
  buildFallbackRepoReadmeSummary,
  summarizeDailyTrendingWithConfiguredLLM,
  summarizeRepoReadmeWithConfiguredLLM,
} from "@/lib/llm/provider";
import type { DailyTrendingSummary, RepoReadmeSummaryResult, TrendingSince } from "@/types/trending";

export type TrendingUpdateTrigger = "cron" | "manual" | "script";

const REPO_LLM_CONCURRENCY = Number(process.env.REPO_LLM_CONCURRENCY || 5);
const REPO_LLM_TIMEOUT_MS = Number(process.env.REPO_LLM_TIMEOUT_MS || 12000);
const DAILY_SUMMARY_TIMEOUT_MS = Number(process.env.DAILY_SUMMARY_TIMEOUT_MS || 20000);

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

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
  return results;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]).finally(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });
}

function buildRepoLlmStats(results: RepoReadmeSummaryResult[]) {
  return {
    total: results.length,
    success: results.filter((item) => !item.fallback).length,
    fallback: results.filter((item) => item.fallback).length,
    failed: results.filter((item) => item.fallback && item.error).length,
    readmeFetched: results.filter((item) => item.readmeFetched).length,
    durationMs: results.reduce((sum, item) => sum + item.durationMs, 0),
  };
}

async function summarizeRepoWithReadme(repo: Parameters<typeof summarizeRepoReadmeWithConfiguredLLM>[0]["repo"], dateKey: string): Promise<RepoReadmeSummaryResult> {
  const startedAt = Date.now();
  const readme = await fetchRepoReadme({ owner: repo.owner, name: repo.name });

  try {
    const llmResult = await withTimeout(
      summarizeRepoReadmeWithConfiguredLLM({ repo, readmeText: readme.text, dateKey }),
      REPO_LLM_TIMEOUT_MS,
      `单仓库 LLM 超时：${repo.repoFullName}`,
    );

    return {
      ...llmResult,
      readmeFetched: readme.fetched,
      readmeLength: readme.length,
      durationMs: Date.now() - startedAt,
      error: llmResult.error || readme.error,
    };
  } catch (error) {
    return {
      summary: buildFallbackRepoReadmeSummary(repo, readme.fetched),
      provider: process.env.LLM_PROVIDER || "anthropic",
      fallback: true,
      error: error instanceof Error ? error.message : "单仓库 LLM 失败",
      readmeFetched: readme.fetched,
      readmeLength: readme.length,
      durationMs: Date.now() - startedAt,
    };
  }
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
    repoLlm: ReturnType<typeof buildRepoLlmStats>;
  }> = [];

  for (const language of languages) {
    const repos = await fetchTrendingRepos({ language, since });
    const repoSummaryResults = await mapWithConcurrency(repos, REPO_LLM_CONCURRENCY, (repo) => summarizeRepoWithReadme(repo, dateKey));
    const repoSummaries = repoSummaryResults.map((item) => item.summary);
    const repoSummaryMap = new Map(repoSummaries.map((item) => [item.repoFullName, item]));
    const repoLlmStats = buildRepoLlmStats(repoSummaryResults);
    const metrics = computeMetrics(repos);

    let dailySummary: DailyTrendingSummary;
    let dailyLlm: { provider: string; fallback: boolean; error?: string };
    try {
      const dailyResult = await withTimeout(
        summarizeDailyTrendingWithConfiguredLLM({ repos, repoSummaries, dateKey }),
        DAILY_SUMMARY_TIMEOUT_MS,
        "日报聚合 LLM 超时",
      );
      dailySummary = dailyResult.summary;
      dailyLlm = { provider: dailyResult.provider, fallback: dailyResult.fallback, error: dailyResult.error };
    } catch (error) {
      dailySummary = buildFallbackDailySummary(repos);
      dailyLlm = {
        provider: process.env.LLM_PROVIDER || "anthropic",
        fallback: true,
        error: error instanceof Error ? error.message : "日报聚合 LLM 失败",
      };
    }

    const insightsJson = {
      ...dailySummary,
      metrics,
      repoSummaries,
      llm: dailyLlm,
      repoLlm: repoLlmStats,
    };

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
          summary: dailySummary.dailySummary,
          insightsJson,
        },
        create: {
          date: new Date(`${dateKey}T00:00:00.000Z`),
          language,
          since,
          summary: dailySummary.dailySummary,
          insightsJson,
        },
      });

      await tx.trendingRepo.deleteMany({ where: { snapshotId: savedSnapshot.id } });
      await tx.trendingRepo.createMany({
        data: repos.map((repo) => {
          const repoSummary = repoSummaryMap.get(repo.repoFullName);
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
            readmeSummary: repoSummary?.readmeSummary,
            recommendationReason: repoSummary?.recommendationReason,
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
      fallback: dailyLlm.fallback,
      error: dailyLlm.error,
      repoLlm: repoLlmStats,
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
    const repoLlmSuccess = results.reduce((sum, item) => sum + item.repoLlm.success, 0);
    const repoLlmFallback = results.reduce((sum, item) => sum + item.repoLlm.fallback, 0);
    const dailyLlmFallback = results.filter((item) => item.fallback).length;
    const message = `更新成功，共写入 ${repoCount} 个仓库，生成 ${snapshotCount} 个快照；单仓库 LLM 成功 ${repoLlmSuccess} 个，降级 ${repoLlmFallback} 个；日报聚合 ${dailyLlmFallback === 0 ? "成功" : `降级 ${dailyLlmFallback} 个`}。`;
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
