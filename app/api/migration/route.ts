import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/api";
import { cached } from "@/lib/cache";
import type { MigrationResponse } from "@/lib/types";

// Force dynamic so Vercel never edge-caches stale empty responses.
// The in-memory cache handles the long TTL (6h) for valid data.
export const dynamic = "force-dynamic";

const EBIRD_BASE = "https://api.ebird.org/v2";

interface DayStat {
  date: string;
  numSpecies: number;
  numChecklists: number;
  numContributors: number;
}

async function fetchDayStat(
  apiKey: string,
  y: number,
  m: number,
  d: number,
  date: string
): Promise<DayStat> {
  try {
    const res = await fetchWithRetry(
      `${EBIRD_BASE}/product/stats/US-CA/${y}/${m}/${d}`,
      { headers: { "X-eBirdApiToken": apiKey } }
    );
    if (!res.ok) return { date, numSpecies: 0, numChecklists: 0, numContributors: 0 };
    const data = await res.json();
    return {
      date,
      numSpecies: data.numSpecies ?? 0,
      numChecklists: data.numChecklists ?? 0,
      numContributors: data.numContributors ?? 0,
    };
  } catch {
    return { date, numSpecies: 0, numChecklists: 0, numContributors: 0 };
  }
}

async function fetchMigrationData(): Promise<MigrationResponse> {
  const apiKey = process.env.EBIRD_API_KEY;

  if (!apiKey) {
    return { stats: [], today: null, avg7d: 0, fetchedAt: new Date().toISOString() };
  }

  // Use California time, not UTC, to determine "today"
  const caFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const caParts = caFormatter.formatToParts(new Date());
  const caYear = parseInt(caParts.find((p) => p.type === "year")!.value);
  const caMonth = parseInt(caParts.find((p) => p.type === "month")!.value);
  const caDay = parseInt(caParts.find((p) => p.type === "day")!.value);
  const now = new Date(caYear, caMonth - 1, caDay);

  const days: { y: number; m: number; d: number; date: string }[] = [];

  for (let i = 0; i < 30; i++) {
    const dt = new Date(now);
    dt.setDate(dt.getDate() - i);
    days.push({
      y: dt.getFullYear(),
      m: dt.getMonth() + 1,
      d: dt.getDate(),
      date: dt.toISOString().split("T")[0],
    });
  }

  // Batch in groups of 10 to avoid rate limiting
  const results: DayStat[] = [];
  for (let batch = 0; batch < days.length; batch += 10) {
    const chunk = days.slice(batch, batch + 10);
    const batchResults = await Promise.all(
      chunk.map((d) => fetchDayStat(apiKey, d.y, d.m, d.d, d.date))
    );
    results.push(...batchResults);
  }

  const stats = results.reverse();
  // Use the most recent day with actual data (today might not be aggregated yet)
  const today = [...stats].reverse().find((d) => d.numSpecies > 0) ?? stats[stats.length - 1] ?? null;
  const last7 = stats.slice(-7);
  const avg7d = last7.length > 0
    ? Math.round(last7.reduce((s, d) => s + d.numSpecies, 0) / last7.length)
    : 0;

  return {
    stats,
    today,
    avg7d,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  try {
    const data = forceRefresh
      ? await fetchMigrationData()
      : await cached(
          "migration",
          21600,
          fetchMigrationData,
          (d) => !d.today || d.today.numSpecies === 0
        );
    const isValid = data.today && data.today.numSpecies > 0;
    const maxAge = isValid ? 21600 : 60;
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": forceRefresh
          ? "no-store"
          : `public, s-maxage=${maxAge}, stale-while-revalidate=60`,
      },
    });
  } catch (error) {
    console.error("Migration API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch migration data" },
      { status: 500 }
    );
  }
}
