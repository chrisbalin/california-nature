import { NextResponse } from "next/server";
import { RIVER_SITES } from "@/lib/stations";
import type { RiverPrecipResponse, RiverPrecipSite } from "@/lib/types";

export const revalidate = 3600;

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

export async function GET() {
  try {
    const lats = RIVER_SITES.map((s) => s.lat).join(",");
    const lngs = RIVER_SITES.map((s) => s.lng).join(",");

    const params = new URLSearchParams({
      latitude: lats,
      longitude: lngs,
      daily: "precipitation_sum",
      timezone: "America/Los_Angeles",
      past_days: "7",
      forecast_days: "0",
    });

    const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
    const raw = await res.json();

    const results = Array.isArray(raw) ? raw : [raw];

    const sites: RiverPrecipSite[] = RIVER_SITES.map((site, i) => {
      const dailyPrecip: number[] = results[i]?.daily?.precipitation_sum ?? [];
      return {
        siteId: site.id,
        dailyPrecipMm: dailyPrecip,
      };
    });

    const response: RiverPrecipResponse = {
      sites,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Precip API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch precipitation data" },
      { status: 500 }
    );
  }
}
