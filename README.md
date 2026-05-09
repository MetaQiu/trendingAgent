# GitHub Trending Signal Intelligence

AI-powered daily intelligence for GitHub Trending. The system collects trending repositories, reads each repository README, generates bilingual repository-level analysis, produces a daily trend brief, and renders everything as a clean dashboard with rankings, charts, snapshots, run logs, and manual update controls.

> 中文说明见下方「中文文档」。

## Highlights

- Collect GitHub Trending repositories on a schedule or manually.
- Support `daily`, `weekly`, and `monthly` trending windows.
- Support one or more GitHub Trending language dimensions, with `all` as the default.
- Fetch README content for every repository before summarization.
- Generate bilingual LLM output in a single pass:
  - one-line repository positioning
  - README deep summary
  - recommendation reason
  - tags
  - daily overview
  - trend insights
  - top recommendations
- Default UI language is English, with Chinese available through `?locale=zh`.
- Browse historical snapshots with `?date=YYYY-MM-DD`.
- Keep update run logs, including status, trigger, duration, repository count, and fallback state.
- Degrade gracefully when README fetches or LLM calls fail.

## Product positioning

GitHub Trending Signal Intelligence is a lightweight technology radar for open-source discovery. It turns raw GitHub Trending lists into structured signals: what is rising, why it matters, which projects are worth reading, and how the developer ecosystem is shifting day by day.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Anthropic Claude API / OpenAI-compatible API
- Cheerio
- Recharts
- Tailwind CSS

## URL and locale behavior

```text
/                                  Latest snapshot, English UI
/?date=2026-05-09                  Specific date, English UI
/?locale=zh                        Latest snapshot, Chinese UI
/?date=2026-05-09&locale=zh        Specific date, Chinese UI
```

Notes:

- `locale` controls the UI language only.
- `language` is reserved for the GitHub Trending source language and must not be used as the UI locale.
- English is the default UI language.
- Chinese mode keeps `locale=zh` while switching dates.

## LLM output fields

Repository-level summaries are stored on `TrendingRepo`:

```text
summary / summaryEn
readmeSummary / readmeSummaryEn
recommendationReason / recommendationReasonEn
tagsJson / tagsJsonEn
```

Daily summaries are stored on `TrendingSnapshot` and `insightsJson`:

```text
summary / summaryEn
insightsJson.dailySummary / insightsJson.dailySummaryEn
insightsJson.trendInsights / insightsJson.trendInsightsEn
insightsJson.topRecommendations / insightsJson.topRecommendationsEn
```

Older snapshots without English fields still render safely. English pages prefer English fields first and fall back to existing Chinese or neutral UI placeholders when needed.

## Project structure

```text
src/
  app/                         Next.js pages and API routes
    api/cron/update-trending/  Manual / cron update endpoint
    api/trending/              Trending snapshot query endpoint
    dashboard/                 Trend dashboard
    trending/[date]/           Date snapshot detail page
  components/                  UI components
  lib/
    agent/                     Trending Agent workflow, prompts, schemas
    github/                    GitHub Trending and README fetching
    llm/                       Anthropic / OpenAI-compatible LLM providers
    db.ts                      Prisma Client
    i18n.ts                    Lightweight UI i18n dictionary and URL helpers
    metrics.ts                 Trend metric calculations
  types/                       Shared TypeScript types
prisma/
  schema.prisma                Data model
scripts/
  update-trending.ts           CLI update script
```

## Environment variables

### Required

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
CRON_SECRET="your-secret"
```

### Anthropic provider

Anthropic is the default provider.

```env
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_MODEL="claude-opus-4-6"
```

### OpenAI-compatible provider

```env
LLM_PROVIDER="openai-compatible"
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://example.com/v1"
OPENAI_MODEL="your-model"
```

### GitHub and runtime options

```env
GITHUB_TOKEN="your-github-token"
GITHUB_TRENDING_LANGUAGES="all"
GITHUB_TRENDING_SINCE="daily"

