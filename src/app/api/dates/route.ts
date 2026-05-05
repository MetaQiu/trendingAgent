import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const snapshots = await prisma.trendingSnapshot.findMany({
    orderBy: { date: "desc" },
    select: { date: true, language: true, since: true },
  });

  const dates = [...new Set(snapshots.map((snapshot) => snapshot.date.toISOString().slice(0, 10)))];
  return NextResponse.json({ dates, snapshots });
}
