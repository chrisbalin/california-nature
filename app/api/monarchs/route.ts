import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/api";
import { cached } from "@/lib/cache";
import type { MonarchResponse, MonarchMonthCount } from "@/lib/types";

export const revalidate = 3600;

const INAT_BASE = "https://api.inaturalist.org/v1/observations";
const TAXON_ID = 48662;
const PLACE_ID = 14;

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Fetch observation count for a date range */
async function fetchCount(d1: string, d2: string): Promise<number> {
  const params = new URLSearchParams({
    taxon_id: TAXON_ID.toString(),
    place_id: PLACE_ID.toString(),
    d1, d2,
    quality_grade: "research",
    per_page: "0",
  });
  const res = await fetchWithRetry(`${INAT_BASE}?${params}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.total_results ?? 0;
}

/** Fetch observations with lat/lng for a date range (sample of 50) */
async function fetchObservations(d1: string, d2: string): Promise<{ lat: number; lng: number }[]> {
  const params = new URLSearchParams({
    taxon_id: TAXON_ID.toString(),
    place_id: PLACE_ID.toString(),
    d1, d2,
    quality_grade: "research",
    per_page: "50",
    order: "desc",
    order_by: "observed_on",
  });
  const res = await fetchWithRetry(`${INAT_BASE}?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? [])
    .filter((o: { location?: string }) => o.location)
    .map((o: { location: string }) => {
      const [lat, lng] = o.location.split(",").map(Number);
      return { lat, lng };
    })
    .filter((o: { lat: number; lng: number }) => o.lat !== 0 && o.lng !== 0);
}

async function fetchMonarchData(): Promise<MonarchResponse> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Build 12 month date ranges
    const monthRanges: { d1: string; d2: string; month: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const y = date.getFullYear();
      const m = date.getMonth();
      const d1 = `${y}-${String(m + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m + 1, 0).getDate();
      const d2 = `${y}-${String(m + 1).padStart(2, "0")}-${lastDay}`;
      monthRanges.push({ d1, d2, month: `${y}-${String(m + 1).padStart(2, "0")}`, label: MONTH_LABELS[m] });
    }

    // This week + same week last year
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeekD1 = weekStart.toISOString().split("T")[0];
    const thisWeekD2 = now.toISOString().split("T")[0];
    const lastYearWeekStart = new Date(weekStart);
    lastYearWeekStart.setFullYear(lastYearWeekStart.getFullYear() - 1);
    const lastYearWeekEnd = new Date(now);
    lastYearWeekEnd.setFullYear(lastYearWeekEnd.getFullYear() - 1);
    const lyD1 = lastYearWeekStart.toISOString().split("T")[0];
    const lyD2 = lastYearWeekEnd.toISOString().split("T")[0];

    // Batch 1: all counts (14 lightweight calls)
    const countResults = await Promise.all([
      ...monthRanges.map((r) => fetchCount(r.d1, r.d2)),
      fetchCount(thisWeekD1, thisWeekD2),
      fetchCount(lyD1, lyD2),
    ]);

    const monthlyCounts12 = countResults.slice(0, 12) as number[];
    const thisWeekCount = countResults[12] as number;
    const lastYearSameWeekCount = countResults[13] as number;

    // Batch 2+3: observations in groups of 6 to stay under rate limit
    const obsResults1 = await Promise.all(
      monthRanges.slice(0, 6).map((r) => fetchObservations(r.d1, r.d2))
    );
    const obsResults2 = await Promise.all(
      monthRanges.slice(6).map((r) => fetchObservations(r.d1, r.d2))
    );
    const allObs = [...obsResults1, ...obsResults2];

    const monthlyCounts: MonarchMonthCount[] = monthRanges.map((r, i) => ({
      month: r.month,
      label: r.label,
      count: monthlyCounts12[i],
      observations: allObs[i],
    }));
    const currentMonthCount = monthlyCounts[monthlyCounts.length - 1]?.count ?? 0;

    const response: MonarchResponse = {
      monthlyCounts,
      currentMonthCount,
      thisWeekCount,
      lastYearSameWeekCount,
      fetchedAt: new Date().toISOString(),
    };

    return response;
}

export async function GET() {
  try {
    const data = await cached(
      "monarchs",
      3600,
      fetchMonarchData,
      (d) => !d.monthlyCounts || d.monthlyCounts.length === 0
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Monarchs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monarch data" },
      { status: 500 }
    );
  }
}
