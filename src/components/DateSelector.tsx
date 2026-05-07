import Link from "next/link";

function formatDisplayDate(date: string) {
  return date.replaceAll("-", "/");
}

function getDateHref(date: string) {
  return `/?date=${date}`;
}

function ArrowButton({ href, direction, disabled }: { href?: string; direction: "prev" | "next"; disabled: boolean }) {
  const label = direction === "prev" ? "←" : "→";
  const className = "inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-[var(--chip-bg)] px-3 font-semibold transition hover:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-40";

  if (disabled || !href) {
    return <span className={`${className} opacity-40`}>{label}</span>;
  }

  return <Link className={className} href={href}>{label}</Link>;
}

export function DateSelector({ dates, currentDate }: { dates: string[]; currentDate?: string }) {
  if (dates.length === 0) return null;

  const selectedDate = currentDate && dates.includes(currentDate) ? currentDate : dates[0];
  const selectedIndex = dates.indexOf(selectedDate);
  const olderDate = dates[selectedIndex + 1];
  const newerDate = dates[selectedIndex - 1];
  const latestDate = dates[0];
  const isLatest = selectedDate === latestDate;

  return (
    <div className="lp-card flex flex-wrap items-center gap-2 p-4">
      <span className="px-2 text-xs font-semibold uppercase tracking-[0.18em] lp-muted">Snapshot</span>
      <ArrowButton direction="prev" href={olderDate ? getDateHref(olderDate) : undefined} disabled={!olderDate} />
      <Link className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-2 font-mono text-sm font-semibold lp-ink" href={getDateHref(selectedDate)}>
        {formatDisplayDate(selectedDate)}
        <svg aria-hidden="true" className="h-4 w-4 lp-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="4" y="5" width="16" height="16" rx="2" />
        </svg>
      </Link>
      <ArrowButton direction="next" href={newerDate ? getDateHref(newerDate) : undefined} disabled={!newerDate} />
      {isLatest ? (
        <span className="lp-chip lp-chip-active px-5 py-2 font-semibold">Latest</span>
      ) : (
        <Link className="lp-chip lp-chip-active px-5 py-2 font-semibold" href={getDateHref(latestDate)}>Latest</Link>
      )}
    </div>
  );
}
