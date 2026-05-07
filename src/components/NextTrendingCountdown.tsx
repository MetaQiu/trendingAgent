"use client";

import { useEffect, useMemo, useState } from "react";

const CRON_HOUR_UTC = 1;
const CRON_MINUTE_UTC = 5;

function getNextRun(now: Date) {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), CRON_HOUR_UTC, CRON_MINUTE_UTC, 0, 0));
  if (next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0")).join(":");
}

export function NextTrendingCountdown() {
  const [now, setNow] = useState(() => new Date());
  const nextRun = useMemo(() => getNextRun(now), [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="lp-card p-6 text-left">
      <p className="lp-eyebrow">Next Run</p>
      <p className="mt-3 font-mono text-3xl font-semibold lp-ink">{formatRemaining(nextRun.getTime() - now.getTime())}</p>
      <div className="mt-4 space-y-1 text-sm lp-muted">
        <p>UTC：{nextRun.toISOString().replace(".000Z", "Z")}</p>
        <p>本地：{nextRun.toLocaleString()}</p>
      </div>
    </div>
  );
}
