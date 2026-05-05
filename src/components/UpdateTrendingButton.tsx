"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type UpdateResult = {
  ok?: boolean;
  error?: string;
  run?: {
    id: string;
    status: string;
    message: string | null;
    errorMessage: string | null;
    repoCount: number;
    durationMs: number | null;
  } | null;
  results?: Array<{
    date: string;
    language: string;
    since: string;
    repoCount: number;
    fallback: boolean;
    error?: string;
  }>;
};

export function UpdateTrendingButton() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function updateTrending() {
    const token = secret.trim();
    if (!token) {
      setStatus("error");
      setMessage("请输入 CRON_SECRET");
      return;
    }

    setStatus("loading");
    setMessage("正在抓取 GitHub Trending 并生成总结，请稍候...");

    try {
      const response = await fetch("/api/cron/update-trending?trigger=manual", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = (await response.json()) as UpdateResult;

      if (!response.ok || !data.ok) {
        const message = response.status === 409
          ? "已有更新任务正在运行，请稍后再试"
          : data.run?.message || data.run?.errorMessage || data.error || "更新失败";
        throw new Error(message);
      }

      const repoCount = data.run?.repoCount ?? data.results?.reduce((sum, item) => sum + item.repoCount, 0) ?? 0;
      setStatus("success");
      setMessage(data.run?.message || `更新成功，共写入 ${repoCount} 个仓库。页面即将刷新。`);
      setSecret("");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "更新失败");
      router.refresh();
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm">
      <h2 className="text-xl font-semibold">手动更新 Trending</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        输入 Vercel 中配置的 CRON_SECRET 后，可直接从前端触发一次抓取和总结。密钥只会用于本次请求，不会保存到页面。
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-full border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          placeholder="输入 CRON_SECRET"
          autoComplete="off"
        />
        <button
          className="rounded-full bg-slate-950 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          type="button"
          onClick={updateTrending}
          disabled={status === "loading"}
        >
          {status === "loading" ? "更新中..." : "立即更新"}
        </button>
      </div>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : status === "success" ? "text-green-700" : "text-slate-600"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
