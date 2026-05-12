import { NextRequest, NextResponse } from "next/server";
import {
  runTrendingAgentWithLog,
  TrendingUpdateAlreadyRunningError,
  TrendingUpdateRunFailedError,
  type TrendingUpdateTrigger,
} from "@/lib/agent/trendingAgent";

export const runtime = "nodejs";
export const maxDuration = 300;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const authHeader = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("token");
  return authHeader === `Bearer ${secret}` || (process.env.NODE_ENV !== "production" && queryToken === secret);
}

function parseTrigger(value: string | null): TrendingUpdateTrigger {
  return value === "manual" || value === "script" ? value : "cron";
}

function serializeRun(run: {
  id: string;
  status: string;
  trigger: string;
  dateKey: string | null;
  since: string | null;
  repoCount: number;
  snapshotCount: number;
  message: string | null;
  errorMessage: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  durationMs: number | null;
} | null) {
  if (!run) return null;

  return {
    id: run.id,
    status: run.status,
    trigger: run.trigger,
    dateKey: run.dateKey,
    since: run.since,
    repoCount: run.repoCount,
    snapshotCount: run.snapshotCount,
    message: run.message,
    errorMessage: run.errorMessage,
    startedAt: run.startedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
    durationMs: run.durationMs,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { run, results } = await runTrendingAgentWithLog({
      trigger: parseTrigger(request.nextUrl.searchParams.get("trigger")),
    });
    return NextResponse.json({ ok: true, run: serializeRun(run), results });
  } catch (error) {
    if (error instanceof TrendingUpdateAlreadyRunningError) {
      return NextResponse.json(
        { ok: false, error: error.message, run: serializeRun(error.run) },
        { status: error.statusCode },
      );
    }

    if (error instanceof TrendingUpdateRunFailedError) {
      return NextResponse.json(
        { ok: false, error: error.message, run: serializeRun(error.run) },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 },
    );
  }
}
