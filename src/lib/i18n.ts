export type Locale = "zh" | "en";

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "zh";
}

export function buildHomeHref({ date, locale }: { date?: string | null; locale?: Locale }) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (locale === "en") params.set("locale", "en");
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function formatMessage(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{${key}}`, String(value)), template);
}

export const messages = {
  zh: {
    app: {
      title: "GitHub Trending 智能总结",
      description: "自动抓取、中文总结和趋势可视化。",
      emptyDescription: "还没有快照数据。配置 DATABASE_URL、CRON_SECRET 和 LLM 环境变量后，可以在下方输入密钥生成第一份总结。",
      observed: "Observed",
      githubAria: "打开 GitHub 仓库",
      repositoriesEyebrow: "Repositories",
      repositoriesTitle: "Trending 仓库",
      languageSwitch: "EN",
      languageSwitchAria: "Switch to English",
      starsTodayTitle: "今日新增 Stars Top 10",
      totalStarsTitle: "总 Stars Top 10",
    },
    dateSelector: {
      weekDays: ["一", "二", "三", "四", "五", "六", "日"],
      clear: "清除",
      today: "今天",
      latest: "Latest",
      previousMonth: "上个月",
      nextMonth: "下个月",
      selectDate: "选择日期",
      monthYear: "{year}年{month}月",
    },
    topUtilityMenu: {
      manualUpdate: "手动更新",
      nextRun: "下次运行",
      runs: "运行日志",
    },
    updatePanel: {
      eyebrow: "Manual Update",
      title: "手动更新 Trending",
      description: "输入 CRON_SECRET 后，可直接从前端触发一次抓取和总结。密钥只会用于本次请求。",
      placeholder: "输入 CRON_SECRET",
      missingSecret: "请输入 CRON_SECRET",
      loading: "正在抓取 GitHub Trending 并生成总结，请稍候...",
      conflict: "已有更新任务正在运行，请稍后再试",
      failed: "更新失败",
      success: "更新成功，共写入 {count} 个仓库。页面即将刷新。",
      buttonIdle: "立即更新",
      buttonLoading: "更新中...",
    },
    nextRun: {
      eyebrow: "Next Run",
      utc: "UTC",
      local: "本地",
    },
    runsPanel: {
      eyebrow: "Runs",
      title: "最近运行日志",
      noMessage: "无消息",
      empty: "暂无运行日志。",
      timeout: "该任务运行已超过 30 分钟，可能已超时。",
      repo: "仓库",
      snapshot: "快照",
      duration: "耗时",
      started: "开始",
      statuses: { running: "运行中", success: "成功", failed: "失败" },
      triggers: { cron: "自动", manual: "手动", script: "脚本" },
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Top {count} repositories",
      description: "按 GitHub Trending 今日排名展示，快速查看热度、语言和新增 Stars。",
      repoCount: "{count} repos",
      jumpToRepo: "跳转到 {repo} 的总结卡片",
    },
    charts: {
      languagesEyebrow: "Languages",
      languagesTitle: "语言分布",
      repoCount: "仓库数量",
      rankingEyebrow: "Ranking",
    },
    summaryPanel: {
      eyebrow: "Daily Brief",
      title: "今日中文总结",
    },
    repoCard: {
      readmeSummary: "README 精读",
      recommendationReason: "推荐理由",
      noDescription: "暂无描述",
      unknown: "Unknown",
      stars: "Stars",
      forks: "Forks",
      today: "Today",
    },
    sideNavigation: {
      ariaLabel: "页面位置导航",
      sections: { leaderboard: "排行", charts: "图表", summary: "总结" },
    },
    table: {
      rank: "排名",
      repo: "仓库",
      language: "语言",
      totalStars: "总 Stars",
      forks: "Forks",
      starsToday: "今日 Stars",
      unknown: "Unknown",
    },
    common: {
      backToLeaderboard: "回到排行榜 ↑",
    },
  },
  en: {
    app: {
      title: "GitHub Trending Intelligence",
      description: "Automated GitHub Trending collection, bilingual LLM summaries, and trend visualization.",
      emptyDescription: "No snapshot data yet. Configure DATABASE_URL, CRON_SECRET, and LLM environment variables, then enter the secret below to generate the first brief.",
      observed: "Observed",
      githubAria: "Open GitHub repository",
      repositoriesEyebrow: "Repositories",
      repositoriesTitle: "Trending repositories",
      languageSwitch: "ZH",
      languageSwitchAria: "切换到中文",
      starsTodayTitle: "New Stars Today Top 10",
      totalStarsTitle: "Total Stars Top 10",
    },
    dateSelector: {
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      clear: "Clear",
      today: "Today",
      latest: "Latest",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      selectDate: "Select date",
      monthYear: "{month}/{year}",
    },
    topUtilityMenu: {
      manualUpdate: "Manual update",
      nextRun: "Next run",
      runs: "Run logs",
    },
    updatePanel: {
      eyebrow: "Manual Update",
      title: "Update Trending",
      description: "Enter CRON_SECRET to trigger one collection and summary run from the frontend. The secret is only used for this request.",
      placeholder: "Enter CRON_SECRET",
      missingSecret: "Please enter CRON_SECRET",
      loading: "Fetching GitHub Trending and generating summaries. Please wait...",
      conflict: "An update is already running. Please try again later.",
      failed: "Update failed",
      success: "Update succeeded. {count} repositories were written. The page will refresh shortly.",
      buttonIdle: "Update now",
      buttonLoading: "Updating...",
    },
    nextRun: {
      eyebrow: "Next Run",
      utc: "UTC",
      local: "Local",
    },
    runsPanel: {
      eyebrow: "Runs",
      title: "Recent run logs",
      noMessage: "No message",
      empty: "No run logs yet.",
      timeout: "This task has been running for more than 30 minutes and may have timed out.",
      repo: "Repos",
      snapshot: "Snapshots",
      duration: "Duration",
      started: "Started",
      statuses: { running: "Running", success: "Success", failed: "Failed" },
      triggers: { cron: "Cron", manual: "Manual", script: "Script" },
    },
    leaderboard: {
      eyebrow: "Leaderboard",
      title: "Top {count} repositories",
      description: "Ranked by GitHub Trending today so you can quickly scan heat, language, and new stars.",
      repoCount: "{count} repos",
      jumpToRepo: "Jump to the summary card for {repo}",
    },
    charts: {
      languagesEyebrow: "Languages",
      languagesTitle: "Language distribution",
      repoCount: "Repository count",
      rankingEyebrow: "Ranking",
    },
    summaryPanel: {
      eyebrow: "Daily Brief",
      title: "Today's brief",
    },
    repoCard: {
      readmeSummary: "README summary",
      recommendationReason: "Why it matters",
      noDescription: "No description available",
      unknown: "Unknown",
      stars: "Stars",
      forks: "Forks",
      today: "Today",
    },
    sideNavigation: {
      ariaLabel: "Page section navigation",
      sections: { leaderboard: "Ranking", charts: "Charts", summary: "Brief" },
    },
    table: {
      rank: "Rank",
      repo: "Repository",
      language: "Language",
      totalStars: "Total Stars",
      forks: "Forks",
      starsToday: "Stars Today",
      unknown: "Unknown",
    },
    common: {
      backToLeaderboard: "Back to leaderboard ↑",
    },
  },
} as const;

export type Messages = typeof messages[Locale];
