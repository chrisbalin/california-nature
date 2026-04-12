import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import type { SnowpackResponse, SnowpackZone } from "@/lib/types";

export const revalidate = 3600;

const CDEC_BASE = "https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SNOW_STATIONS = {
  northern: {
    name: "Northern Sierra",
    lat: 39.6,
    lng: -120.4,
    stations: ["KTL", "HMB", "MRL", "GRZ", "GKS", "CSL"],
  },
  central: {
    name: "Central Sierra",
    lat: 38.6,
    lng: -119.9,
    stations: ["BKL", "SLI", "SDW", "HYS"],
  },
  southern: {
    name: "Southern Sierra",
    lat: 37.5,
    lng: -119.2,
    stations: ["TNY", "SDF", "PLP"],
  },
};

interface StationData {
  id: string;
  currentSwe: number;
  peakSwe: number;
  peakDate: string;
}

async function fetchStationData(id: string): Promise<StationData> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const endStr = yesterday.toISOString().split("T")[0];
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const recentStart = twoDaysAgo.toISOString().split("T")[0];

  // Past year for peak
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const yearStart = yearAgo.toISOString().split("T")[0];

  try {
    // Fetch current + past year in parallel
    const [currentRes, yearRes] = await Promise.all([
      fetch(`${CDEC_BASE}?Stations=${id}&SensorNums=3&dur_code=D&Start=${recentStart}&End=${endStr}`),
      fetch(`${CDEC_BASE}?Stations=${id}&SensorNums=3&dur_code=D&Start=${yearStart}&End=${endStr}`),
    ]);

    const currentData = await currentRes.json();
    const yearData = await yearRes.json();

    const validCurrent = (currentData as Array<{ value: number }>)
      .filter((e) => e.value > 0)
      .pop();

    const validYear = (yearData as Array<{ value: number; date: string }>)
      .filter((e) => e.value > 0);
    const peak = validYear.length > 0
      ? validYear.reduce((max, e) => e.value > max.value ? e : max, validYear[0])
      : null;

    return {
      id,
      currentSwe: validCurrent?.value ?? 0,
      peakSwe: peak?.value ?? 0,
      peakDate: peak?.date ?? "",
    };
  } catch {
    return { id, currentSwe: 0, peakSwe: 0, peakDate: "" };
  }
}

function formatPeakMonth(dateStr: string): string {
  if (!dateStr) return "";
  // CDEC dates look like "2025-4-12 00:00"
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  const month = parseInt(parts[1]) - 1;
  const year = parts[0];
  return `${MONTH_NAMES[month]} ${year}`;
}

async function fetchSnowpackData(): Promise<SnowpackResponse> {
  const allStations = Object.values(SNOW_STATIONS).flatMap((z) => z.stations);

  // Fetch all stations — batched to avoid rate limits
  const stationData = new Map<string, StationData>();
  const batch1 = allStations.slice(0, 7);
  const batch2 = allStations.slice(7);

  const results1 = await Promise.all(batch1.map(fetchStationData));
  const results2 = await Promise.all(batch2.map(fetchStationData));

  for (const r of [...results1, ...results2]) {
    stationData.set(r.id, r);
  }

  const zones: SnowpackZone[] = Object.values(SNOW_STATIONS).map((zone) => {
    const stationsWithData = zone.stations
      .map((id) => stationData.get(id))
      .filter((s): s is StationData => s !== undefined && s.currentSwe > 0);

    const avgSwe = stationsWithData.length > 0
      ? Math.round((stationsWithData.reduce((s, d) => s + d.currentSwe, 0) / stationsWithData.length) * 10) / 10
      : 0;

    // Peak across all stations in the zone
    const allPeaks = zone.stations
      .map((id) => stationData.get(id))
      .filter((s): s is StationData => s !== undefined && s.peakSwe > 0);

    const avgPeak = allPeaks.length > 0
      ? Math.round((allPeaks.reduce((s, d) => s + d.peakSwe, 0) / allPeaks.length) * 10) / 10
      : null;

    // Use the peak date from the station with the highest peak
    const topPeak = allPeaks.length > 0
      ? allPeaks.reduce((max, d) => d.peakSwe > max.peakSwe ? d : max, allPeaks[0])
      : null;

    return {
      name: zone.name,
      avgSweInches: avgSwe,
      peakSweInches: avgPeak,
      peakMonth: topPeak ? formatPeakMonth(topPeak.peakDate) : null,
      stationCount: stationsWithData.length,
      lat: zone.lat,
      lng: zone.lng,
    };
  });

  const allValid = zones.filter((z) => z.avgSweInches > 0);
  const statewideAvg = allValid.length > 0
    ? Math.round((allValid.reduce((s, z) => s + z.avgSweInches, 0) / allValid.length) * 10) / 10
    : 0;

  return {
    zones,
    statewideAvgSwe: statewideAvg,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const data = await cached(
      "snowpack",
      3600,
      fetchSnowpackData,
      (d) => d.zones.every((z) => z.avgSweInches === 0)
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Snowpack API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch snowpack data" },
      { status: 500 }
    );
  }
}
