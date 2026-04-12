import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/api";
import { cached } from "@/lib/cache";
import type { CetaceansResponse, CetaceanSpecies, CetaceanObservation } from "@/lib/types";

export const revalidate = 3600;

const INAT_BASE = "https://api.inaturalist.org/v1";
const TAXON_ID = 152871; // Cetacea (whales, dolphins, porpoises)
const PLACE_ID = 14;     // California

async function fetchCetaceanData(): Promise<CetaceansResponse> {
  const d1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Fetch species counts and observations in parallel
  const [speciesRes, obsRes] = await Promise.all([
    fetchWithRetry(
      `${INAT_BASE}/observations/species_counts?taxon_id=${TAXON_ID}&place_id=${PLACE_ID}&d1=${d1}&quality_grade=research&per_page=15`
    ),
    fetchWithRetry(
      `${INAT_BASE}/observations?taxon_id=${TAXON_ID}&place_id=${PLACE_ID}&d1=${d1}&quality_grade=research&per_page=100&order=desc&order_by=observed_on`
    ),
  ]);

  const speciesData = speciesRes.ok ? await speciesRes.json() : { results: [] };
  const obsData = obsRes.ok ? await obsRes.json() : { results: [] };

  const species: CetaceanSpecies[] = (speciesData.results ?? []).map(
    (r: { count: number; taxon: { name: string; preferred_common_name?: string } }) => ({
      name: r.taxon.preferred_common_name ?? r.taxon.name,
      scientificName: r.taxon.name,
      count: r.count,
    })
  );

  const totalObservations = species.reduce((s, sp) => s + sp.count, 0);

  const observations: CetaceanObservation[] = (obsData.results ?? [])
    .filter((o: { location?: string }) => o.location)
    .map((o: { location: string; taxon?: { preferred_common_name?: string; name?: string } }) => {
      const [lat, lng] = o.location.split(",").map(Number);
      return {
        lat,
        lng,
        species: o.taxon?.preferred_common_name ?? o.taxon?.name ?? "Unknown",
      };
    })
    .filter((o: CetaceanObservation) => o.lat !== 0 && o.lng !== 0);

  return {
    totalObservations,
    species,
    observations,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const data = await cached(
      "cetaceans",
      3600,
      fetchCetaceanData,
      (d) => d.species.length === 0
    );
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Cetaceans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cetacean data" },
      { status: 500 }
    );
  }
}