README_FETCH_TIMEOUT_MS=3000
README_MAX_CHARS=8000
REPO_LLM_CONCURRENCY=5
REPO_LLM_TIMEOUT_MS=12000
DAILY_SUMMARY_TIMEOUT_MS=30000
```

Notes:

- `GITHUB_TOKEN` is optional but recommended for better GitHub API stability.
- `GITHUB_TRENDING_LANGUAGES` supports comma-separated values such as `all,typescript,python`.
- `GITHUB_TRENDING_SINCE` supports `daily`, `weekly`, and `monthly`.

## Local development

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run dev
```

Visit:

```text
http://localhost:3000
```

## Updating Trending data

### Manual update from UI

Open the home page, click the manual update control, enter `CRON_SECRET`, and trigger one collection and summarization run.

### Manual update from API

```bash
curl -H "Authorization: Bearer your-secret" \
  "http://localhost:3000/api/cron/update-trending?trigger=manual"
```

### CLI update

```bash
npm run update:trending
```

## Build and checks

```bash
npm run lint
npm run build
npm run start
```

## Deployment notes

When deploying to Vercel or another platform, configure PostgreSQL and the environment variables above.

Before building, make sure the database schema is synchronized:

```bash
npx prisma db push && npm run build
```

The cron/manual update endpoint is:

```text
/api/cron/update-trending
```

It requires:

```text
Authorization: Bearer <CRON_SECRET>
```

## Workflow

1. Fetch GitHub Trending repository lists.
2. Fetch README content for each repository.
3. Call the configured LLM for each repository to generate bilingual README analysis.
4. Call the configured LLM once for the daily bilingual trend brief.
5. Persist data to PostgreSQL:
   - `TrendingSnapshot`
   - `TrendingRepo`
   - `TrendingUpdateRun`
6. Render the latest snapshot, date selector, leaderboard, charts, daily brief, repository cards, and run logs.

## Fault tolerance

- README fetch failure does not stop the update run.
- A single repository LLM failure only falls back that repository.
- Daily summary LLM failure falls back to a rule-based bilingual summary.
- GitHub Trending fetch failure or database write failure fails the update run.

---

# 中文文档

# GitHub Trending 技术雷达

一个面向开发者和技术观察者的 GitHub Trending 智能情报面板。系统会定时抓取 GitHub Trending 仓库，逐仓库读取 README，使用 LLM 生成中英文双语精读总结，并聚合为每日趋势洞察、推荐项目和可视化图表。

## 功能特性

- 自动或手动抓取 GitHub Trending 仓库列表。
- 支持 `daily` / `weekly` / `monthly` 趋势周期。
- 支持按 GitHub Trending 语言维度抓取，默认 `all`。
- 每个仓库单独抓取 README 后再总结。
- 单次 LLM 调用生成中英文双语内容：
  - 一句话项目定位
  - README 精读总结
  - 推荐理由
  - 标签
  - 每日趋势总览
  - 趋势洞察
  - 推荐项目
- 默认英文 UI，可通过 `?locale=zh` 切换中文。
- 支持通过 `?date=YYYY-MM-DD` 查看历史快照。
- 保存更新运行日志，展示状态、触发方式、耗时、仓库数量和降级情况。
- README 或 LLM 局部失败时自动降级，不影响整体展示。

## 产品定位

GitHub Trending 技术雷达不是简单的榜单镜像，而是把原始 Trending 列表转化为结构化技术信号：哪些项目正在升温、为什么值得关注、适合谁阅读，以及开发者生态正在出现哪些方向性变化。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 7
- PostgreSQL
- Anthropic Claude API / OpenAI-compatible API
- Cheerio
- Recharts
- Tailwind CSS

## URL 与语言规则

```text
/                                  最新快照，英文 UI
/?date=2026-05-09                  指定日期，英文 UI
/?locale=zh                        最新快照，中文 UI
/?date=2026-05-09&locale=zh        指定日期，中文 UI
```

说明：

- `locale` 只控制 UI 语言。
- `language` 保留给 GitHub Trending 抓取语言维度，不作为 UI 语言参数。
- 英文是默认 UI 语言。
- 中文模式切换日期时会保留 `locale=zh`。

## LLM 双语字段

仓库级内容保存在 `TrendingRepo`：

```text
summary / summaryEn
readmeSummary / readmeSummaryEn
recommendationReason / recommendationReasonEn
tagsJson / tagsJsonEn
```

每日汇总保存在 `TrendingSnapshot` 和 `insightsJson`：

