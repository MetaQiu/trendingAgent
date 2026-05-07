"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top-repositories", label: "排行" },
  { id: "charts", label: "图表" },
  { id: "summary", label: "总结" },
  { id: "repo-details", label: "仓库" },
];

export function SideNavigation() {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const observers = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (observers.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.4, 0.7] },
    );

    observers.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <aside className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block" aria-label="页面位置导航">
      <nav className="relative flex flex-col gap-6 py-3 pl-5 pr-2">
        <span className="absolute left-[27px] top-4 h-[calc(100%-32px)] w-px bg-[var(--border)]" aria-hidden="true" />
        {sections.map((section) => {
          const isActive = activeId === section.id;

          return (
            <a
              key={section.id}
              className="group relative flex items-center gap-3 text-xs font-semibold"
              href={`#${section.id}`}
              aria-current={isActive ? "location" : undefined}
            >
              <span
                className={`relative z-10 h-3 w-3 rounded-full border transition ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--accent)_16%,transparent)]"
                    : "border-[var(--border)] bg-[var(--bg-elev)] group-hover:border-[var(--accent)]"
                }`}
              />
              <span className={`rounded-full px-2 py-1 transition ${isActive ? "bg-[var(--chip-bg)] text-[var(--accent)]" : "lp-muted group-hover:text-[var(--accent)]"}`}>
                {section.label}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
