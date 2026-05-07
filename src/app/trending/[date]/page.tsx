import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TrendingDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  redirect(`/?date=${date}`);
}