```text
summary / summaryEn
insightsJson.dailySummary / insightsJson.dailySummaryEn
insightsJson.trendInsights / insightsJson.trendInsightsEn
insightsJson.topRecommendations / insightsJson.topRecommendationsEn
```

历史快照没有英文字段时也能安全展示。英文页面会优先显示英文字段，没有时降级到已有中文内容或通用占位文案。

## 项目结构

```text
src/
  app/                         Next.js 页面与 API Routes
    api/cron/update-trending/  手动 / Cron 更新接口
    api/trending/              Trending 快照查询接口
    dashboard/                 趋势仪表盘
    trending/[date]/           日期快照详情页
  components/                  页面组件
  lib/
    agent/                     Trending Agent 主流程、Prompt、Schema
    github/                    GitHub Trending 和 README 抓取
    llm/                       Anthropic / OpenAI-compatible LLM Provider
    db.ts                      Prisma Client
    i18n.ts                    轻量 UI 国际化字典和 URL 工具
    metrics.ts                 趋势指标计算
  types/                       共享类型
prisma/
  schema.prisma                数据模型
scripts/
  update-trending.ts           命令行更新脚本
```

## 环境变量

### 必需

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
CRON_SECRET="your-secret"
```

### Anthropic Provider

默认使用 Anthropic：

```env
LLM_PROVIDER="anthropic"
ANTHROPIC_API_KEY="your-anthropic-api-key"
ANTHROPIC_MODEL="claude-opus-4-6"
```

### OpenAI-compatible Provider

如果使用 OpenAI-compatible 接口：

```env
LLM_PROVIDER="openai-compatible"
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://example.com/v1"
OPENAI_MODEL="your-model"
```

### GitHub 与运行参数

```env
GITHUB_TOKEN="your-github-token"
GITHUB_TRENDING_LANGUAGES="all"
GITHUB_TRENDING_SINCE="daily"

README_FETCH_TIMEOUT_MS=3000
README_MAX_CHARS=8000
REPO_LLM_CONCURRENCY=5
REPO_LLM_TIMEOUT_MS=12000
DAILY_SUMMARY_TIMEOUT_MS=30000
```

说明：

- `GITHUB_TOKEN` 可选，但建议配置，用于提高 GitHub API 访问稳定性。
- `GITHUB_TRENDING_LANGUAGES` 支持逗号分隔，例如 `all,typescript,python`。
- `GITHUB_TRENDING_SINCE` 可选值：`daily`、`weekly`、`monthly`。

## 本地开发

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run dev
```

访问：

```text
http://localhost:3000
```

## 更新 Trending 数据

### 前端手动更新

打开首页，在手动更新面板中输入 `CRON_SECRET`，即可触发一次抓取和总结。

### API 手动更新

```bash
curl -H "Authorization: Bearer your-secret" \
  "http://localhost:3000/api/cron/update-trending?trigger=manual"
```

### 命令行更新

```bash
npm run update:trending
```

## 构建与检查

```bash
npm run lint
npm run build
npm run start
```

## 部署说明

部署到 Vercel 或其它平台时，需要配置 PostgreSQL 和上述环境变量。

推荐构建前确保数据库 schema 已同步：

```bash
npx prisma db push && npm run build
```

Cron 或手动更新接口：

```text
/api/cron/update-trending
```

该接口需要：

```text
Authorization: Bearer <CRON_SECRET>
```

## 工作流程

1. 抓取 GitHub Trending 仓库列表。
2. 对每个仓库抓取 README。
3. 每个仓库单独调用 LLM 生成中英文 README 精读总结。
4. 基于仓库基础信息和单仓库总结生成中英文每日趋势日报。
5. 写入 PostgreSQL：
   - `TrendingSnapshot`
   - `TrendingRepo`
   - `TrendingUpdateRun`
6. 前端展示最新快照、日期选择器、排行榜、图表、日报、仓库卡片和运行日志。

## 容错策略

- README 抓取失败不会中断任务。
- 单仓库 LLM 失败只降级当前仓库。
- 日报聚合 LLM 失败时使用规则生成的中英文 fallback。
- Trending 列表抓取失败或数据库写入失败才会导致更新任务失败。

## 作者

MADE WITH ❤ BY [METAQIU](https://metaqiu.cn/)
