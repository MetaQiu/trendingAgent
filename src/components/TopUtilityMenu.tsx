"use client";

import { useEffect, useRef, useState } from "react";
import { NextTrendingCountdown } from "@/components/NextTrendingCountdown";
import { TrendingUpdateRunsPanel, type TrendingUpdateRunListItem } from "@/components/TrendingUpdateRunsPanel";
import { UpdateTrendingButton } from "@/components/UpdateTrendingButton";
import { messages, type Locale } from "@/lib/i18n";

function RefreshIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-15.4 6.4" />
      <path d="M3 12A9 9 0 0 1 18.4 5.6" />
      <path d="M18 2v4h-4" />
      <path d="M6 22v-4h4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function UtilityDropdown({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
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

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className={`flex h-11 w-11 items-center justify-center rounded-full border bg-[var(--panel)] text-[var(--ink)] shadow-sm backdrop-blur transition hover:border-[var(--accent)] hover:text-[var(--accent)] ${open ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)]"}`}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[min(92vw,520px)]">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function TopUtilityMenu({ runs, locale }: { runs: TrendingUpdateRunListItem[]; locale: Locale }) {
  const t = messages[locale].topUtilityMenu;
  return (
    <div className="relative z-[70] flex flex-wrap items-center gap-2">
      <UtilityDropdown label={t.manualUpdate} icon={<RefreshIcon />}>
        <UpdateTrendingButton locale={locale} />
      </UtilityDropdown>
      <UtilityDropdown label={t.nextRun} icon={<ClockIcon />}>
        <NextTrendingCountdown locale={locale} />
      </UtilityDropdown>
      <UtilityDropdown label={t.runs} icon={<LogsIcon />}>
        <TrendingUpdateRunsPanel runs={runs} locale={locale} />
      </UtilityDropdown>
    </div>
  );
}
