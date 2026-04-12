import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/lib/api";
import { cached } from "@/lib/cache";
import { TAXON_IDS, INAT_CALIFORNIA_PLACE_ID } from "@/lib/stations";
import type { PollinatorSummary, PollinatorsResponse, SpeciesCount } from "@/lib/types";

export const revalidate = 3600;

const INAT_BASE = "https://api.inaturalist.org/v1";

interface INatSpeciesCountResult {
  count: number;
  taxon: {
    name: string;
    preferred_common_name?: string;
  };
}

interface INatSpeciesCountResponse {
  total_results: number;
  results: INatSpeciesCountResult[];
}

interface INatObservation {
  id: number;
  taxon?: { name?: string; preferred_common_name?: string };
  location?: string;
  observed_on?: string;
}

interface INatObsResponse {
  total_results: number;
  results: INatObservation[];
}

/** Fetch top species with accurate counts via species_counts endpoint */
async function fetchSpeciesCounts(
  taxonId: number,
  d1: string,
  limit: number = 8
): Promise<{ total: number; species: SpeciesCount[] }> {
  const params = new URLSearchParams({
    taxon_id: taxonId.toString(),
    place_id: INAT_CALIFORNIA_PLACE_ID.toString(),
    d1,
    quality_grade: "research",
    per_page: limit.toString(),
  });

  const res = await fetchWithRetry(`${INAT_BASE}/observations/species_counts?${params}`);
  const data: INatSpeciesCountResponse = await res.json();

  const species: SpeciesCount[] = data.results.map((r) => ({
    name: r.taxon.preferred_common_name ?? r.taxon.name,
    scientificName: r.taxon.name,
    count: r.count,
  }));

  // Total observations = sum of all species counts (not total_results, which is species count)
  const totalObs = data.results.reduce((s, r) => s + r.count, 0);

  return { total: totalObs, species };
}

/** Fetch observations with location data for map dots */
async function fetchObservations(
  taxonId: number,
  d1: string
): Promise<INatObsResponse> {
  const params = new URLSearchParams({
    taxon_id: taxonId.toString(),
    place_id: INAT_CALIFORNIA_PLACE_ID.toString(),
    d1,
    quality_grade: "research",
    per_page: "200",
    order: "desc",
    order_by: "observed_on",
  });

  const res = await fetchWithRetry(`${INAT_BASE}/observations?${params}`);
  return res.json();
}

async function fetchPollinatorData(): Promise<PollinatorsResponse> {
    const d1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fetch species counts (accurate totals) and observations (map locations) in parallel
    const [
      beeCounts, plantCounts, butterflyCounts,
      beeObs, plantObs, butterflyObs,
    ] = await Promise.all([
      fetchSpeciesCounts(TAXON_IDS.bees, d1, 8),
      fetchSpeciesCounts(TAXON_IDS.plants, d1, 8),
      fetchSpeciesCounts(TAXON_IDS.butterflies, d1, 8),
      fetchObservations(TAXON_IDS.bees, d1),
      fetchObservations(TAXON_IDS.plants, d1),
      fetchObservations(TAXON_IDS.butterflies, d1),
    ]);

    const observations = [
      ...beeObs.results,
      ...plantObs.results,
      ...butterflyObs.results,
    ]
      .filter((o) => o.location)
      .map((o) => {
        const [lat, lng] = (o.location ?? "0,0").split(",").map(Number);
        return {
          id: o.id,
          taxonName: o.taxon?.name ?? "Unknown",
          commonName: o.taxon?.preferred_common_name ?? o.taxon?.name ?? "Unknown",
          lat,
          lng,
          observedOn: o.observed_on ?? "",
        };
      });

    const summary: PollinatorSummary = {
      beeCount: beeCounts.total,
      topBeeSpecies: beeCounts.species.slice(0, 5),
      butterflyCount: butterflyCounts.total,
      topButterflySpecies: butterflyCounts.species
        .filter((s) => s.scientificName !== "Danaus plexippus")
        .slice(0, 5),
      plantCount: plantCounts.total,
      topPlantSpecies: plantCounts.species.slice(0, 5),
      observations,
    };

    return {
      summary,
      fetchedAt: new Date().toISOString(),
    };
}

export async function GET() {
  try {
    const data = await cached("pollinators", 3600, fetchPollinatorData);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Pollinators API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pollinator data" },
      { status: 500 }
    );
  }
}
