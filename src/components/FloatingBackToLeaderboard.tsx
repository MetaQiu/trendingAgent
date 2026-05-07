export function FloatingBackToLeaderboard() {
  return (
    <a
      className="fixed bottom-6 right-6 z-40 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--chip-fg-active)] shadow-[var(--shadow)] transition hover:bg-[var(--accent-soft)]"
      href="#top-repositories"
    >
      回到排行榜 ↑
    </a>
  );
}
