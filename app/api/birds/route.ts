import { NextResponse } from "next/server";
import type { BirdSighting, BirdsResponse } from "@/lib/types";

export const revalidate = 1800;

const EBIRD_BASE = "https://api.ebird.org/v2";

// Notable sightings from multiple CA hotspot regions
const REGIONS = [
  { lat: 37.77, lng: -122.42, label: "SF Bay Area" },
  { lat: 34.05, lng: -118.24, label: "Los Angeles" },
  { lat: 38.58, lng: -121.49, label: "Sacramento" },
  { lat: 36.97, lng: -122.03, label: "Santa Cruz" },
];

export async function GET() {
  const apiKey = process.env.EBIRD_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        sightings: [],
        fetchedAt: new Date().toISOString(),
        error: "EBIRD_API_KEY not configured. Add it to .env.local",
      },
      { status: 200 }
    );
  }

  try {
    const allSightings: BirdSighting[] = [];

    // Fetch notable sightings from each region in parallel
    const results = await Promise.all(
      REGIONS.map(async (region) => {
        const params = new URLSearchParams({
          lat: region.lat.toString(),
          lng: region.lng.toString(),
          dist: "50",
          back: "2", // last 2 days
        });

        const res = await fetch(
          `${EBIRD_BASE}/data/obs/geo/recent/notable?${params}`,
          { headers: { "X-eBirdApiToken": apiKey } }
        );

        if (!res.ok) return [];
        return res.json() as Promise<BirdSighting[]>;
      })
    );

    for (const regionSightings of results) {
      allSightings.push(...regionSightings);
    }

    // Deduplicate by speciesCode + locName, keep most recent
    const deduped = new Map<string, BirdSighting>();
    for (const s of allSightings) {
      const key = `${s.speciesCode}-${s.locName}`;
      const existing = deduped.get(key);
      if (!existing || s.obsDt > existing.obsDt) {
        deduped.set(key, s);
      }
    }

    // Sort by recency
    const sorted = [...deduped.values()].sort(
      (a, b) => new Date(b.obsDt).getTime() - new Date(a.obsDt).getTime()
    );

    const response: BirdsResponse = {
      sightings: sorted.slice(0, 20), // cap at 20 rows
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Birds API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bird data" },
      { status: 500 }
    );
  }
}
