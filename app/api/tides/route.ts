import { NextResponse } from "next/server";
import { TIDE_STATIONS } from "@/lib/stations";
import type { TideStationData, TidesResponse } from "@/lib/types";

export const revalidate = 360;

const NOAA_BASE =
  "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";

async function fetchStation(
  stationId: string,
  name: string
): Promise<TideStationData> {
  const common = new URLSearchParams({
    date: "today",
    station: stationId,
    datum: "MLLW",
    time_zone: "lst_ldt",
    units: "metric",
    format: "json",
    application: "CalNatureDashboard",
  });

  // Fetch predictions, hi/lo, and water temperature in parallel
  const [intervalRes, hiLoRes, tempRes] = await Promise.all([
    fetch(`${NOAA_BASE}?${common}&product=predictions`),
    fetch(`${NOAA_BASE}?${common}&product=predictions&interval=hilo`),
    fetch(`${NOAA_BASE}?${common}&product=water_temperature`).catch(() => null),
  ]);

  const intervalData = await intervalRes.json();
  const hiLoData = await hiLoRes.json();

  // Water temp: get most recent reading
  let waterTempC: number | null = null;
  if (tempRes && tempRes.ok) {
    try {
      const tempData = await tempRes.json();
      const readings = tempData.data ?? [];
      if (readings.length > 0) {
        const lastReading = readings[readings.length - 1];
        waterTempC = parseFloat(lastReading.v);
        if (isNaN(waterTempC)) waterTempC = null;
      }
    } catch {
      // Some stations don't have water temp sensors
    }
  }

  return {
    stationId,
    name,
    predictions: intervalData.predictions ?? [],
    hiLo: hiLoData.predictions ?? [],
    waterTempC,
  };
}

export async function GET() {
  try {
    const stations = await Promise.all(
      TIDE_STATIONS.map((s) => fetchStation(s.id, s.name))
    );

    const response: TidesResponse = {
      stations,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=360, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Tides API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tide data" },
      { status: 500 }
    );
  }
}
