"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildHomeHref, formatMessage, messages, type Locale } from "@/lib/i18n";

function formatDisplayDate(date: string) {
  return date.replaceAll("-", "/");
}

function parseDateParts(date: string) {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
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

export function DateSelector({ dates, currentDate, locale, observedDate }: { dates: string[]; currentDate?: string; locale: Locale; observedDate?: string }) {
  const t = messages[locale].dateSelector;
  const [open, setOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const selectedDate = currentDate && dates.includes(currentDate) ? currentDate : dates[0];
  const selectedParts = parseDateParts(selectedDate || getTodayKey());
  const [visibleMonth, setVisibleMonth] = useState({ year: selectedParts.year, month: selectedParts.month });
  const dateSet = useMemo(() => new Set(dates), [dates]);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth.year, visibleMonth.month), [visibleMonth]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (dates.length === 0 || !selectedDate) return null;

  const selectedIndex = dates.indexOf(selectedDate);
  const olderDate = dates[selectedIndex + 1];
  const newerDate = dates[selectedIndex - 1];
  const latestDate = dates[0];
  const isLatest = selectedDate === latestDate;
  const todayKey = getTodayKey();
  const todayHref = dateSet.has(todayKey) ? buildHomeHref({ date: todayKey, locale }) : buildHomeHref({ date: latestDate, locale });
  const monthLabel = formatMessage(t.monthYear, { year: visibleMonth.year, month: visibleMonth.month + 1 });

  function getDateHref(date: string) {
    return buildHomeHref({ date, locale });
  }

  function shiftMonth(offset: number) {
    setVisibleMonth((current) => {
      const next = new Date(current.year, current.month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  return (
    <div className={`lp-card relative flex flex-wrap items-center gap-2 p-4 ${open ? "z-[55]" : "z-30"}`}>
      <ArrowButton direction="prev" href={olderDate ? getDateHref(olderDate) : undefined} disabled={!olderDate} />

      <div ref={selectorRef} className="relative">
        <button
          className={`inline-flex h-11 items-center gap-2 rounded-xl border bg-[var(--bg-elev)] px-4 font-mono text-sm font-semibold lp-ink shadow-sm transition hover:border-[var(--accent)] ${open ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
          type="button"
          aria-label={t.selectDate}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {formatDisplayDate(selectedDate)}
          <svg aria-hidden="true" className="h-4 w-4 lp-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 2v4M16 2v4M3 10h18" />
            <rect x="4" y="5" width="16" height="16" rx="2" />
          </svg>
        </button>

        {open ? (
          <div className="absolute left-0 top-[calc(100%+8px)] z-[60] w-[280px] rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-4 shadow-[var(--shadow)]">
            <div className="mb-4 flex items-center justify-between">
              <button className="rounded-full px-2 py-1 text-sm font-semibold lp-ink hover:bg-[var(--chip-bg)]" type="button" onClick={() => shiftMonth(-1)} aria-label={t.previousMonth}>
                ↑
              </button>
              <span className="text-sm font-bold lp-ink">{monthLabel}</span>
              <button className="rounded-full px-2 py-1 text-sm font-semibold lp-muted hover:bg-[var(--chip-bg)]" type="button" onClick={() => shiftMonth(1)} aria-label={t.nextMonth}>
                ↓
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold lp-ink">
              {t.weekDays.map((day) => <span key={day} className="py-1">{day}</span>)}
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
              <Link href={buildHomeHref({ locale })}>{t.clear}</Link>
              <Link href={todayHref}>{t.today}</Link>
            </div>
          </div>
        ) : null}
      </div>

      <ArrowButton direction="next" href={newerDate ? getDateHref(newerDate) : undefined} disabled={!newerDate} />
      {isLatest ? (
        <span className="lp-chip lp-chip-active px-5 py-2 font-semibold">{t.latest}</span>
      ) : (
        <Link className="lp-chip lp-chip-active px-5 py-2 font-semibold" href={getDateHref(latestDate)}>{t.latest}</Link>
      )}
      {observedDate ? (
        <span className="ml-auto inline-flex h-11 items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--panel)] px-5 font-mono text-sm shadow-sm backdrop-blur">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] lp-muted">{messages[locale].app.observed}</span>
          <strong className="lp-ink">{observedDate}</strong>
        </span>
      ) : null}
    </div>
  );
}
