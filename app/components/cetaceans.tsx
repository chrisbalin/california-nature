"use client";

import useSWR from "swr";
import { SectionHeader } from "./section-header";
import { formatNumber, titleCase } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { SkeletonLine, SkeletonSpeciesEntry } from "./skeleton";
import type { CetaceansResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Cetaceans() {
  const { setFocusedSpecies } = useHighlight();
  const { data, error, isLoading } = useSWR<CetaceansResponse>(
    "/api/cetaceans",
    fetcher,
    { refreshInterval: 3600000, errorRetryCount: 3, errorRetryInterval: 5000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/cetaceans/humpback-whale.png">Cetaceans</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load cetacean data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/cetaceans/humpback-whale.png">Cetaceans</SectionHeader>
        <div className="mt-3 space-y-1.5">
          <SkeletonLine width="w-48" />
          <SkeletonLine width="w-32" height="h-2.5" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-8 max-sm:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonSpeciesEntry key={i} />)}
        </div>
      </section>
    );
  }

  if (data.species.length === 0) return null;

  function handleSpeciesHover(speciesName: string) {
    if (!data) return;
    const matching = data.observations.filter(
      (o) => o.species.toLowerCase() === speciesName.toLowerCase()
    );
    if (matching.length === 0) return;
    setFocusedSpecies({
      label: speciesName,
      color: "#7c3aed", // violet-600
      observations: matching.map((o) => ({ lat: o.lat, lng: o.lng })),
    });
  }

  function handleSpeciesLeave() {
    setFocusedSpecies(null);
  }

  return (
    <section>
      <SectionHeader illustration="/illustrations/cetaceans/humpback-whale.png">Cetaceans</SectionHeader>

      <p className="mt-3 text-sm text-stone-600">
        <span className="font-mono tabular-nums font-semibold text-stone-800">
          {formatNumber(data.totalObservations)}
        </span>{" "}
        whale and dolphin observations
        <span className="text-stone-300"> · </span>
        <span className="font-mono tabular-nums font-semibold text-stone-800">
          {data.species.length}
        </span>{" "}
        species
      </p>
      <p className="text-xs text-stone-400">last 30 days</p>

      <div className="mt-4 grid grid-cols-2 gap-x-8 max-sm:grid-cols-1">
        {data.species.slice(0, 8).map((sp) => (
          <div
            key={sp.scientificName}
            className="flex items-start justify-between gap-3 py-3 px-2 border-b border-stone-100 transition-colors duration-150 hover:bg-white/60 cursor-default"
            onMouseEnter={() => handleSpeciesHover(sp.name)}
            onMouseLeave={handleSpeciesLeave}
          >
            <div className="min-w-0">
              <div className="text-sm italic text-stone-800">{sp.scientificName}</div>
              <div className="text-sm text-stone-700">{titleCase(sp.name)}</div>
            </div>
            <div className="text-sm font-mono tabular-nums text-stone-800 whitespace-nowrap flex-shrink-0">
              {formatNumber(sp.count)} obs
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
