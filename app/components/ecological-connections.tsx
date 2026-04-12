"use client";

import useSWR from "swr";
import { SectionHeader } from "./section-header";
import { formatNumber, cleanLocation } from "@/lib/format";
import type {
  RiversResponse,
  TidesResponse,
  TidePrediction,
  WeatherResponse,
  PollinatorsResponse,
  MigrationResponse,
  BirdsResponse,
  BirdSighting,
  PollinatorObservation,
} from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ConnectionEntry {
  title: string;
  body: React.ReactNode;
}

// Insectivorous birds and their feeding roles
const INSECTIVORE_ROLES: Record<string, string> = {
  oriole: "caterpillar predator",
  grosbeak: "caterpillar predator",
  cuckoo: "caterpillar specialist",
  warbler: "caterpillar specialist",
  vireo: "caterpillar gleaner",
  flycatcher: "aerial insect hunter",
  tanager: "caterpillar feeder",
  towhee: "ground-foraging insectivore",
  kingbird: "aerial insect hunter",
  phoebe: "aerial insect hunter",
  hummingbird: "nectar competitor",
};

function getInsectivoreRole(comName: string): string | null {
  const lower = comName.toLowerCase();
  for (const [key, role] of Object.entries(INSECTIVORE_ROLES)) {
    if (lower.includes(key)) return role;
  }
  return null;
}

function findNearbyPollinators(
  lat: number,
  lng: number,
  observations: PollinatorObservation[],
  radiusDeg: number = 0.3
): { bees: number; butterflies: number; butterflySpecies: string[] } {
  let bees = 0;
  let butterflies = 0;
  const bfSpecies = new Set<string>();
  for (const o of observations) {
    if (Math.abs(o.lat - lat) > radiusDeg || Math.abs(o.lng - lng) > radiusDeg) continue;
    const n = o.commonName.toLowerCase();
    if (n.includes("bee") || n.includes("honey") || n.includes("bumble")) {
      bees++;
    } else if (
      n.includes("butterfly") || n.includes("swallowtail") || n.includes("lady") ||
      n.includes("monarch") || n.includes("buckeye") || n.includes("skipper") ||
      n.includes("fritillary") || n.includes("cloak")
    ) {
      butterflies++;
      bfSpecies.add(o.commonName);
    }
  }
  return { bees, butterflies, butterflySpecies: [...bfSpecies] };
}

function getNextLowTide(
  stations: TidesResponse["stations"]
): { stationName: string; time: string; height: string } | null {
  const now = new Date();
  for (const station of stations) {
    for (const p of station.hiLo) {
      if (p.type === "L" && new Date(p.t.replace(" ", "T")) > now) {
        const t = new Date(p.t.replace(" ", "T"));
        const timeStr = t.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        return { stationName: station.name, time: timeStr, height: p.v };
      }
    }
  }
  return null;
}

