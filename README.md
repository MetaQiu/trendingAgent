# GitHub Trending 智能总结

一个面向开发者的 GitHub Trending 中文总结与可视化项目。系统会定时抓取 GitHub Trending 仓库，对每个仓库读取 README 并单独调用 LLM 生成中文精读总结，同时生成每日趋势日报、推荐理由和可视化图表。

## 功能特性

- 自动抓取 GitHub Trending 仓库列表
- 支持 daily / weekly / monthly 趋势周期
- 支持按语言抓取，默认抓取 all
- 逐仓库抓取 README
- 每个仓库单独调用 LLM 生成：
  - 一句话简介
  - README 精读总结
  - 推荐理由
  - 标签
- 生成每日中文趋势总结和推荐项目
- 单仓库 LLM 失败时自动降级，不影响整体更新
- 保存更新运行日志，展示成功、失败、耗时和降级状态
- 前端展示仓库卡片、趋势图表、日期快照和手动更新入口

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

安装依赖：

```bash
npm install
```

生成 Prisma Client：

```bash
npm run prisma:generate
```

启动开发服务器：

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

## 数据库初始化

同步 Prisma schema 到数据库：

```bash
npx prisma db push
```

生成 Prisma Client：

```bash
npm run prisma:generate
```

## 更新 Trending 数据

### 前端手动更新

打开首页，在“手动更新 Trending”区域输入 `CRON_SECRET`，即可触发一次抓取和总结。

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

运行 ESLint：

```bash
npm run lint
```

生产构建：

```bash
npm run build
```

启动生产服务：

```bash
npm run start
```

## 部署说明

部署到 Vercel 时，需要配置数据库和上述环境变量。

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
3. 每个仓库单独调用 LLM 生成 README 精读总结。
4. 基于仓库基础信息和单仓库总结生成每日趋势日报。
5. 写入 PostgreSQL：
   - `TrendingSnapshot`
   - `TrendingRepo`
   - `TrendingUpdateRun`
6. 前端展示最新快照、仓库卡片、趋势图表和运行日志。

## 容错策略

- README 抓取失败不会中断任务。
- 单仓库 LLM 失败只降级当前仓库。
- 日报聚合 LLM 失败时使用规则 fallback。
- Trending 列表抓取失败或数据库写入失败才会导致更新任务失败。

## 作者

MADE WITH ❤ BY [METAQIU](https://metaqiu.cn/)
