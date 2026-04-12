"use client";

import useSWR from "swr";
import Image from "next/image";
import { SectionHeader } from "./section-header";
import { formatNumber, titleCase } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import {
  BEE_ILLUSTRATIONS,
  BUTTERFLY_ILLUSTRATIONS,
  FLOWER_ILLUSTRATIONS,
  findIllustration,
} from "@/lib/species";
import { SkeletonSpeciesEntry, SkeletonLine } from "./skeleton";
import type { PollinatorsResponse, PollinatorObservation, SpeciesCount } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function findObservations(
  observations: PollinatorObservation[],
  speciesName: string
): { lat: number; lng: number }[] {
  const lower = speciesName.toLowerCase();
  return observations
    .filter((o) => o.commonName.toLowerCase().includes(lower) && o.lat !== 0 && o.lng !== 0)
    .map((o) => ({ lat: o.lat, lng: o.lng }));
}

function SpeciesEntry({
  species,
  type,
  observations,
}: {
  species: SpeciesCount;
  type: "bee" | "butterfly" | "plant";
  observations: PollinatorObservation[];
}) {
  const { setFocusedSpecies } = useHighlight();
  const illustration = type === "bee"
    ? findIllustration(species.name, [BEE_ILLUSTRATIONS])
    : type === "butterfly"
      ? findIllustration(species.name, [BUTTERFLY_ILLUSTRATIONS])
      : findIllustration(species.name, [FLOWER_ILLUSTRATIONS]);

  const color = type === "plant" ? "#15803d" : "#f43f5e"; // green-700 for plants, rose-500 for pollinators

  function handleHover() {
    const obs = findObservations(observations, species.name);
    if (obs.length === 0) return;
    setFocusedSpecies({
      label: species.scientificName || species.name,
      color,
      observations: obs,
    });
  }

  function handleLeave() {
    setFocusedSpecies(null);
  }

  return (
    <div
      className="flex items-start justify-between gap-3 py-3 px-2 border-b border-stone-100 transition-colors duration-150 hover:bg-white/60 cursor-default"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <div className="flex items-start gap-3">
        <div className="w-[56px] h-[56px] flex-shrink-0 flex items-center justify-center">
          {illustration ? (
            <Image
              src={illustration}
              alt={species.name}
              width={56}
              height={56}
              className="object-contain illustration-diecut"
            />
          ) : (
            <Image
              src="/illustrations/elements/specimen-tag.png"
              alt=""
              width={40}
              height={48}
              className="object-contain"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="min-w-0">
          {species.scientificName && (
            <div className="text-sm italic text-stone-800">{species.scientificName}</div>
          )}
          <div className="text-sm text-stone-700">{titleCase(species.name)}</div>
        </div>
      </div>
      <div className="text-sm font-mono tabular-nums text-stone-800 whitespace-nowrap flex-shrink-0">
        {formatNumber(species.count)} obs
      </div>
    </div>
  );
}

export function PollinatorPlate() {
  const { data, error, isLoading } = useSWR<PollinatorsResponse>(
    "/api/pollinators",
    fetcher,
    { refreshInterval: 3600000, errorRetryCount: 3, errorRetryInterval: 5000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/bees/bumblebee-decorative.png">Pollinators &amp; Host Plants</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load pollinator data.</p>
      </section>
    );
  }

  if (isLoading || !data || !data.summary) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/bees/bumblebee-decorative.png">Pollinators &amp; Host Plants</SectionHeader>
        <div className="mt-5 space-y-1.5">
          <SkeletonLine width="w-56" />
          <SkeletonLine width="w-32" height="h-2.5" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-8 max-sm:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonSpeciesEntry key={i} />)}
        </div>
      </section>
    );
  }

  const summary = data?.summary;
  if (!summary) {
    return (
      <section>
        <SectionHeader illustration="/illustrations/bees/bumblebee-decorative.png">Pollinators &amp; Host Plants</SectionHeader>
        <div className="mt-5 space-y-1.5">
          <SkeletonLine width="w-56" />
          <SkeletonLine width="w-32" height="h-2.5" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-8 max-sm:grid-cols-1">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonSpeciesEntry key={i} />)}
        </div>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader illustration="/illustrations/bees/bumblebee-decorative.png">Pollinators &amp; Host Plants</SectionHeader>

      {/* Pollinators sub-section */}
      <div className="mt-5">
        <h3 className="text-xs italic text-stone-400">Pollinators</h3>
        <p className="mt-1 text-sm text-stone-600">
          <span className="font-mono tabular-nums font-semibold text-stone-800">
            {formatNumber(summary.beeCount)}
          </span>{" "}
          bee observations
          <span className="text-stone-300"> · </span>
          <span className="font-mono tabular-nums font-semibold text-stone-800">
            {formatNumber(summary.butterflyCount)}
          </span>{" "}
          Lepidoptera
        </p>
        <p className="text-xs text-stone-400">last 7 days</p>
        <div className="mt-3 grid grid-cols-2 gap-x-8 md:grid-cols-2 max-sm:grid-cols-1">
          {[
            ...summary.topBeeSpecies.slice(0, 4).map((sp) => ({ ...sp, type: "bee" as const })),
            ...summary.topButterflySpecies.slice(0, 4).map((sp) => ({ ...sp, type: "butterfly" as const })),
          ]
            .sort((a, b) => b.count - a.count)
            .map((sp) => (
              <SpeciesEntry
                key={sp.name}
                species={sp}
                type={sp.type}
                observations={summary.observations}
              />
            ))}
        </div>
      </div>

      {/* Host plants sub-section */}
      <div className="mt-8">
        <h3 className="text-xs italic text-stone-400">Host plants</h3>
        <p className="mt-1 text-sm text-stone-600">
          <span className="font-mono tabular-nums font-semibold text-stone-800">
            {formatNumber(summary.plantCount)}
          </span>{" "}
          plant observations
        </p>
        <p className="text-xs text-stone-400">last 7 days</p>
        <div className="mt-3 grid grid-cols-2 gap-x-8 md:grid-cols-2 max-sm:grid-cols-1">
          {summary.topPlantSpecies.slice(0, 4).map((sp) => (
            <SpeciesEntry
              key={sp.name}
              species={sp}
              type="plant"
              observations={summary.observations}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