export function EcologicalConnections() {
  const { data: rivers } = useSWR<RiversResponse>("/api/rivers", fetcher, { refreshInterval: 900000 });
  const { data: tides } = useSWR<TidesResponse>("/api/tides", fetcher, { refreshInterval: 360000 });
  const { data: weather } = useSWR<WeatherResponse>("/api/weather", fetcher, { refreshInterval: 1800000 });
  const { data: pollinators } = useSWR<PollinatorsResponse>("/api/pollinators", fetcher, { refreshInterval: 3600000 });
  const { data: migration } = useSWR<MigrationResponse>("/api/migration", fetcher, { refreshInterval: 21600000 });
  const { data: birds } = useSWR<BirdsResponse>("/api/birds", fetcher, { refreshInterval: 1800000 });

  // No hard gate — render whatever entries we can compute from available data
  const isLoading = !rivers && !tides && !weather && !pollinators && !birds;
  if (isLoading) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/birds/snowy-plover.png">Ecological Connections</SectionHeader>
        <div className="mt-4 space-y-4">
          <div className="h-3.5 w-48 bg-stone-200/50 rounded-sm animate-pulse" />
          <div className="h-12 w-full bg-stone-200/50 rounded-sm animate-pulse" />
          <div className="h-12 w-full bg-stone-200/50 rounded-sm animate-pulse" />
        </div>
      </section>
    );
  }

  const entries: ConnectionEntry[] = [];
  let predatorPreyEntry: ConnectionEntry | null = null;

  // --- 1. Shorebird habitat (river flow above average) ---
  if (rivers) {
    const sacramento = rivers.sites.find((s) => s.river === "Sacramento");
    if (sacramento && sacramento.currentFlow !== null) {
      const values = sacramento.discharge.map((r) => parseFloat(r.value)).filter((v) => v >= 0);
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      if (avg !== null && sacramento.currentFlow > avg) {
        const pctAbove = Math.round(((sacramento.currentFlow - avg) / avg) * 100);
        entries.push({
          title: "Shorebird habitat",
          body: (
            <>
              Sacramento River running{" "}
              <span className="font-mono tabular-nums font-semibold">{pctAbove}%</span>{" "}
              above 7-day mean. Delta wetlands expanding — favorable for shorebird feeding.
            </>
          ),
        });
      }
    }
  }

  // --- 2. Predator-prey overlap (insectivorous birds near pollinators) ---
  if (birds && birds.sightings.length > 0 && pollinators?.summary?.observations && pollinators.summary.observations.length > 0) {
    const polObs = pollinators.summary.observations;
    const insectivoreSightings: {
      bird: BirdSighting;
      role: string;
      nearby: { bees: number; butterflies: number; butterflySpecies: string[] };
    }[] = [];

    for (const s of birds.sightings) {
      const role = getInsectivoreRole(s.comName);
      if (!role || !s.lat || !s.lng) continue;
      const nearby = findNearbyPollinators(s.lat, s.lng, polObs);
      if (nearby.bees + nearby.butterflies >= 3) {
        insectivoreSightings.push({ bird: s, role, nearby });
      }
    }

    if (insectivoreSightings.length > 0) {
      // Pick the most interesting one (most nearby pollinators)
      insectivoreSightings.sort((a, b) =>
        (b.nearby.bees + b.nearby.butterflies) - (a.nearby.bees + a.nearby.butterflies)
      );
      const top = insectivoreSightings[0];
      const loc = cleanLocation(top.bird.locName);
      const totalNearby = top.nearby.bees + top.nearby.butterflies;

      const isHummingbird = top.bird.comName.toLowerCase().includes("hummingbird");
      const preyNote = isHummingbird
        ? `${top.nearby.bees} bee obs. nearby — nectar competition.`
        : top.nearby.butterflies > 0
          ? `${top.nearby.butterflies} butterfly obs. nearby${top.nearby.butterflySpecies.length > 0 ? ` (${top.nearby.butterflySpecies.slice(0, 2).join(", ")})` : ""}.`
          : `${totalNearby} pollinator obs. nearby.`;

      predatorPreyEntry = {
        title: "Predator-prey",
        body: (
          <>
            <em>{top.bird.sciName}</em> ({top.bird.comName}), {top.role}, at {loc} — outside typical range. {preyNote}
            {insectivoreSightings.length > 1 && (
              <> {insectivoreSightings.length - 1} other insectivores in active pollinator areas.</>
            )}
          </>
        ),
      };
    }
  }

  // --- 3. Pollinator conditions ---
  if (weather && pollinators?.summary) {
    const sacWeather = weather.cities.find((c) => c.city === "Sac");
    if (sacWeather && sacWeather.temperature > 65) {
      const isGoodConditions =
        sacWeather.condition === "Clear" || sacWeather.condition === "Cloudy";
      if (isGoodConditions) {
        entries.push({
          title: "Pollinator activity",
          body: (
            <>
              <span className="font-mono tabular-nums font-semibold">
                {Math.round(sacWeather.temperature)}°F
              </span>
              , {sacWeather.condition.toLowerCase()} in Sacramento — peak range for <em>Apis mellifera</em>.{" "}
              <span className="font-mono tabular-nums font-semibold">
                {formatNumber(pollinators.summary.beeCount)}
              </span>{" "}
              bee obs. statewide this week.
            </>
          ),
        });
      }
    }
    if (sacWeather && sacWeather.temperature < 60) {
      entries.push({
        title: "Pollinator activity",
        body: (
          <>
            <span className="font-mono tabular-nums font-semibold">
              {Math.round(sacWeather.temperature)}°F
            </span>{" "}
            in Sacramento — cool, suppressing pollinator flight. Expect reduced bee activity.
          </>
        ),
      });
    }
  }

  // --- 4. Tidal exposure ---
  if (tides) {
    const nextLow = getNextLowTide(tides.stations);
    if (nextLow) {
      entries.push({
        title: "Tidal exposure",
        body: (
          <>
            Low tide at {nextLow.stationName},{" "}
            <span className="font-mono tabular-nums font-semibold">{nextLow.time}</span>{" "}
            ({nextLow.height}m). Mudflats exposed — shorebird feeding window. <em>C. nivosus</em>, <em>T. semipalmata</em> concentrate at low-tide margins.
          </>
        ),
      });
    }
  }

  // --- 5. Seasonal signal ---
  if (migration && migration.today && migration.avg7d > 0) {
    const diff = migration.today.numSpecies - migration.avg7d;
    const pctDiff = Math.round((diff / migration.avg7d) * 100);
    if (Math.abs(pctDiff) >= 3) {
      const direction = diff > 0 ? "rising" : "declining";
      entries.push({
        title: "Seasonal signal",
        body: (
          <>
            <span className="font-mono tabular-nums font-semibold">
              {formatNumber(migration.today.numSpecies)}
            </span>{" "}
            species today, 7-day avg{" "}
            <span className="font-mono tabular-nums font-semibold">
              {formatNumber(migration.avg7d)}
            </span>{" "}
            — diversity {direction}. {diff > 0 ? "Spring passage intensifying." : "Post-breeding dispersal beginning."}
          </>
        ),
      });
    }
  }

  // --- 6. Plant–pollinator coupling ---
  if (pollinators?.summary) {
    const { plantCount, beeCount } = pollinators.summary;
    if (plantCount > 0 && beeCount > 0) {
      const ratio = Math.round(plantCount / beeCount);
      entries.push({
        title: "Plant–pollinator coupling",
        body: (
          <>
            <span className="font-mono tabular-nums font-semibold">
              {formatNumber(plantCount)}
            </span>{" "}
            plant obs. /{" "}
            <span className="font-mono tabular-nums font-semibold">
              {formatNumber(beeCount)}
            </span>{" "}
            bee obs. this week ({ratio}:1 ratio). Bloom typically leads pollinator peak by 5–10 days.
          </>
        ),
      });
    }
  }

  // Predator-prey goes last — qualitative, no bold data points
  if (predatorPreyEntry) entries.push(predatorPreyEntry);

  if (entries.length === 0) return null;

  return (
    <section>
      <SectionHeader illustration="/illustrations/birds/snowy-plover.png">Ecological Connections</SectionHeader>
      <div className="mt-4 space-y-5">
        {entries.map((entry) => (
          <div key={entry.title}>
            <h3 className="text-sm italic text-stone-700">{entry.title}</h3>
            <p className="mt-1 text-sm text-stone-600 leading-relaxed">
              {entry.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
