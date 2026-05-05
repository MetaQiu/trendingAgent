import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseDateKey } from "@/lib/date";
import { computeMetrics } from "@/lib/metrics";
import type { TrendingRepoItem } from "@/types/trending";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const language = params.get("language") || "all";
  const since = params.get("since") || "daily";

  try {
    const date = parseDateKey(params.get("date"));
    const snapshot = await prisma.trendingSnapshot.findUnique({
      where: { date_language_since: { date, language, since } },
      include: { repos: { orderBy: { rank: "asc" } } },
    });

    if (!snapshot) {
      return NextResponse.json({ snapshot: null, repos: [], metrics: computeMetrics([]) });
    }

    const repos: TrendingRepoItem[] = snapshot.repos.map((repo) => ({
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
    }));

    return NextResponse.json({
      snapshot: {
        id: snapshot.id,
        date: snapshot.date.toISOString().slice(0, 10),
        language: snapshot.language,
        since: snapshot.since,
        summary: snapshot.summary,
        insights: snapshot.insightsJson,
        createdAt: snapshot.createdAt,
        updatedAt: snapshot.updatedAt,
      },
      repos: snapshot.repos,
      metrics: computeMetrics(repos),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "查询失败" },
      { status: 400 },
    );
  }
}
