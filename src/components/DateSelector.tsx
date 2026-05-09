"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

function formatDisplayDate(date: string) {
  return date.replaceAll("-", "/");
}

function getDateHref(date: string) {
  return `/?date=${date}`;
}

function parseDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month: month - 1, day };
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayKey() {
  const today = new Date();
  return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function ArrowButton({ href, direction, disabled }: { href?: string; direction: "prev" | "next"; disabled: boolean }) {
  const label = direction === "prev" ? "←" : "→";
  const className = "inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[var(--chip-bg)] px-3 font-semibold transition hover:bg-[var(--border)] disabled:cursor-not-allowed disabled:opacity-40";

  if (disabled || !href) {
    return <span className={`${className} opacity-40`}>{label}</span>;
  }

  return <Link className={className} href={href}>{label}</Link>;
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      key: formatDateKey(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}

export function DateSelector({ dates, currentDate }: { dates: string[]; currentDate?: string }) {
  const selectedDate = currentDate && dates.includes(currentDate) ? currentDate : dates[0];
  const selectedIndex = dates.indexOf(selectedDate);
  const olderDate = dates[selectedIndex + 1];
  const newerDate = dates[selectedIndex - 1];
  const latestDate = dates[0];
  const isLatest = selectedDate === latestDate;
  const selectedParts = parseDateParts(selectedDate);
  const [visibleMonth, setVisibleMonth] = useState({ year: selectedParts.year, month: selectedParts.month });
  const dateSet = useMemo(() => new Set(dates), [dates]);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth.year, visibleMonth.month), [visibleMonth]);
  const todayKey = getTodayKey();
  const todayHref = dateSet.has(todayKey) ? getDateHref(todayKey) : getDateHref(latestDate);

  if (dates.length === 0) return null;

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className="lp-card relative z-50 flex flex-wrap items-center gap-2 p-4">
      <ArrowButton direction="prev" href={olderDate ? getDateHref(olderDate) : undefined} disabled={!olderDate} />

      <details className="group relative">
        <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] px-4 font-mono text-sm font-semibold lp-ink shadow-sm transition hover:border-[var(--accent)]">
          {formatDisplayDate(selectedDate)}
          <svg aria-hidden="true" className="h-4 w-4 lp-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18" />
            <rect x="4" y="5" width="16" height="16" rx="2" />
          </svg>
        </summary>

        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 shadow-[var(--shadow)]">
          <div className="mb-4 flex items-center justify-between">
            <button className="rounded-full px-2 py-1 text-sm font-semibold lp-ink hover:bg-[var(--chip-bg)]" type="button" onClick={() => shiftMonth(-1)} aria-label="上个月">
              ↑
            </button>
            <span className="text-sm font-bold lp-ink">{visibleMonth.year}年{visibleMonth.month + 1}月</span>
            <button className="rounded-full px-2 py-1 text-sm font-semibold lp-muted hover:bg-[var(--chip-bg)]" type="button" onClick={() => shiftMonth(1)} aria-label="下个月">
              ↓
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold lp-ink">
            {weekDays.map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
            {calendarDays.map((day) => {
              const isSelected = day.key === selectedDate;
              const isAvailable = dateSet.has(day.key);
              const className = `flex h-8 items-center justify-center rounded-md transition ${
                isSelected
                  ? "bg-[var(--accent)] font-bold text-[var(--chip-fg-active)] shadow-sm"
                  : isAvailable
                    ? "font-medium lp-ink hover:bg-[var(--chip-bg)] hover:text-[var(--accent)]"
                    : day.inCurrentMonth
                      ? "cursor-not-allowed text-[var(--muted)] opacity-45"
                      : "cursor-not-allowed text-[var(--muted)] opacity-30"
              }`;

              return isAvailable ? (
                <Link key={day.key} className={className} href={getDateHref(day.key)}>
                  {day.day}
                </Link>
              ) : (
                <span key={day.key} className={className}>
                  {day.day}
                </span>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-medium text-[var(--accent)]">
            <Link href="/">清除</Link>
            <Link href={todayHref}>今天</Link>
          </div>
        </div>
      </details>

      <ArrowButton direction="next" href={newerDate ? getDateHref(newerDate) : undefined} disabled={!newerDate} />
      {isLatest ? (
        <span className="lp-chip lp-chip-active px-5 py-2 font-semibold">Latest</span>
      ) : (
        <Link className="lp-chip lp-chip-active px-5 py-2 font-semibold" href={getDateHref(latestDate)}>Latest</Link>
      )}
    </div>
  );
}
