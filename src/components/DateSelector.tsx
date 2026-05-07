import Link from "next/link";

export function DateSelector({ dates }: { dates: string[] }) {
  if (dates.length === 0) return null;

  return (
    <div className="lp-card flex flex-wrap items-center gap-2 p-4">
      <span className="px-2 text-xs font-semibold uppercase tracking-[0.18em] lp-muted">Snapshot</span>
      {dates.map((date, index) => (
        <Link key={date} href={`/trending/${date}`} className={`lp-chip px-4 py-2 text-sm font-semibold ${index === 0 ? "lp-chip-active" : ""}`}>
          {date}
        </Link>
      ))}
    </div>
  );
}
