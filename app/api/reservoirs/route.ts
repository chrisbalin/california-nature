import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { RESERVOIRS } from "@/lib/stations";
import type { ReservoirData, ReservoirsResponse } from "@/lib/types";

export const revalidate = 3600;

const CDEC_BASE = "https://cdec.water.ca.gov/dynamicapp/req/JSONDataServlet";

async function fetchReservoirData(): Promise<ReservoirsResponse> {
  // Fetch 2 days ago to ensure data is available (CDEC lags)
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const startStr = twoDaysAgo.toISOString().split("T")[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const endStr = yesterday.toISOString().split("T")[0];

  // Fetch each reservoir individually to avoid CDEC parsing issues
  const results = await Promise.all(
    RESERVOIRS.map(async (r) => {
      try {
        const params = new URLSearchParams({
          Stations: r.id,
          SensorNums: "15",
          dur_code: "D",
          Start: startStr,
          End: endStr,
        });
        const res = await fetch(`${CDEC_BASE}?${params}`);
        const data = await res.json();
        // Get the most recent valid reading
        const valid = (data as Array<{ stationId: string; value: number }>)
          .filter((e) => e.value > 0)
          .pop();
        return { id: r.id, storage: valid?.value ?? 0 };
      } catch {
        return { id: r.id, storage: 0 };
      }
    })
  );

  const storageMap = new Map<string, number>();
  for (const r of results) {
    if (r.storage > 0) storageMap.set(r.id, r.storage);
  }

  const reservoirs: ReservoirData[] = RESERVOIRS.map((r) => {
    const current = storageMap.get(r.id) ?? 0;
    return {
      id: r.id,
      name: r.name,
      storageCurrent: current,
      storageCapacity: r.capacity,
      percentFull: r.capacity > 0 ? Math.round((current / r.capacity) * 100) : 0,
      lat: r.lat,
      lng: r.lng,
    };
  }).filter((r) => r.storageCurrent > 0);

  return {
    reservoirs,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const data = await cached("reservoirs", 3600, fetchReservoirData);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Reservoirs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservoir data" },
      { status: 500 }
    );
  }
}
