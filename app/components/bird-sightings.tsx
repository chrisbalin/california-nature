"use client";

import useSWR from "swr";
import Image from "next/image";
import { SectionHeader } from "./section-header";
import { formatRelativeTime, cleanLocation, formatNumber } from "@/lib/format";
import { useHighlight } from "@/lib/highlight-context";
import { findBirdIllustration } from "@/lib/species";
import { SkeletonBirdEntry, SkeletonLine } from "./skeleton";
import type { BirdsResponse, BirdSighting, MigrationResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function BirdEntry({
  sighting,
  onHover,
  onLeave,
}: {
  sighting: BirdSighting;
  onHover: () => void;
  onLeave: () => void;
}) {
  const illustration = findBirdIllustration(sighting.speciesCode, sighting.comName);
  const count = sighting.howMany;
  const time = formatRelativeTime(sighting.obsDt);

  return (
    <div
      className="flex items-start gap-3 py-3 border-l border-stone-200 pl-3 transition-colors duration-150 hover:bg-white/60"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {illustration && (
        <Image
          src={illustration}
          alt={sighting.comName}
          width={56}
          height={56}
          className="flex-shrink-0 object-contain illustration-diecut"
        />
      )}
      <div className="min-w-0">
        <div className="text-sm italic text-stone-800">
          {sighting.sciName}
        </div>
        <div className="text-sm text-stone-700">
          {sighting.comName}
          <span className="text-stone-400"> · </span>
          <span className="text-stone-500">{cleanLocation(sighting.locName)}</span>
        </div>
        <div className="text-xs text-stone-400">
          {count != null && count > 0
            ? `${count} individual${count !== 1 ? "s" : ""}`
            : "Present"}
          <span className="text-stone-300"> · </span>
          {time}
        </div>
      </div>
    </div>
  );
}

export function BirdSightings() {
  const { setFocusedSpecies } = useHighlight();
  const { data, error, isLoading } = useSWR<BirdsResponse & { error?: string }>(
    "/api/birds",
    fetcher,
    { refreshInterval: 1800000 }
  );
  const { data: migrationData } = useSWR<MigrationResponse>(
    "/api/migration",
    fetcher,
    { refreshInterval: 21600000 }
  );

  function handleBirdHover(sighting: BirdSighting) {
    if (!sighting.lat || !sighting.lng) return;
    setFocusedSpecies({
      label: sighting.sciName,
      color: "#dc2626",
      observations: [{ lat: sighting.lat, lng: sighting.lng }],
    });
  }

  function handleBirdLeave() {
    setFocusedSpecies(null);
  }

  const today = migrationData?.today;

  if (error) {
    return (
      <section>
        <SectionHeader>Birds</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load bird data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Birds</SectionHeader>
        <div className="mt-3"><SkeletonLine width="w-64" /></div>
        <div className="mt-5 space-y-0 divide-y divide-stone-100">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonBirdEntry key={i} />)}
        </div>
      </section>
    );
  }

  if (data.error) {
    return (
      <section>
        <SectionHeader>Birds</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">
          Add EBIRD_API_KEY to .env.local to see bird data.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeader>Birds</SectionHeader>

      {/* Statewide stats */}
      {today && today.numSpecies > 0 && (
        <div className="mt-3">
          <p className="text-sm text-stone-600">
            <span className="font-mono tabular-nums font-semibold text-stone-800">
              {formatNumber(today.numSpecies)}
            </span>{" "}
            species reported across California{" "}
            {today.date === new Date().toISOString().split("T")[0] ? "today" : "yesterday"}
          </p>
          <p className="text-xs text-stone-400">
            <span className="font-mono tabular-nums">{formatNumber(today.numChecklists)}</span> checklists
            <span className="text-stone-300"> · </span>
            <span className="font-mono tabular-nums">{formatNumber(today.numContributors)}</span> observers
          </p>
        </div>
      )}

      {/* Notable sightings sub-section */}
      {data.sightings.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs italic text-stone-400">Notable sightings</h3>
          <div className="mt-2 space-y-0 divide-y divide-stone-100">
            {data.sightings.slice(0, 5).map((s, i) => (
              <BirdEntry
                key={`${s.speciesCode}-${s.locName}-${i}`}
                sighting={s}
                onHover={() => handleBirdHover(s)}
                onLeave={handleBirdLeave}
              />
            ))}
          </div>
        </div>
      )}

      {data.sightings.length === 0 && (
        <p className="text-sm text-stone-400 mt-3">
          No notable sightings in the last 48 hours.
        </p>
      )}
    </section>
  );
}
