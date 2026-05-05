import Link from "next/link";

export function DateSelector({ dates }: { dates: string[] }) {
  if (dates.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((date) => (
        <Link key={date} href={`/trending/${date}`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-600">
          {date}
        </Link>
      ))}
    </div>
  );
}
