import { NextRequest, NextResponse } from "next/server";
import { runTrendingAgent } from "@/lib/agent/trendingAgent";

export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const authHeader = request.headers.get("authorization");
  const queryToken = request.nextUrl.searchParams.get("token");
  return authHeader === `Bearer ${secret}` || (process.env.NODE_ENV !== "production" && queryToken === secret);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runTrendingAgent();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "更新失败" },
      { status: 500 },
    );
  }
}
