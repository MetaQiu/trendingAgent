import * as cheerio from "cheerio";
import type { TrendingRepoItem, TrendingSince } from "@/types/trending";

function parseNumber(text: string): number {
  const value = text.replace(/,/g, "").match(/\d+/)?.[0];
  return value ? Number(value) : 0;
}

function normalizeLanguage(language?: string): string | null {
  const value = language?.trim();
  return value ? value : null;
}

export async function fetchTrendingRepos({
  language = "all",
  since = "daily",
  limit = 25,
}: {
  language?: string;
  since?: TrendingSince;
  limit?: number;
} = {}): Promise<TrendingRepoItem[]> {
  const languagePath = language === "all" ? "" : encodeURIComponent(language);
  const url = `https://github.com/trending/${languagePath}?since=${encodeURIComponent(since)}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "trending-agent/1.0 (+https://vercel.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending 抓取失败：${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const repos: TrendingRepoItem[] = [];

  $("article.Box-row").each((index, element) => {
    const $article = $(element);
    const titleText = $article.find("h2 a").text().replace(/\s+/g, "").trim();
    const [owner, name] = titleText.split("/");

    if (!owner || !name) return;

    const description = $article.find("p").first().text().trim() || null;
    const languageNode = $article.find('[itemprop="programmingLanguage"]').first();
    const languageValue = normalizeLanguage(languageNode.text());
    const languageColor = languageNode.prev("span.repo-language-color").attr("style")?.match(/#[0-9a-fA-F]{6}/)?.[0] ?? null;
    const numberLinks = $article.find('a.Link--muted, a[href$="/stargazers"], a[href$="/forks"]').toArray();
    const stars = parseNumber($(numberLinks[0]).text());
    const forks = parseNumber($(numberLinks[1]).text());
    const starsToday = parseNumber($article.find("span.d-inline-block.float-sm-right").text());
    const repoFullName = `${owner}/${name}`;

    repos.push({
      rank: index + 1,
      owner,
      name,
      repoFullName,
      url: `https://github.com/${repoFullName}`,
      description,
      language: languageValue,
      languageColor,
      stars,
      forks,
      starsToday,
    });
  });

  return repos.slice(0, limit);
}
