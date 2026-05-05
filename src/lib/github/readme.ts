export const README_FETCH_TIMEOUT_MS = Number(process.env.README_FETCH_TIMEOUT_MS || 3000);
export const README_MAX_CHARS = Number(process.env.README_MAX_CHARS || 8000);

export type RepoReadmeFetchResult = {
  text: string | null;
  fetched: boolean;
  error?: string;
  length: number;
};

function cleanReadmeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function fetchRepoReadme(params: { owner: string; name: string }): Promise<RepoReadmeFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), README_FETCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.raw",
      "User-Agent": "trending-agent/1.0 (+https://vercel.com)",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.name)}/readme`, {
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        text: null,
        fetched: false,
        error: `GitHub README 请求失败：${response.status} ${response.statusText}`,
        length: 0,
      };
    }

    const cleaned = cleanReadmeText(await response.text());
    return {
      text: cleaned.slice(0, README_MAX_CHARS),
      fetched: true,
      length: cleaned.length,
    };
  } catch (error) {
    return {
      text: null,
      fetched: false,
      error: error instanceof Error ? error.message : "README 抓取失败",
      length: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}
