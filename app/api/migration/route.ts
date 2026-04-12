import { NextResponse } from "next/server";

export const revalidate = 21600;

const EBIRD_BASE = "https://api.ebird.org/v2";

interface DayStat {
  date: string; // YYYY-MM-DD
  numSpecies: number;
  numChecklists: number;
  numContributors: number;
}

export interface MigrationResponse {
  stats: DayStat[];
  today: DayStat | null;
  avg7d: number;
  fetchedAt: string;
}

export async function GET() {
  const apiKey = process.env.EBIRD_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { stats: [], today: null, avg7d: 0, fetchedAt: new Date().toISOString(), error: "EBIRD_API_KEY not configured" },
      { status: 200 }
    );
  }

  try {
    const now = new Date();
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

    // Fetch all 30 days in parallel (eBird stats endpoint is fast)
    const results = await Promise.all(
      days.map(async ({ y, m, d, date }) => {
        try {
          const res = await fetch(
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
      })
    );

    // Reverse so oldest is first (chronological order for sparkline)
    const stats = results.reverse();

    const today = stats[stats.length - 1] ?? null;

    // 7-day average species count
    const last7 = stats.slice(-7);
    const avg7d = last7.length > 0
      ? Math.round(last7.reduce((s, d) => s + d.numSpecies, 0) / last7.length)
      : 0;

    const response: MigrationResponse = {
      stats,
      today,
      avg7d,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" }, // 6h cache
    });
  } catch (error) {
    console.error("Migration API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch migration data" },
      { status: 500 }
    );
  }
}
