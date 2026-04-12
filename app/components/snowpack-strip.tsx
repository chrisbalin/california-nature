"use client";

import useSWR from "swr";
import { SectionHeader } from "./section-header";
import { SkeletonTideStation } from "./skeleton";
import type { SnowpackResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SnowpackStrip() {
  const { data, error, isLoading } = useSWR<SnowpackResponse>(
    "/api/snowpack",
    fetcher,
    { refreshInterval: 3600000, errorRetryCount: 3, errorRetryInterval: 5000 }
  );

  if (error) {
    return (
      <section>
        <SectionHeader>Sierra Snowpack</SectionHeader>
        <p className="text-sm text-stone-400 mt-3">Unable to load snowpack data.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section>
        <SectionHeader>Sierra Snowpack</SectionHeader>
        <p className="text-xs text-stone-400 mt-1">Inches of water in the snowpack</p>
        <div className="mt-4 flex gap-8">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonTideStation key={i} />)}
        </div>
      </section>
    );
  }

  const zones = data.zones.filter((z) => z.stationCount > 0);
  if (zones.length === 0) return null;

  // Find max SWE across zones for proportional bar width
  const maxSwe = Math.max(...zones.map((z) => z.avgSweInches), 1);
  const maxPeak = Math.max(...zones.map((z) => z.peakSweInches ?? 0), 1);
  const barMax = Math.max(maxSwe, maxPeak);

  return (
    <section>
      <SectionHeader>Sierra Snowpack</SectionHeader>
      <p className="text-xs text-stone-400 mt-1">Inches of water in the snowpack</p>

      <div className="mt-4 flex gap-8 overflow-x-auto">
        {zones.map((zone) => {
          const barWidth = Math.max((zone.avgSweInches / barMax) * 100, 4);

          return (
            <div key={zone.name} className="flex-shrink-0 min-w-[140px]">
              <div className="text-xs text-stone-500 uppercase tracking-[0.15em]">
                {zone.name}
              </div>
              <div className="font-mono tabular-nums text-sm font-semibold text-stone-800 mt-1">
                {zone.avgSweInches} inches
              </div>
              {/* Proportional bar — width encodes SWE */}
              <div
                className="h-[2px] bg-sky-700 mt-1.5 rounded-full"
                style={{ width: `${barWidth}%`, opacity: 0.6 }}
              />
              {zone.peakSweInches != null && zone.peakSweInches > 0 && (
                <div className="text-xs text-stone-400 mt-1">
                  Peak {zone.peakSweInches}″{zone.peakMonth ? ` in ${zone.peakMonth}` : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
