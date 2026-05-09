import { messages, type Locale } from "@/lib/i18n";

export function FloatingBackToLeaderboard({ locale = "zh" }: { locale?: Locale }) {
  return (
    <a
      className="fixed bottom-6 right-6 z-40 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--chip-fg-active)] shadow-[var(--shadow)] transition hover:bg-[var(--accent-soft)]"
      href="#top-repositories"
    >
      {messages[locale].common.backToLeaderboard}
    </a>
  );
}
