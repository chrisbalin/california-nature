import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import type { SnowpackResponse, SnowpackZone } from "@/lib/types";

export const revalidate = 3600;

const CDEC_BASE = "https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet";

// Sierra snow stations grouped by zone with approximate coordinates
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

async function fetchSnowpackData(): Promise<SnowpackResponse> {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const startStr = twoDaysAgo.toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const endStr = yesterday.toISOString().split("T")[0];

  // Fetch all stations at once
  const allStationIds = Object.values(SNOW_STATIONS)
    .flatMap((z) => z.stations)
    .join(",");

  let stationValues = new Map<string, number>();

  try {
    // Fetch each station individually to avoid CDEC parsing issues
    const results = await Promise.all(
      Object.values(SNOW_STATIONS)
        .flatMap((z) => z.stations)
        .map(async (id) => {
          try {
            const res = await fetch(
              `${CDEC_BASE}?Stations=${id}&SensorNums=3&dur_code=D&Start=${startStr}&End=${endStr}`
            );
            const data = await res.json();
            const valid = (data as Array<{ stationId: string; value: number }>)
              .filter((e) => e.value > 0)
              .pop();
            return { id, swe: valid?.value ?? 0 };
          } catch {
            return { id, swe: 0 };
          }
        })
    );

    for (const r of results) {
      if (r.swe > 0) stationValues.set(r.id, r.swe);
    }
  } catch {
    // If fetch fails entirely, return empty
  }

  const zones: SnowpackZone[] = Object.values(SNOW_STATIONS).map((zone) => {
    const values = zone.stations
      .map((id) => stationValues.get(id))
      .filter((v): v is number => v !== undefined && v > 0);

    const avgSwe = values.length > 0
      ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
      : 0;

    return {
      name: zone.name,
      avgSweInches: avgSwe,
      stationCount: values.length,
      lat: zone.lat,
      lng: zone.lng,
    };
  });

  const allValues = zones.filter((z) => z.avgSweInches > 0);
  const statewideAvg = allValues.length > 0
    ? Math.round((allValues.reduce((s, z) => s + z.avgSweInches, 0) / allValues.length) * 10) / 10
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
