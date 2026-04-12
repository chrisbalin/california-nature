import { NextResponse } from "next/server";
import { RIVER_SITES } from "@/lib/stations";
import type { RiverSiteData, RiversResponse } from "@/lib/types";

export const revalidate = 900;

const USGS_BASE = "https://waterservices.usgs.gov/nwis/iv/";
const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

interface USGSTimeSeries {
  sourceInfo: { siteCode: Array<{ value: string }> };
  variable: { variableCode: Array<{ value: string }> };
  values: Array<{ value: Array<{ value: string; dateTime: string }> }>;
}

export async function GET() {
  try {
    const siteIds = RIVER_SITES.map((s) => s.id).join(",");

    // Fetch USGS discharge + water temp
    const usgsParams = new URLSearchParams({
      sites: siteIds,
      parameterCd: "00060,00010",
      period: "P7D",
      format: "json",
    });

    // Fetch air temp at each gauge location from Open-Meteo (fallback for stations without sensors)
    const lats = RIVER_SITES.map((s) => s.lat).join(",");
    const lngs = RIVER_SITES.map((s) => s.lng).join(",");
    const meteoParams = new URLSearchParams({
      latitude: lats,
      longitude: lngs,
      current: "temperature_2m",
      timezone: "America/Los_Angeles",
      forecast_days: "1",
    });

    const [usgsRes, meteoRes] = await Promise.all([
      fetch(`${USGS_BASE}?${usgsParams}`),
      fetch(`${OPEN_METEO_BASE}?${meteoParams}`).catch(() => null),
    ]);

    const usgsRaw = await usgsRes.json();
    const timeSeries: USGSTimeSeries[] = usgsRaw?.value?.timeSeries ?? [];

    // Parse Open-Meteo air temps
    let airTemps: (number | null)[] = RIVER_SITES.map(() => null);
    if (meteoRes && meteoRes.ok) {
      try {
        const meteoRaw = await meteoRes.json();
        const results = Array.isArray(meteoRaw) ? meteoRaw : [meteoRaw];
        airTemps = results.map((r) => r?.current?.temperature_2m ?? null);
      } catch { /* ignore */ }
    }

    const sites: RiverSiteData[] = RIVER_SITES.map((site, i) => {
      const dischargeSeries = timeSeries.find(
        (ts) =>
          ts.sourceInfo?.siteCode?.[0]?.value === site.id &&
          ts.variable?.variableCode?.[0]?.value === "00060"
      );

      const tempSeries = timeSeries.find(
        (ts) =>
          ts.sourceInfo?.siteCode?.[0]?.value === site.id &&
          ts.variable?.variableCode?.[0]?.value === "00010"
      );

      const readings = dischargeSeries?.values?.[0]?.value ?? [];
      const validReadings = readings.filter((r) => parseFloat(r.value) >= 0);

      const currentFlow =
        validReadings.length > 0
          ? parseFloat(validReadings[validReadings.length - 1].value)
          : null;

      // Prefer USGS in-stream temp, fall back to Open-Meteo air temp
      let waterTempC: number | null = null;
      const tempReadings = tempSeries?.values?.[0]?.value ?? [];
      if (tempReadings.length > 0) {
        const lastTemp = parseFloat(tempReadings[tempReadings.length - 1].value);
        if (!isNaN(lastTemp) && lastTemp > -50 && lastTemp < 50) {
          waterTempC = lastTemp;
        }
      }

      // If no USGS temp, use air temp as estimate
      if (waterTempC === null && airTemps[i] !== null) {
        waterTempC = airTemps[i];
      }

      return {
        siteId: site.id,
        name: site.name,
        river: site.river,
        discharge: validReadings.map((r) => ({
          value: r.value,
          dateTime: r.dateTime,
        })),
        currentFlow,
        waterTempC,
      };
    });

    const response: RiversResponse = {
      sites,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Rivers API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch river data" },
      { status: 500 }
    );
  }
}
